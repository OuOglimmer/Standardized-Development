from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import settings


def _require_supabase_config() -> tuple[str, str]:
    if not settings.supabase_url or not settings.supabase_anon_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase auth env is not configured",
        )
    return settings.supabase_url.rstrip("/"), settings.supabase_anon_key


def _headers(token: str | None = None) -> dict[str, str]:
    _, anon_key = _require_supabase_config()
    return {
        "apikey": anon_key,
        "Authorization": f"Bearer {token or anon_key}",
        "Content-Type": "application/json",
    }


def _auth_error(response: httpx.Response) -> HTTPException:
    try:
        data = response.json()
    except ValueError:
        data = {}

    detail = data.get("error_description") or data.get("msg") or data.get("message")
    if not isinstance(detail, str):
        detail = f"Supabase auth failed with HTTP {response.status_code}"

    return HTTPException(status_code=response.status_code, detail=detail)


async def sign_up_with_password(email: str, password: str) -> dict[str, Any]:
    supabase_url, _ = _require_supabase_config()
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            f"{supabase_url}/auth/v1/signup",
            headers=_headers(),
            json={"email": email, "password": password},
        )

    if response.status_code >= 400:
        raise _auth_error(response)
    return response.json()


async def sign_in_with_password(email: str, password: str) -> dict[str, Any]:
    supabase_url, _ = _require_supabase_config()
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            f"{supabase_url}/auth/v1/token?grant_type=password",
            headers=_headers(),
            json={"email": email, "password": password},
        )

    if response.status_code >= 400:
        raise _auth_error(response)
    return response.json()


async def get_user(access_token: str) -> dict[str, Any]:
    supabase_url, _ = _require_supabase_config()
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            f"{supabase_url}/auth/v1/user",
            headers=_headers(access_token),
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return response.json()


async def sign_out(access_token: str) -> None:
    supabase_url, _ = _require_supabase_config()
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            f"{supabase_url}/auth/v1/logout",
            headers=_headers(access_token),
        )

    if response.status_code >= 400:
        raise _auth_error(response)
