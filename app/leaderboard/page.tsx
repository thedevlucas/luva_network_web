"use client"
import { useState } from "react";
import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { DiscordOverlay } from "@/app/components/DiscordOverlay";
import { SocialSidebar } from "@/app/components/SocialSidebar";
import { LeaderboardTable } from "@/app/components/LeaderboardTable";
import { ArenaLeaderboardTable } from "@/app/components/ArenaLeaderboardTable";
import { useLeaderboard, usePlayersCount, usePlayersCountHours } from "@/app/hooks/use-leaderboard";
import { useArenaLeaderboard } from "@/app/hooks/use-arena-leaderboard";
import { motion } from "framer-motion";
import { Swords, Skull, Trophy, Crown, Medal, Target, Clock, Zap, ChevronRight, User } from "lucide-react";
import { cn } from "@/app/lib/utils";
import Image from "next/image";
import heroBg from "@/app/assets/bg_1768898406606.png";
import skywars from "@/public/assets/bg-adventure--2.jpg";
import survival from "@/public/assets/bg-adventure--1.jpg";
import duels from "@/public/assets/bg-adventure--3.jpg";




const METRICS = [
    { id: "kills", label: "Asesinatos", icon: Target, modes: ["arena", "skywars", "survival", "duels"] },
    { id: "wins", label: "Victorias", icon: Crown, modes: ["arena", "skywars", "survival", "duels"] },
    { id: "playtime", label: "Tiempo de Juego", icon: Clock, modes: ["skywars", "survival", "duels"] },
  ];

const MODES = [
  { id: "arena", label: "Arena PvP", icon: Swords, color: "from-red-500 to-orange-500", bgImage: duels.src },
  { id: "skywars",  label: "SkyWars",  icon: Trophy, color: "from-purple-500 to-pink-500",  bgImage: skywars.src, maintenance: true },
  { id: "survival", label: "Survival", icon: Crown,  color: "from-emerald-500 to-lime-400",  bgImage: survival.src, maintenance: true },
  { id: "duels",    label: "Duels",    icon: Swords, color: "from-sky-500 to-blue-500",      bgImage: duels.src, maintenance: true },
];



