from datetime import date
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_admin_user, get_current_user, is_admin_user
from app.database import get_db
from app.models import Post, PostTag, Tag, User
from app.schemas import PostCreate, PostOrderUpdate, PostOut, PostUpdate, TagOut


def _orm_to_dict(instance) -> dict:
    """Convert SQLAlchemy ORM instance to dict, excluding relationships."""
    return {c.name: getattr(instance, c.name) for c in instance.__table__.columns}

router = APIRouter(prefix="/api/posts", tags=["文章/日记"])


async def _load_post_tags(db: AsyncSession, post_ids: list[UUID]) -> dict[UUID, list[Tag]]:
    if not post_ids:
        return {}

    result = await db.execute(
        select(PostTag).where(PostTag.post_id.in_(post_ids))
    )
    post_tag_rows = result.scalars().all()
    if not post_tag_rows:
        return {}

    tag_ids = list({pt.tag_id for pt in post_tag_rows})
    tags_result = await db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
    tags = {t.id: t for t in tags_result.scalars().all()}

    mapping: dict[UUID, list[Tag]] = {}
    for pt in post_tag_rows:
        mapping.setdefault(pt.post_id, []).append(tags[pt.tag_id])
    return mapping


@router.get("", response_model=list[PostOut])
async def list_posts(
    diary_date: date | None = Query(None),
    content_type: Literal["blog", "diary"] | None = Query(None),
    is_published: bool | None = Query(None),
    q: str | None = Query(None, min_length=1),
    tag: str | None = Query(None, min_length=1),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    # Ignore legacy rows that predate the NOT NULL title constraint. They are
    # kept in the database so their content can be repaired explicitly later.
    query = (
        select(Post)
        .where(Post.title.is_not(None), Post.deleted_at.is_(None))
    )

    if diary_date is not None:
        query = query.where(Post.diary_date == diary_date)
    if content_type == "blog":
        query = query.where(Post.diary_date.is_(None))
    elif content_type == "diary":
        query = query.where(Post.diary_date.is_not(None))
    if is_published is not None:
        query = query.where(Post.is_published == is_published)
    if q:
        pattern = f"%{q}%"
        query = query.where(
            or_(
                Post.title.ilike(pattern),
                Post.description.ilike(pattern),
                Post.content.ilike(pattern),
            )
        )
    if tag:
        query = query.join(PostTag, PostTag.post_id == Post.id).join(Tag, Tag.id == PostTag.tag_id)
        query = query.where(Tag.slug == tag)

    if content_type == "diary":
        query = query.order_by(Post.diary_date.desc(), Post.created_at.desc())
    elif content_type == "blog":
        query = query.order_by(
            Post.display_order.asc().nulls_last(),
            Post.created_at.desc(),
        )
    else:
        query = query.order_by(Post.created_at.desc())
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    posts = result.scalars().all()

    tag_map = await _load_post_tags(db, [p.id for p in posts])

    output = []
    for p in posts:
        post_out = PostOut.model_validate(_orm_to_dict(p))
        post_out.tags = [TagOut.model_validate(tag) for tag in tag_map.get(p.id, [])]
        output.append(post_out)
    return output


@router.patch("/order", status_code=status.HTTP_204_NO_CONTENT)
async def update_post_order(
    body: PostOrderUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
) -> None:
    blog_query = select(Post).where(
        Post.diary_date.is_(None),
        Post.is_published.is_(True),
        Post.deleted_at.is_(None),
    )
    result = await db.execute(blog_query)
    posts = result.scalars().all()
    posts_by_id = {post.id: post for post in posts}

    if not body.post_ids:
        for post in posts:
            post.display_order = None
    else:
        requested_ids = set(body.post_ids)
        if len(requested_ids) != len(body.post_ids) or requested_ids != set(posts_by_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="必须提交全部已发布 Blog 文章，不能重复或遗漏",
            )

        for position, post_id in enumerate(body.post_ids):
            posts_by_id[post_id].display_order = position

    await db.commit()


@router.get("/{slug}", response_model=PostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post).where(
            Post.slug == slug,
            Post.title.is_not(None),
            Post.deleted_at.is_(None),
        )
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    post.view_count += 1
    await db.commit()
    await db.refresh(post)

    tag_map = await _load_post_tags(db, [post.id])
    post_out = PostOut.model_validate(_orm_to_dict(post))
    post_out.tags = [TagOut.model_validate(tag) for tag in tag_map.get(post.id, [])]
    return post_out


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
async def create_post(
    body: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await db.execute(select(Post).where(Post.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    post = Post(
        title=body.title,
        slug=body.slug,
        content=body.content,
        content_format=body.content_format,
        source_filename=body.source_filename,
        description=body.description,
        cover_image=body.cover_image,
        emoji=body.emoji,
        diary_date=body.diary_date,
        author_id=current_user.id,
        reading_time=body.reading_time,
        is_published=body.is_published,
    )
    db.add(post)
    await db.flush()

    for tag_id in body.tag_ids:
        db.add(PostTag(post_id=post.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(post)

    tag_map = await _load_post_tags(db, [post.id])
    post_out = PostOut.model_validate(_orm_to_dict(post))
    post_out.tags = [TagOut.model_validate(tag) for tag in tag_map.get(post.id, [])]
    return post_out


@router.patch("/{post_id}", response_model=PostOut)
async def update_post(
    post_id: UUID,
    body: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Post).where(Post.id == post_id, Post.deleted_at.is_(None))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if post.author_id != current_user.id and not is_admin_user(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    update_data = body.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    new_slug = update_data.get("slug")
    if isinstance(new_slug, str) and new_slug != post.slug:
        existing = await db.execute(select(Post).where(Post.slug == new_slug))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    for field, value in update_data.items():
        setattr(post, field, value)

    if tag_ids is not None:
        await db.execute(PostTag.__table__.delete().where(PostTag.post_id == post_id))
        for tag_id in tag_ids:
            db.add(PostTag(post_id=post.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(post)

    tag_map = await _load_post_tags(db, [post.id])
    post_out = PostOut.model_validate(_orm_to_dict(post))
    post_out.tags = [TagOut.model_validate(tag) for tag in tag_map.get(post.id, [])]
    return post_out


@router.put("/{post_id}", response_model=PostOut)
async def replace_post(
    post_id: UUID,
    body: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await update_post(post_id, body, db, current_user)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Post).where(Post.id == post_id, Post.deleted_at.is_(None))
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if post.author_id != current_user.id and not is_admin_user(current_user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    await db.execute(delete(Post).where(Post.id == post.id))
    await db.commit()
