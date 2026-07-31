import { getAccessToken } from "./supabase-auth";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api`
).replace(/\/$/, "");

function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${API_BASE}${normalizedPath.slice(4)}`;
  }
  if (!API_BASE.endsWith("/api") && !normalizedPath.startsWith("/api/")) {
    return `${API_BASE}/api${normalizedPath}`;
  }
  return `${API_BASE}${normalizedPath}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAccessToken();
  let res: Response;
  try {
    res = await fetch(buildApiUrl(path), {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      ...options,
    });
  } catch {
    throw new Error(`无法连接后端服务：${API_BASE}`);
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

export function del(path: string): Promise<void> {
  return request<void>(path, { method: "DELETE" });
}
