const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

export const AUTH_TOKEN_KEY = "luva_auth_token"; //falta esto
export const AUTH_USER_KEY = "luva_auth_user"; //falta esto

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `API ${res.status} ${res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
