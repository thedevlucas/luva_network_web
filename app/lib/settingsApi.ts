import type { GeneralSettings } from "./store";
import { apiFetch } from "./apiClient";

export const settingsApi = {
  async get(): Promise<GeneralSettings> {
    return apiFetch<GeneralSettings>("/api/settings/general", { method: "GET" });
  },

  async update(payload: Partial<GeneralSettings>): Promise<GeneralSettings> {
    return apiFetch<GeneralSettings>("/api/settings/general", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
