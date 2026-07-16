from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    id: UUID
    username: str
    avatar_url: str | None = None
    bio: str | None = None
    location: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TagOut(BaseModel):
    id: UUID
    name: str
    slug: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PostCreate(BaseModel):
    title: str | None = None
    slug: str
    content: str
    emoji: str = ""
    diary_date: date | None = None
    is_published: bool = True
    tag_ids: list[UUID] = []


class PostUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    emoji: str | None = None
    diary_date: date | None = None
    is_published: bool | None = None
    tag_ids: list[UUID] | None = None


class PostOut(BaseModel):
    id: UUID
    title: str | None = None
    slug: str
    content: str
    emoji: str
    diary_date: date | None = None
    author_id: UUID
    is_published: bool
    reading_time: int = 0
    view_count: int = 0
    created_at: datetime
    updated_at: datetime
    tags: list[TagOut] = []

    model_config = ConfigDict(from_attributes=True)


class ProjectCreate(BaseModel):
    title: str
    description: str
    type: str = "wide"
    accent: str = ""
    sort_order: int = 0
    slug: str
    github_url: str | None = None
    website_url: str | None = None
    content: str | None = None
    featured_image: str | None = None
    tag_ids: list[UUID] = []


class ProjectUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    type: str | None = None
    accent: str | None = None
    sort_order: int | None = None
    slug: str | None = None
    github_url: str | None = None
    website_url: str | None = None
    content: str | None = None
    featured_image: str | None = None
    tag_ids: list[UUID] | None = None


class ProjectOut(BaseModel):
    id: UUID
    title: str
    description: str
    type: str
    accent: str
    sort_order: int
    slug: str | None = None
    github_url: str | None = None
    website_url: str | None = None
    content: str | None = None
    featured_image: str | None = None
    created_at: datetime
    updated_at: datetime
    tags: list[TagOut] = []

    model_config = ConfigDict(from_attributes=True)


class CommentCreate(BaseModel):
    content: str
    parent_id: UUID | None = None


class CommentOut(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    content: str
    parent_id: UUID | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
