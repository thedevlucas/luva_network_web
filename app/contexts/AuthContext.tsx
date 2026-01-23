"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { authApi, type AuthSession } from "@/app/lib/authApi";

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const existingSession = authApi.getSession();
    setSession(existingSession);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const newSession = await authApi.login(username, password);
      setSession(newSession);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        login,
        logout,
        isAuthenticated: session !== null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
