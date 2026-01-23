"use client";

import React from "react"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, AlertCircle, Loader2, Shield } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import logoImg from "@/app/assets/logoluva_1768898408478.png";

export default function AdminLogin() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim() || !password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        router.push("/admin");
      } else {
        setError("Credenciales incorrectas. Solo usuarios del servidor con permisos de admin pueden acceder.");
      }
    } catch (err) {
      setError("Error al iniciar sesion. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e]">
        <Loader2 className="w-8 h-8 animate-spin text-[#965CD9]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0e] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#965CD9]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFC107]/5 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="bg-[#1a1a24] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-[#965CD9]/10 rounded-2xl mb-4 border border-[#965CD9]/20"
            >
              <Image 
                src={logoImg || "/placeholder.svg"}
                alt="LuvaNetwork"
                width={48}
                height={48}
                className="object-contain"
              />
            </motion.div>
            
            <h1 className="text-3xl font-display text-white mb-2">
              ADMIN PANEL
            </h1>
            <p className="text-gray-400 text-sm">
              Acceso restringido a administradores
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Usuario del servidor
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario en el servidor"
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contrasena de admin"
                  className="w-full pl-12 pr-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-[#965CD9] hover:bg-[#A878E6] disabled:bg-[#965CD9]/50 text-white font-display font-bold uppercase py-4 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesion...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Iniciar Sesion
                </>
              )}
            </motion.button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-center text-gray-500 text-xs">
              Solo usuarios registrados en el servidor con grupo <span className="text-[#965CD9]">admin</span> pueden acceder.
            </p>
          </div>
        </div>

        {/* Back to site link */}
        <div className="text-center mt-6">
          <a 
            href="/"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Volver al sitio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
