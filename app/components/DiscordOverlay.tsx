"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users } from "lucide-react";

function DiscordLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

type WidgetMember = {
  id: string;
  username: string;
  avatar_url?: string;
  status?: string;
};

export function DiscordOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [openList, setOpenList] = useState(false);

  const [membersOnline, setMembersOnline] = useState(0);
  const [members, setMembers] = useState<WidgetMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/discord/widget", { cache: "no-store" });

        if (!res.ok) return;

        const data = await res.json();
        if (!alive) return;

        setMembersOnline(Number(data?.presence_count ?? 0));
        setMembers(Array.isArray(data?.members) ? data.members : []);
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, []);


  const shownMembers = useMemo(() => members.slice(0, 8), [members]);
  const remaining = Math.max(0, members.length - shownMembers.length);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="relative">
          <div className="flex items-center gap-3 bg-[#1a1a24] px-4 py-3 rounded-xl border border-white/10 shadow-2xl shadow-black/50">
            <DiscordLogo className="w-6 h-6 text-[#5865F2]" />

            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3ba55c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#3ba55c]"></span>
              </span>

              <span className="text-white font-bold text-sm">
                {isLoading ? "..." : membersOnline.toLocaleString()}
              </span>
              <span className="text-gray-400 text-sm">Miembros en línea</span>
            </div>

            <button
              onClick={() => setOpenList((v) => !v)}
              className="ml-1 p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
              aria-label="Ver lista de activos"
              title="Ver activos"
            >
              <Users className="w-4 h-4" />
            </button>

            <a
              href="/discord"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 bg-[#FFC107] hover:bg-[#ffcd38] text-black font-bold text-sm px-4 py-1.5 rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              Ingresar
            </a>

            <button
              onClick={() => setIsVisible(false)}
              className="ml-1 p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence>
            {openList && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-[calc(100%+10px)] right-0 w-[320px] rounded-xl border border-white/10 bg-[#0f0f16] shadow-2xl shadow-black/60 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="text-white font-bold text-sm">Activos ahora</div>
                  <div className="text-gray-400 text-xs">{members.length.toLocaleString()} usuarios</div>
                </div>

                <div className="max-h-[260px] overflow-auto">
                  {shownMembers.length === 0 ? (
                    <div className="px-4 py-4 text-gray-400 text-sm">
                      {isLoading ? "Cargando..." : "No se pudo obtener la lista. ¿Tenés el Widget activado?"}
                    </div>
                  ) : (
                    <ul className="p-2">
                      {shownMembers.map((m) => (
                        <li key={m.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5">
                          <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                            {m.avatar_url ? (
                              <img src={m.avatar_url} alt={m.username} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-gray-400">{m.username.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="text-white text-sm font-semibold truncate">{m.username}</div>
                            <div className="text-gray-500 text-xs">{m.status ?? "online"}</div>
                          </div>

                          <span className="ml-auto w-2 h-2 rounded-full bg-[#3ba55c]" />
                        </li>
                      ))}
                      {remaining > 0 && (
                        <li className="px-2 py-2 text-gray-400 text-xs">y {remaining.toLocaleString()} más...</li>
                      )}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
