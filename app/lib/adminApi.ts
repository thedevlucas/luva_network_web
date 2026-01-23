import { apiFetch } from "./apiClient";

export type AdminStats = {
  totalUsers: number;
  totalNews: number;
  publishedNews: number;
  totalRanks: number;
  onlineUsers: number;
};

export const adminApi = {
  async stats(): Promise<AdminStats> {
    return apiFetch<AdminStats>("/api/admin/stats", { method: "GET" });
  },
};
