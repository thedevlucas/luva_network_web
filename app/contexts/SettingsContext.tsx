"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { settingsApi } from "@/app/lib/settingsApi";
import type { GeneralSettings } from "@/app/lib/store";

interface SettingsContextType {
  settings: GeneralSettings | null;
  isLoading: boolean;
  updateSettings: (settings: Partial<GeneralSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const currentSettings = await settingsApi.get();
      setSettings(currentSettings);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = useCallback(async (newSettings: Partial<GeneralSettings>) => {
    const updated = await settingsApi.update(newSettings);
    setSettings(updated);
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
