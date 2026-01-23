"use client"; // Importante: esto debe ser un Client Component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode } from "react";
import { MaintenanceGuard } from "./components/MaintenanceGuard";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";

export function Providers({ children }: { children: ReactNode }) {
  // Usamos useState para asegurar que el cliente solo se crea una vez
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
