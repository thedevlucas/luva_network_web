"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Globe, ShoppingCart, Newspaper, Trophy, Wrench } from "lucide-react";
import logoImg from "@/app/assets/logoluva_1768898408478.png";
import { Button } from "./Button";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [playersOnline, setPlayersOnline] = useState(0);
  const [serverMaintenance, setServerMaintenance] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
        
        // Fetch general settings
        const settingsRes = await fetch(`${baseUrl}/api/settings/general`, {
          method: "GET",
          cache: "no-store",
        });
        
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setServerMaintenance(data.serverMaintenance || false);
        }

        // Fetch total players from all servers if not in maintenance
        if (!serverMaintenance) {
          const playersRes = await fetch(`${baseUrl}/api/servers/total-players`, {
            method: "GET",
            cache: "no-store",
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (playersRes.ok) {
            const playersData = await playersRes.json();
            if (playersData.success) {
              setPlayersOnline(playersData.totalPlayers || 0);
              console.log(`Real-time player count updated: ${playersData.totalPlayers}`, playersData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching server status:", error);
      }
    };

    fetchServerStatus();
    
    const statusInterval = setInterval(fetchServerStatus, 10000); // Update every 10 seconds for real-time data

    return () => {
      clearInterval(statusInterval);
    };
  }, [serverMaintenance]);

  const links = [
    { href: "/", label: "Inicio", icon: Globe },
    { href: "/news", label: "Noticias", icon: Newspaper },
    { href: "/leaderboard", label: "Clasificacion", icon: Trophy },
    { href: "/store", label: "Tienda", icon: ShoppingCart },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0a0a0e]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-20 relative">
          
          {/* Logo Section - Left */}
          <Link href="/" className="flex-shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer flex items-center gap-3"
            >
              <img 
                className="h-10 w-auto" 
                src={logoImg.src || "/placeholder.svg"} 
                alt="LuvaNetwork Logo" 
              />
            </motion.div>
          </Link>

          {/* Desktop Menu - Absolutely Centered */}
          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} className={`
                  flex items-center gap-2 font-display uppercase text-base tracking-wide transition-all duration-200
                  ${isActive 
                    ? 'text-[#b574ff] drop-shadow(0 0 10px #cb07ff80)' 
                    : 'text-gray-400 hover:text-white'}
                `}>
                  <link.icon className={`w-4 h-4 ${isActive ? 'text-[#965CD9]' : 'text-gray-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section: Status & Button */}
          <div className="hidden md:flex items-center gap-6 ml-auto">
            {/* Online Counter / Maintenance Status */}
            {serverMaintenance ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/30">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                </span>
                <Wrench className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-mono font-bold text-orange-300">MANTENIMIENTO</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-full border border-white/10">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-mono font-bold text-gray-300">{playersOnline.toLocaleString()} Jugadores En Linea</span>
              </div>
            )}

            {/* Play Now Button */}
            <Button 
              size="sm" 
              className="bg-[#FFC107] hover:bg-[#ffcd38] text-black font-black text-sm uppercase tracking-widest px-6 py-2 rounded-lg border-b-[4px] border-[#b38600] active:border-b-0 active:translate-y-[4px] transition-all shadow-lg hover:shadow-[#FFC107]/20 cursor-pointer"
              onClick={() => {window.open("https://discord.gg/dR7J8MEE8B", "_blank")}}
            >
              Jugar Ahora
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden ml-auto">
            <button aria-label="Abrir menú"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-[#0a0a0e] border-b border-white/10"
        >
          <div className="px-4 pt-4 pb-6 space-y-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block px-4 py-3 rounded-lg font-display uppercase text-gray-300 hover:text-[#FFC107] hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </div>
              </Link>
            ))}
            
            {/* Mobile Status */}
            <div className="px-4 py-3">
              {serverMaintenance ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
                  </span>
                  <Wrench className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-mono font-bold text-orange-300">MANTENIMIENTO</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg border border-white/10">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-mono font-bold text-gray-300">{playersOnline.toLocaleString()} En Linea</span>
                </div>
              )}
            </div>

            <div className="mt-4 px-4">
              <Button className="w-full bg-[#FFC107] text-black font-display font-black uppercase py-3 rounded-lg border-b-4 border-[#b38600] cursor-pointer"
                onClick={() => {window.open("https://discord.gg/dR7J8MEE8B", "_blank")}}
                >
                Jugar Ahora
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
