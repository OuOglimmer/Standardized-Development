from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user, security
from app.auth.supabase import get_user, sign_in_with_password, sign_out, sign_up_with_password
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, LogoutResponse, TokenResponse, UserCreate, UserOut

router = APIRouter(prefix="/api/auth", tags=["认证"])


def _default_username(email: str) -> str:
    return email


def _supabase_user_id(auth_response: dict[str, object]) -> UUID:
    raw_user = auth_response.get("user")
    if not isinstance(raw_user, dict):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase did not return a user",
        )

    raw_id = raw_user.get("id")
    if not isinstance(raw_id, str):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase user ID is missing",
        )

    try:
        return UUID(raw_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Supabase user ID is invalid",
        ) from exc


def _token_response(auth_response: dict[str, object], user: User) -> TokenResponse:
    access_token = auth_response.get("access_token")
    if not isinstance(access_token, str) or not access_token:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Supabase requires email confirmation before issuing an access token",
        )

    refresh_token = auth_response.get("refresh_token")
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token if isinstance(refresh_token, str) else None,
        user=UserOut.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: AsyncSession = Depends(get_db)):
    if not settings.registration_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Registration is disabled",
        )

    email = str(body.email).lower()
    username = body.username or _default_username(email)

    existing = await db.execute(
        select(User).where(or_(User.email == email, User.username == username))
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or username already exists")

    auth_response = await sign_up_with_password(email, body.password)
    supabase_user_id = _supabase_user_id(auth_response)

    user = User(
        id=supabase_user_id,
        email=email,
        username=username,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return _token_response(auth_response, user)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = str(body.email).lower()
    auth_response = await sign_in_with_password(email, body.password)
    supabase_user_id = _supabase_user_id(auth_response)

    result = await db.execute(
        select(User).where(or_(User.id == supabase_user_id, User.email == email))
    )
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            id=supabase_user_id,
            email=email,
            username=_default_username(email),
            is_active=True,
        )
        db.add(user)
    elif not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    await db.commit()
    await db.refresh(user)

    return _token_response(auth_response, user)


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_active_user)):
    return UserOut.model_validate(current_user)


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user: User = Depends(get_current_active_user),
):
    await sign_out(credentials.credentials)
    return LogoutResponse(message=f"User {current_user.username} logged out")
