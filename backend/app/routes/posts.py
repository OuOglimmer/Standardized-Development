from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models import Post, PostTag, Tag, User
from app.schemas import PostCreate, PostOut, PostUpdate

router = APIRouter(prefix="/api/posts", tags=["文章/日记"])


async def _load_post_tags(db: AsyncSession, post_ids: list[UUID]) -> dict[UUID, list[Tag]]:
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
    is_published: bool | None = Query(None),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    query = select(Post).order_by(Post.created_at.desc()).offset(offset).limit(limit)

    if diary_date is not None:
        query = query.where(Post.diary_date == diary_date)
    if is_published is not None:
        query = query.where(Post.is_published == is_published)

    result = await db.execute(query)
    posts = result.scalars().all()

    tag_map = await _load_post_tags(db, [p.id for p in posts])

    output = []
    for p in posts:
        post_out = PostOut.model_validate(p)
        post_out.tags = tag_map.get(p.id, [])
        output.append(post_out)
    return output


@router.get("/{slug}", response_model=PostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Post).where(Post.slug == slug))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    tag_map = await _load_post_tags(db, [post.id])
    post_out = PostOut.model_validate(post)
    post_out.tags = tag_map.get(post.id, [])
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
        emoji=body.emoji,
        diary_date=body.diary_date,
        author_id=current_user.id,
        is_published=body.is_published,
    )
    db.add(post)
    await db.flush()

    for tag_id in body.tag_ids:
        db.add(PostTag(post_id=post.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(post)

    tag_map = await _load_post_tags(db, [post.id])
    post_out = PostOut.model_validate(post)
    post_out.tags = tag_map.get(post.id, [])
    return post_out


@router.patch("/{post_id}", response_model=PostOut)
async def update_post(
    post_id: UUID,
    body: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    update_data = body.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    for field, value in update_data.items():
        setattr(post, field, value)

    if tag_ids is not None:
        await db.execute(PostTag.__table__.delete().where(PostTag.post_id == post_id))
        for tag_id in tag_ids:
            db.add(PostTag(post_id=post.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(post)

    tag_map = await _load_post_tags(db, [post.id])
    post_out = PostOut.model_validate(post)
    post_out.tags = tag_map.get(post.id, [])
    return post_out


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    if post.author_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

    await db.delete(post)
    await db.commit()
