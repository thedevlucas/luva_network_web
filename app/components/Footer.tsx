"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Youtube, Instagram, Zap, Facebook } from "lucide-react";
import { useSettings } from "@/app/contexts/SettingsContext";

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

export function Footer() {
  const { settings } = useSettings();
  const [loadSeconds, setLoadSeconds] = useState<number | null>(null);

  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (nav?.duration && Number.isFinite(nav.duration)) {
      setLoadSeconds(nav.duration / 1000);
      return;
    }

    setLoadSeconds(performance.now() / 1000);
  }, []);

  const loadLabel = useMemo(() => {
    if (loadSeconds == null) return "Cargando sitio...";
    return `Sitio cargado en ${loadSeconds.toFixed(3)}s`;
  }, [loadSeconds]);

  const siteName = settings?.siteName || "LuvaNetwork";
  const siteDescription = settings?.siteDescription || "Network hispanohablante de Hytale en construcción: minijuegos, sistemas propios y comunidad metiendo mano desde el día uno.";

  const socialLinks = useMemo(() => {
    if (!settings) return [];
    
    const links: { icon: React.ComponentType<{ className?: string }>; href: string; label: string }[] = [];
    
    if (settings.twitterUrl) links.push({ icon: XIcon, href: settings.twitterUrl, label: "X" });
    if (settings.youtubeUrl) links.push({ icon: Youtube, href: settings.youtubeUrl, label: "YouTube" });
    if (settings.discordUrl) links.push({ icon: DiscordIcon, href: settings.discordUrl, label: "Discord" });
    if (settings.instagramUrl) links.push({ icon: Instagram, href: settings.instagramUrl, label: "Instagram" });
    if (settings.facebookUrl) links.push({ icon: Facebook, href: settings.facebookUrl, label: "Facebook" });
    
    return links;
  }, [settings]);

  return (
    <footer className="bg-[#0a0a0e] pt-16 pb-8 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-display text-2xl text-white">
                {siteName.toUpperCase().includes("LUVA") ? (
                  <>LUVA<span className="text-[#965CD9]">NETWORK</span></>
                ) : (
                  <span>{siteName}</span>
                )}
              </span>
            </div>

            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              {siteDescription}
            </p>

            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <SocialLink key={link.label} icon={link.icon} href={link.href} label={link.label} />
              ))}
            </div>
          </div>

          {/* Links - Explorar */}
          <div>
            <h3 className="font-display text-lg text-white mb-4 uppercase tracking-wide">
              Explorar
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="/" className="hover:text-[#FFC107] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-[#FFC107] transition-colors">
                  Noticias y Actualizaciones
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="hover:text-[#FFC107] transition-colors"
                >
                  Clasificación
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-[#FFC107] transition-colors">
                  Tienda
                </Link>
              </li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="font-display text-lg text-white mb-4 uppercase tracking-wide">
              Soporte
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="#" className="hover:text-[#FFC107] transition-colors">
                  Centro de Ayuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFC107] transition-colors">
                  Reglas del Servidor
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFC107] transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#FFC107] transition-colors">
                  Términos de Servicio
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} <b>{siteName}</b>. Todos los derechos reservados
            </p>

            {/* “Page loaded…” badge */}
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-gray-200 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/5">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="whitespace-nowrap">{loadLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  icon: Icon,
  href,
  label,
}: {
  icon: any;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#FFC107] hover:text-black transition-all duration-200 cursor-pointer"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
}
