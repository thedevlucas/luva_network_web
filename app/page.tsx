'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Swords, Skull, Trophy, Calendar, Shield, Zap, Cpu, Globe, Clock, Server, ChevronRight, Check, Users, CalendarDays, Layers3, Copy } from 'lucide-react';
import { useNews } from "@/app/hooks/use-news";
import { useSettings } from "@/app/contexts/SettingsContext";
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';
import { Card } from '@/app/components/Card';
import { DiscordOverlay } from '@/app/components/DiscordOverlay';
import { SocialSidebar } from '@/app/components/SocialSidebar';
import { useState } from 'react';
import heroBg from "@/app/assets/bg_1768898406606.png";

import skywars from "@/public/assets/bg-adventure--2.jpg";
import survival from "@/public/assets/bg-adventure--1.jpg";
import duels from "@/public/assets/bg-adventure--3.jpg";

const features = [
  { icon: Layers3, title: "Múltiples Modalidades", desc: "Elegí tu modo: PvP, survival y más" },
  { icon: Swords, title: "PvP Competitivo", desc: "Rankeds, arenas y matchmaking" },
  { icon: CalendarDays, title: "Eventos & Temporadas", desc: "Recompensas, resets y torneos" },
  { icon: Users, title: "Comunidad", desc: "Jugá en party, armá team y dominá"}
];