export default function Leaderboard() {
  const [selectedMode, setSelectedMode] = useState("arena");
  const [selectedMetric, setSelectedMetric] = useState("kills");
  const { data, isLoading } = useLeaderboard(selectedMode, selectedMetric);
  const { data: arenaData, isLoading: arenaLoading } = useArenaLeaderboard();
  const { data: playersCount, isLoading: playersLoading } = usePlayersCount();
  const { data: playersPlaytime, isLoading: playersHoursLoading } = usePlayersCountHours();

  const topPlayerStats = [
    {
      label: "Total de Jugadores",
      value: playersLoading ? "..." : (playersCount ?? 0).toLocaleString("es-AR"),
      icon: User,
    },
    { label: "Partidas Jugadas", value: "1.2M+", icon: Swords },
    { 
      label: "Horas de Juego", 
      value: playersHoursLoading ? "..." : (playersPlaytime ?? 0).toLocaleString("es-AR"),
      icon: Clock 
    },
  ];

  


  const currentMode = MODES.find(m => m.id === selectedMode);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0e]">
      <Navbar />
      <SocialSidebar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBg || "/placeholder.svg"}
            alt="Background"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0e]/80 to-[#0a0a0e]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#B58CFF]/10 border border-[#B58CFF]/30 rounded-full text-[#B58CFF] text-sm font-bold uppercase tracking-wider mb-6">

              <Crown className="w-4 h-4" />
              Ranking Global
            </div>
            <h1 className="text-5xl md:text-7xl font-display text-white mb-4">
              SALON DE LA <span className="text-[#965CD9] drop-shadow(0 6px 0 #6200b480)">FAMA</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Los mejores jugadores del Servidor. Compite, escala posiciones y deja tu marca en la historia.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-8"
          >
            {topPlayerStats.map((stat, i) => (
              <div
                key={stat.label}
                className="bg-[#1a1a24]/80 backdrop-blur-sm border border-white/5 rounded-xl p-4 text-center"
              >
                <stat.icon className="w-6 h-6 text-[#965CD9] mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      
      <main className="flex-grow pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Game Mode Selector - Premium Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              
              return (
                <motion.button
                  key={mode.id}
                  onClick={() => !mode.maintenance && setSelectedMode(mode.id)}
                  disabled={mode.maintenance}
                  whileHover={{ scale: mode.maintenance ? 1 : 1.02 }}
                  whileTap={{ scale: mode.maintenance ? 1 : 0.98 }}
                  className={cn(
                    "relative p-6 rounded-2xl border-2 transition-all overflow-hidden group",
                    isSelected
                      ? "border-white/20 bg-white/5"
                      : mode.maintenance
                      ? "border-gray-700 bg-gray-900/50 opacity-60 cursor-not-allowed"
                      : "border-white/10 bg-[#1a1a24] hover:border-white/20"
                  )}
                >
                  {/* Imagen de fondo cuando está activo */}
                  {isSelected && mode.bgImage && (
                    <div
                      className="absolute inset-0 bg-center bg-cover opacity-25"
                      style={{ backgroundImage: `url(${mode.bgImage})` }}
                    />
                  )}

                  {/* Overlay para legibilidad (neutral) */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-transparent" />
                  )}

                  {/* Accent sutil por modalidad (mantiene mode.color) */}
                  {isSelected && (
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", mode.color)} />
                  )}

                  <div className="relative z-10 flex items-center gap-4">
                     <div className={cn(
                       "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                       isSelected
                         ? `bg-gradient-to-br ${mode.color} text-white`
                         : mode.maintenance
                         ? "bg-gray-800 text-gray-600"
                         : "bg-white/5 text-gray-400 group-hover:text-white"
                     )}>
                       <Icon className="w-7 h-7" />
                     </div>

                    <div className="text-left">
                      <h2 className={cn(
                        "text-xl font-display transition-colors",
                        isSelected ? "text-white" : "text-white"
                      )}>
                        {mode.label}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {mode.id === "arena" && "Combate PvP en Arena"}
                        {mode.id === "skywars" && "Combate PvP en Islas Flotantes"}
                        {mode.id === "survival" && "Modo Clasico"}
                        {mode.id === "duels" && "Combate 1v1"}
                        {mode.maintenance && "En mantenimiento"}
                      </p>
                    </div>

                    {isSelected && (
                      <ChevronRight className="w-5 h-5 text-white/70 ml-auto" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Metric Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            {METRICS.filter(metric => metric.modes.includes(selectedMode)).map((metric) => {
              const Icon = metric.icon;
              const isSelected = selectedMetric === metric.id;
              
              return (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all",
                    isSelected
                      ? "bg-[#7B39D1] text-white shadow-lg shadow-[#965CD9]/20"
                      : "bg-[#1a1a24] text-gray-400 hover:text-white border border-white/5"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {metric.label}
                </button>
              );
            })}
          </motion.div>

          {/* Leaderboard Table Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#1a1a24]/50 backdrop-blur-sm rounded-3xl p-4 md:p-8 border border-white/5"
          >
            {/* Table Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {currentMode && (
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentMode.color} flex items-center justify-center`}>
                    <currentMode.icon className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-display text-white">
                    Top 10 - {currentMode?.label}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Ordenado por {METRICS.find(m => m.id === selectedMetric)?.label}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Zap className="w-4 h-4 text-green-500" />
                Actualizado en tiempo real
              </div>
            </div>

            {/* Table */}
            {selectedMode === "arena" ? (
              <ArenaLeaderboardTable 
                data={arenaData || []} 
                isLoading={arenaLoading} 
                metricLabel={METRICS.find(m => m.id === selectedMetric)?.label || "Valor"} 
              />
            ) : (
              <LeaderboardTable 
                data={data || []} 
                isLoading={isLoading} 
                metricLabel={METRICS.find(m => m.id === selectedMetric)?.label || "Valor"} 
              />
            )}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="bg-gradient-to-r from-[#FFC107]/10 via-transparent to-[#FFC107]/10 rounded-2xl p-8 border border-[#FFC107]/20">
              <h3 className="text-2xl font-display text-white mb-2">
                ¿Queres aparecer en el ranking?
              </h3>
              <p className="text-gray-400 mb-6">
                Unite al servidor y comienza a competir con los demás jugadores
              </p>
              <button className="bg-[#FFC107] hover:bg-[#ffcd38] text-black font-display font-bold uppercase px-8 py-3 rounded-xl transition-all hover:scale-105">
                Unirse Ahora
              </button>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
      <DiscordOverlay />
    </div>
  );
}
