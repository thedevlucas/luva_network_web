import { apiFetch } from "./apiClient";
import type { NewsPost } from "./store";

export type PublicNewsPost = Pick<
  NewsPost,
  "id" | "slug" | "title" | "excerpt" | "content" | "coverImageUrl" | "createdAt"
>;

export const newsApi = {
  async listPublic(): Promise<PublicNewsPost[]> {
    return apiFetch<PublicNewsPost[]>("/api/news", { method: "GET" });
  },

  async getPublic(slug: string): Promise<PublicNewsPost> {
    return apiFetch<PublicNewsPost>(`/api/news/${encodeURIComponent(slug)}`, { method: "GET" });
  },

  async listAdmin(): Promise<NewsPost[]> {
    return apiFetch<NewsPost[]>("/api/admin/news", { method: "GET" });
  },

  async create(payload: Partial<NewsPost>): Promise<NewsPost> {
    return apiFetch<NewsPost>("/api/admin/news", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: Partial<NewsPost>): Promise<NewsPost> {
    return apiFetch<NewsPost>(`/api/admin/news/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/admin/news/${id}`, { method: "DELETE" });
  },
};
