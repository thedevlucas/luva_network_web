"use client";

import { apiFetch, AUTH_TOKEN_KEY, AUTH_USER_KEY } from "./apiClient";

export type ApiLoginResponse = {
  token: string;
  user: { id: number; username: string; role: "admin" };
};

export type AuthSession = {
  userId: string;
  username: string;
  role: "admin";
  loginAt: string;
  token: string;
};

function readUser(): ApiLoginResponse["user"] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const authApi = {
  getSession(): AuthSession | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = readUser();
    if (!token || !user) return null;
    return {
      userId: String(user.id),
      username: user.username,
      role: "admin",
      loginAt: new Date().toISOString(),
      token,
    };
  },

  async login(username: string, password: string): Promise<AuthSession> {
    const data = await apiFetch<ApiLoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    }

    return {
      userId: String(data.user.id),
      username: data.user.username,
      role: "admin",
      loginAt: new Date().toISOString(),
      token: data.token,
    };
  },

  logout(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getSession();
  },
};
