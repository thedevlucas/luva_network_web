import { apiFetch } from "./apiClient";
import type { ServerUser } from "./store";

export const serverUsersApi = {
  async list(): Promise<ServerUser[]> {
    return apiFetch<ServerUser[]>("/api/admin/users", { method: "GET" });
  },
};
