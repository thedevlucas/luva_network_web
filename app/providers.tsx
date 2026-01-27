"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { MaintenanceGuard } from "./components/MaintenanceGuard";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <MaintenanceGuard>{children}</MaintenanceGuard>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
