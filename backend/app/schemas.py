from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
MAX_POST_CONTENT_LENGTH = 1_048_576


class UserOut(BaseModel):
    id: UUID
    email: str = Field(pattern=EMAIL_PATTERN, max_length=255)
    username: str
    is_active: bool
    avatar_url: str | None = None
    bio: str | None = None
    location: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserCreate(BaseModel):
    email: str = Field(pattern=EMAIL_PATTERN, max_length=255)
    username: str | None = Field(default=None, min_length=2, max_length=80)
    password: str = Field(min_length=8, max_length=72)


class TagOut(BaseModel):
    id: UUID
    name: str
    slug: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    slug: str = Field(min_length=1, max_length=80, pattern=r"^[a-z0-9-]+$")


class PostCreate(BaseModel):
    title: str
    slug: str = Field(min_length=1, max_length=160, pattern=r"^[a-z0-9-]+$")
    content: str = Field(min_length=1, max_length=MAX_POST_CONTENT_LENGTH)
    content_format: Literal["plain", "markdown"] = "plain"
    source_filename: str | None = Field(default=None, max_length=255)
    description: str | None = None
    cover_image: str | None = None
    emoji: str = ""
    diary_date: date | None = None
    reading_time: int = Field(default=0, ge=0)
    is_published: bool = True
    tag_ids: list[UUID] = Field(default_factory=list)


class PostUpdate(BaseModel):
    title: str | None = None
    slug: str | None = Field(default=None, min_length=1, max_length=160, pattern=r"^[a-z0-9-]+$")
    content: str | None = Field(default=None, min_length=1, max_length=MAX_POST_CONTENT_LENGTH)
    content_format: Literal["plain", "markdown"] | None = None
    source_filename: str | None = Field(default=None, max_length=255)
    description: str | None = None
    cover_image: str | None = None
    emoji: str | None = None
    diary_date: date | None = None
    reading_time: int | None = Field(default=None, ge=0)
    is_published: bool | None = None
    tag_ids: list[UUID] | None = None


class PostOut(BaseModel):
    id: UUID
    title: str
    slug: str
    content: str
    content_format: Literal["plain", "markdown"]
    source_filename: str | None = None
    description: str | None = None
    cover_image: str | None = None
    emoji: str
    diary_date: date | None = None
    author_id: UUID
    is_published: bool
    reading_time: int = 0
    view_count: int = 0
    created_at: datetime
    updated_at: datetime
    tags: list[TagOut] = Field(default_factory=list)

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
    tag_ids: list[UUID] = Field(default_factory=list)


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
    tags: list[TagOut] = Field(default_factory=list)

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
    email: str = Field(pattern=EMAIL_PATTERN, max_length=255)
    password: str = Field(min_length=1, max_length=72)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"
    user: UserOut


class LogoutResponse(BaseModel):
    message: str
