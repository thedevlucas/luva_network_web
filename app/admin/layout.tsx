"use client";

import React from "react"

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Settings,
  Crown,
  Newspaper,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { SettingsProvider } from "@/app/contexts/SettingsContext";
import logoImg from "@/app/assets/logoluva_1768898408478.png";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/config", label: "Configuracion", icon: Settings },
  { href: "/admin/ranks", label: "Rangos", icon: Crown },
  { href: "/admin/groups", label: "Grupos", icon: Shield },
  { href: "/admin/news", label: "Noticias", icon: Newspaper },
  { href: "/admin/users", label: "Usuarios", icon: Users },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isLoading, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't redirect if we're on the login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, router, isLoginPage]);

  // Show login page without admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e]">
        <div className="w-8 h-8 border-2 border-[#965CD9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't show admin layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0e] flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#12121a] border-r border-white/5 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src={logoImg || "/placeholder.svg"}
                alt="LuvaNetwork"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <span className="font-display text-lg text-white block">
                  LUVA<span className="text-[#965CD9]">NETWORK</span>
                </span>
                <span className="text-xs text-gray-500">Admin Panel</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-[#965CD9]/20 text-[#B58CFF] border border-[#965CD9]/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-white/5">
            <div className="bg-[#1a1a24] rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#965CD9]/20 flex items-center justify-center text-[#965CD9] font-bold uppercase">
                  {session?.username.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{session?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{session?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden bg-[#12121a] border-b border-white/5 p-4 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display text-white">Admin Panel</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SettingsProvider>
    </AuthProvider>
  );
}