export default function Page() {
  const { data: news, isLoading: isNewsLoading } = useNews();
  const { settings } = useSettings();
  const { scrollY } = useScroll();
  const [copied, setCopied] = useState(false);

  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  const serverIp = settings?.serverIp || "play.LuvaNetwork.net";

  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText(serverIp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = serverIp;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <SocialSidebar />

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: yHero }} className="absolute inset-0 z-0">
          <Image
            src={heroBg || "/placeholder.svg"}
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/70 to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: opacityHero }}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <h1 className="text-7xl md:text-9xl font-display text-white drop-shadow-[0_6px_0_rgba(0,0,0,0.5)] leading-none mb-4 tracking-wide">
              LA AVENTURA <br />
              <span className="text-[#965CD9] drop-shadow(0 6px 0 #6200b480)">
                TE ESPERA
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 font-medium max-w-2xl mx-auto drop-shadow-md">
              Unite a nuestra network de Hytale: distintos modos, Skywars. Bedwars, Survival y eventos todo el tiempo.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/discord" className="w-full sm:w-auto min-w-[220px]">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto min-w-[220px] bg-[#8447C8] hover:bg-[#965CD9] text-white font-display font-black text-xl uppercase py-4 px-8 rounded-xl border-b-[6px] border-b-[#6200b480] active:border-b-0 active:translate-y-[6px] transition-all duration-150 drop-shadow-sm cursor-pointer">
              Unirse al Servidor
            </motion.button>
            </Link>
            

            <Link href="/leaderboard" className="w-full sm:w-auto min-w-[220px]">
               <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto min-w-[220px] bg-[#4a4a5e] hover:bg-[#5a5a75] text-white font-display font-black text-xl uppercase py-4 px-8 rounded-xl border-b-[6px] border-[#2a2a35] active:border-b-0 active:translate-y-[6px] transition-all cursor-pointer">
                Ver Clasificacion
              </motion.button>
            </Link>
          </motion.div>

          <div className="mt-10 inline-block">
            <button
              onClick={handleCopyIp}
              className="font-mono text-sm text-yellow-400 bg-black/60 px-6 py-3 rounded-lg backdrop-blur-md border border-white/10 shadow-xl hover:bg-black/80 transition-colors cursor-pointer flex items-center gap-3 group"
            >
              <span>IP:</span>
              <span className="font-bold text-white tracking-widest">{serverIp}</span>
              <span className="text-gray-400 group-hover:text-yellow-400 transition-colors">
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </span>
            </button>
            {copied && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-green-400 text-sm mt-2"
              >
                IP copiada al portapapeles
              </motion.p>
            )}
          </div>
        </motion.div>
      </section>

      {/* FEATURES BAR - Like holy.gg */}
      <section className="relative z-10 bg-[#0a0a0e] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-[#B58CFF]/10 flex items-center justify-center text-[#B58CFF] border border-[#B58CFF]/20">
                  <feature.icon className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-white font-body text-sm font-bold">{feature.title}</h4>
                  <p className="text-gray-500 text-xs">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GAME MODES */}
      <section className="py-24 relative z-10 bg-[#120c18]/90 backdrop-blur-md border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-display text-white mb-4 drop-shadow-lg">
              ELIGE TU CAMINO
            </h2>
            <p className="text-gray-400 text-lg">Tres modos de juego, infinitas posibilidades</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GameModeCard
              title="SKYWARS"
              description="Batalla en islas flotantes. Saquea cofres, construye puentes y se el ultimo jugador en pie."
              icon={Swords}
              color="from-cyan-900/40 to-cyan-900/10"
              accent="text-cyan-400"
              delay={0.1}
              bgImage={skywars.src}
            />
            <GameModeCard
              title="SURVIVAL"
              description="Una experiencia clasica mejorada con elementos RPG, mobs personalizados y economia de jugadores."
              icon={Skull}
              color="from-green-900/40 to-green-900/10"
              accent="text-green-400"
              delay={0.2}
              bgImage={survival.src}
            />
            <GameModeCard
              title="DUELS"
              description="Combate en arena 1v1. Demuestra tu habilidad en emparejamientos justos y equilibrados."
              icon={Trophy}
              color="from-red-900/40 to-red-900/10"
              accent="text-red-400"
              delay={0.3}
              bgImage={duels.src}
            />
          </div>
        </div>
      </section>



      {/* LATEST NEWS */}
      <section className="py-24 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-display text-white mb-2">ULTIMAS NOTICIAS</h2>
              <p className="text-gray-400">Actualizaciones directamente de los desarrolladores.</p>
            </div>

            <Link
              href="/news"
              className="text-[#b379f7] hover:text-white flex items-center gap-2 font-bold transition-colors uppercase tracking-wider"
            >
              Ver Todo <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isNewsLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse" />
              ))
            ) : (
              news?.slice(0, 3).map((post: any, i: number) => (
                <Card key={post.id} delay={i * 0.1} hoverEffect className="group cursor-pointer bg-[#1a1a24] border-white/5">
                  {post.coverImage && (
                    <div className="h-48 -mx-6 -mt-6 mb-4 overflow-hidden relative">
                      <img
                        src={post.coverImage || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent opacity-60" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs font-bold uppercase mb-3">
                    <span className="bg-[#FFC107] text-black px-2 py-1 rounded shadow-[0_2px_0_rgba(0,0,0,0.3)]">{post.category}</span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedAt || '').toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-white mb-2 group-hover:text-[#FFC107] transition-colors leading-tight">
                    {post.title}
                  </h3>

                  <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">{post.excerpt}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA SECTION - Like holy.gg */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-pink-900/20 to-yellow-900/30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-[#FFC107] font-bold uppercase tracking-wider text-sm">CREA TU SERVIDOR</span>
              <h2 className="text-4xl md:text-5xl font-display text-white mt-2 mb-4">
                ¿LISTO PARA COMENZAR?
              </h2>
              <p className="text-gray-300 max-w-lg">
                Comienza hoy y te ofreceremos un <span className="text-[#FFC107] font-bold">descuento</span> en tu primera factura con nuestra promocion de nuevos clientes! Disponible por tiempo limitado.
              </p>
            </div>

            <Link href="/store">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4 bg-[#1a1a24] px-6 py-4 rounded-xl border border-white/10 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-[#FFC107]/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#FFC107]" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">PROMOCIONES</span>
                  <div className="text-white font-display text-xl group-hover:text-[#FFC107] transition-colors">CUPONES ACTIVOS</div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#FFC107] group-hover:translate-x-1 transition-all" />
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <DiscordOverlay />
    </div>
  );
}

type GameModeCardProps = {
  title: string;
  description: string;
  icon: any;
  color: string;
  accent: string;
  delay?: number;
  bgImage?: string;
};

export function GameModeCard({
  title,
  description,
  icon: Icon,
  color,
  accent,
  delay = 0,
  bgImage,
}: GameModeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1a1a24]/50 backdrop-blur-sm p-8 group"
    >
      {/* ✅ Fondo por modo */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-center bg-cover opacity-20 group-hover:opacity-30 transition-opacity"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}

      {/* Overlay neutral para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/20 to-transparent" />

      {/* Accent por modo */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-30`} />

      {/* Contenido */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <Icon className={`w-6 h-6 ${accent}`} />
          </div>
          <h3 className="text-2xl font-display text-white">{title}</h3>
        </div>

        <p className="text-gray-300/80 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
