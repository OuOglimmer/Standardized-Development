from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models import Project, ProjectTag, Tag, User
from app.schemas import ProjectCreate, ProjectOut, ProjectUpdate, TagOut


def _orm_to_dict(instance) -> dict:
    """Convert SQLAlchemy ORM instance to dict, excluding relationships."""
    return {c.name: getattr(instance, c.name) for c in instance.__table__.columns}

router = APIRouter(prefix="/api/projects", tags=["作品集"])


async def _load_project_tags(db: AsyncSession, project_ids: list[UUID]) -> dict[UUID, list[Tag]]:
    result = await db.execute(
        select(ProjectTag).where(ProjectTag.project_id.in_(project_ids))
    )
    pt_rows = result.scalars().all()
    if not pt_rows:
        return {}

    tag_ids = list({pt.tag_id for pt in pt_rows})
    tags_result = await db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
    tags = {t.id: t for t in tags_result.scalars().all()}

    mapping: dict[UUID, list[Tag]] = {}
    for pt in pt_rows:
        mapping.setdefault(pt.project_id, []).append(tags[pt.tag_id])
    return mapping


@router.get("", response_model=list[ProjectOut])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.sort_order))
    projects = result.scalars().all()

    tag_map = await _load_project_tags(db, [p.id for p in projects])

    output = []
    for p in projects:
        out = ProjectOut.model_validate(_orm_to_dict(p))
        out.tags = [TagOut.model_validate(tag) for tag in tag_map.get(p.id, [])]
        output.append(out)
    return output


@router.get("/{slug}", response_model=ProjectOut)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    tag_map = await _load_project_tags(db, [project.id])
    out = ProjectOut.model_validate(_orm_to_dict(project))
    out.tags = [TagOut.model_validate(tag) for tag in tag_map.get(project.id, [])]
    return out


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
async def create_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await db.execute(select(Project).where(Project.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Slug already exists")

    project = Project(
        title=body.title,
        description=body.description,
        type=body.type,
        accent=body.accent,
        sort_order=body.sort_order,
        slug=body.slug,
        github_url=body.github_url,
        website_url=body.website_url,
        content=body.content,
        featured_image=body.featured_image,
    )
    db.add(project)
    await db.flush()

    for tag_id in body.tag_ids:
        db.add(ProjectTag(project_id=project.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(project)

    tag_map = await _load_project_tags(db, [project.id])
    out = ProjectOut.model_validate(_orm_to_dict(project))
    out.tags = [TagOut.model_validate(tag) for tag in tag_map.get(project.id, [])]
    return out


@router.patch("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: UUID,
    body: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    update_data = body.model_dump(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    for field, value in update_data.items():
        setattr(project, field, value)

    if tag_ids is not None:
        await db.execute(ProjectTag.__table__.delete().where(ProjectTag.project_id == project_id))
        for tag_id in tag_ids:
            db.add(ProjectTag(project_id=project.id, tag_id=tag_id))

    await db.commit()
    await db.refresh(project)

    tag_map = await _load_project_tags(db, [project.id])
    out = ProjectOut.model_validate(_orm_to_dict(project))
    out.tags = [TagOut.model_validate(tag) for tag in tag_map.get(project.id, [])]
    return out


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    await db.delete(project)
    await db.commit()
