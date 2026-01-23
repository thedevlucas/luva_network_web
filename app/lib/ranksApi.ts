import { apiFetch } from "./apiClient";
import type { Rank } from "./store";

export const ranksApi = {
  async list(): Promise<Rank[]> {
    return apiFetch<Rank[]>("/api/ranks", { method: "GET" });
  },

  async create(payload: Omit<Rank, "id">): Promise<Rank> {
    return apiFetch<Rank>("/api/admin/ranks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: Partial<Rank>): Promise<Rank> {
    return apiFetch<Rank>(`/api/admin/ranks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/admin/ranks/${id}`, { method: "DELETE" });
  },
};
