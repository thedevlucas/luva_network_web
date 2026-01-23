"use client";

import React from "react"

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AlertTriangle, Clock, Wrench, Youtube, Facebook, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import type { GeneralSettings } from "@/app/lib/store";
import { settingsApi } from "@/app/lib/settingsApi";
import Image from "next/image";
import heroBg from "@/app/assets/bg_1768898406606.png";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-4"
      >
        <p className="text-[#965CD9] font-bold text-lg">El mantenimiento deberia estar terminando pronto...</p>
        <p className="text-gray-400 text-sm mt-2">Refresca la pagina en unos minutos</p>
      </motion.div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-6 justify-center mt-8 flex-wrap">
      {[
        { label: "Dias", value: timeLeft.days },
        { label: "Horas", value: timeLeft.hours },
        { label: "Minutos", value: timeLeft.minutes },
        { label: "Segundos", value: timeLeft.seconds },
      ].map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center bg-[#1a1a24]/80 backdrop-blur-md border border-[#965CD9]/30 rounded-2xl p-4 sm:p-6 min-w-[70px] sm:min-w-[90px] shadow-lg shadow-[#965CD9]/10"
        >
          <motion.span 
            key={item.value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-3xl sm:text-5xl font-display text-white drop-shadow-lg"
          >
            {String(item.value).padStart(2, "0")}
          </motion.span>
          <span className="text-xs sm:text-sm text-[#965CD9] uppercase tracking-wider mt-2 font-bold">{item.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

function MaintenancePage({ settings }: { settings: GeneralSettings }) {
  const showCountdown = settings.webMaintenanceShowCountdown && !!settings.webMaintenanceEndDate;
  const siteName = settings.siteName || "LuvaNetwork";

  const socialLinks = [
    { icon: DiscordIcon, url: settings.discordUrl, label: "Discord", color: "hover:bg-[#5865F2]" },
    { icon: Youtube, url: settings.youtubeUrl, label: "YouTube", color: "hover:bg-red-600" },
    { icon: XIcon, url: settings.twitterUrl, label: "X", color: "hover:bg-black" },
    { icon: Instagram, url: settings.instagramUrl, label: "Instagram", color: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500" },
    { icon: Facebook, url: settings.facebookUrl, label: "Facebook", color: "hover:bg-[#1877F2]" },
  ].filter(link => link.url);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0e] flex items-center justify-center p-4 overflow-auto">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg || "/placeholder.svg"}
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0e]/60 via-[#0a0a0e]/80 to-[#0a0a0e]" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#965CD9]/20 rounded-full blur-3xl" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFC107]/10 rounded-full blur-3xl" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative max-w-2xl w-full text-center py-12"
      >
        {/* Logo/Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="w-32 h-32 bg-[#965CD9]/20 rounded-full flex items-center justify-center border border-[#965CD9]/30">
              <Wrench className="w-14 h-14 text-[#965CD9]" />
            </div>
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-10 h-10 bg-[#FFC107] rounded-full flex items-center justify-center shadow-lg"
            >
              <AlertTriangle className="w-6 h-6 text-[#0a0a0e]" />
            </motion.div>
          </div>
        </motion.div>

        {/* Site name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className="font-display text-3xl text-white">
            {siteName.toUpperCase().includes("LUVA") ? (
              <>LUVA<span className="text-[#965CD9]">NETWORK</span></>
            ) : (
              <span>{siteName}</span>
            )}
          </span>
        </motion.div>

        {/* Main title */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-6xl font-display text-white mb-4 drop-shadow-lg"
        >
          SITIO EN{" "}
          <span className="text-[#FFC107]">MANTENIMIENTO</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-400 mb-8 max-w-md mx-auto leading-relaxed"
        >
          Estamos realizando mejoras para brindarte una mejor experiencia. Vuelve pronto.
        </motion.p>

        {/* Custom message */}
        {settings.webMaintenanceMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1a1a24]/80 backdrop-blur-md border border-[#965CD9]/30 rounded-2xl p-6 mb-8 max-w-lg mx-auto"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#965CD9]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-[#965CD9]" />
              </div>
              <p className="text-gray-200 text-left leading-relaxed">{settings.webMaintenanceMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Countdown */}
        {showCountdown && settings.webMaintenanceEndDate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
              <Clock className="w-5 h-5 text-[#965CD9]" />
              <span className="font-medium">Tiempo estimado restante</span>
            </div>
            <CountdownTimer targetDate={settings.webMaintenanceEndDate} />
          </motion.div>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <p className="text-sm text-gray-500">Mientras tanto, puedes seguirnos en nuestras redes</p>
            <div className="flex gap-3 flex-wrap justify-center">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-12 h-12 rounded-xl bg-[#1a1a24] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 ${link.color}`}
                    aria-label={link.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Server IP */}
        {settings.serverIp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10"
          >
            <p className="text-gray-500 text-sm mb-2">El servidor de juego sigue activo:</p>
            <div className="inline-block font-mono text-sm text-[#FFC107] bg-[#1a1a24]/80 px-6 py-3 rounded-lg border border-white/10">
              IP: <span className="text-white font-bold">{settings.serverIp}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Allow admin to access the panel even while the website is in maintenance mode
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const s = await settingsApi.get();
        if (mounted) setSettings(s);
      } catch {
        // If settings fetch fails, don't block the site
        if (mounted) setSettings(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading) return <>{children}</>;

  if (!isAdminRoute && settings?.webMaintenance) {
    return <MaintenancePage settings={settings} />;
  }

  return <>{children}</>;
}
