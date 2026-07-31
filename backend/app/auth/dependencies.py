from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.supabase import get_user
from app.config import settings
from app.database import get_db
from app.models import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    auth_user = await get_user(credentials.credentials)
    raw_id = auth_user.get("id")
    raw_email = auth_user.get("email")
    if not isinstance(raw_id, str) or not isinstance(raw_email, str):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        user_id = UUID(raw_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        # Compatibility fallback for users created before Supabase Auth migration.
        result = await db.execute(select(User).where(User.email == raw_email.lower()))
        user = result.scalar_one_or_none()

    if user is None:
        user = User(
            id=user_id,
            email=raw_email.lower(),
            username=raw_email.lower(),
            is_active=True,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


async def get_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not settings.admin_email:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin email is not configured",
        )

    if current_user.email.lower() != settings.admin_email.lower():
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    return current_user


def is_admin_user(user: User) -> bool:
    return bool(settings.admin_email and user.email.lower() == settings.admin_email.lower())
