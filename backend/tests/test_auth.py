import asyncio
import os
import sys
from collections.abc import AsyncGenerator, Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite://")
os.environ.setdefault("JWT_SECRET", "")
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("ADMIN_EMAIL", "author@example.com")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base, get_db
from app.main import app

SUPABASE_USER_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa"
SUPABASE_EMAIL = "author@example.com"


@pytest.fixture()
def client(monkeypatch: pytest.MonkeyPatch) -> Generator[TestClient, None, None]:
    engine = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    test_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def init_db() -> None:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def close_db() -> None:
        await engine.dispose()

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with test_session() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise

    async def fake_sign_up_with_password(email: str, password: str) -> dict[str, object]:
        return auth_response(email)

    async def fake_sign_in_with_password(email: str, password: str) -> dict[str, object]:
        if password != "password123":
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid credentials")
        return auth_response(email)

    async def fake_get_user(access_token: str) -> dict[str, object]:
        if access_token != "supabase-access-token":
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return {"id": SUPABASE_USER_ID, "email": SUPABASE_EMAIL}

    async def fake_sign_out(access_token: str) -> None:
        if access_token != "supabase-access-token":
            from fastapi import HTTPException, status

            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    monkeypatch.setattr("app.routes.auth.sign_up_with_password", fake_sign_up_with_password)
    monkeypatch.setattr("app.routes.auth.sign_in_with_password", fake_sign_in_with_password)
    monkeypatch.setattr("app.routes.auth.sign_out", fake_sign_out)
    monkeypatch.setattr("app.auth.dependencies.get_user", fake_get_user)
    monkeypatch.setattr("app.routes.auth.get_user", fake_get_user)

    asyncio.run(init_db())
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    asyncio.run(close_db())


def auth_response(email: str) -> dict[str, object]:
    return {
        "access_token": "supabase-access-token",
        "refresh_token": "supabase-refresh-token",
        "user": {"id": SUPABASE_USER_ID, "email": email},
    }


def auth_headers(token: str = "supabase-access-token") -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_register_uses_supabase_auth(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={"email": SUPABASE_EMAIL, "password": "password123"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["access_token"] == "supabase-access-token"
    assert body["refresh_token"] == "supabase-refresh-token"
    assert body["user"]["username"] == SUPABASE_EMAIL


def test_login_uses_supabase_auth(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"email": SUPABASE_EMAIL, "password": "password123"},
    )

    assert response.status_code == 200
    assert response.json()["access_token"] == "supabase-access-token"


def test_me_validates_supabase_token(client: TestClient) -> None:
    response = client.get("/api/auth/me", headers=auth_headers())

    assert response.status_code == 200
    assert response.json()["username"] == SUPABASE_EMAIL


def test_logout_calls_supabase_auth(client: TestClient) -> None:
    response = client.post("/api/auth/logout", headers=auth_headers())

    assert response.status_code == 200
    assert response.json()["message"] == f"User {SUPABASE_EMAIL} logged out"
