"use client";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { DiscordOverlay } from "@/app/components/DiscordOverlay";
import { SocialSidebar } from "@/app/components/SocialSidebar";
import { motion, useScroll, useTransform } from "framer-motion";
import { Crown, Sparkles, Gem, Check, Star, Shield, Zap, Gift, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useEffect, useState, useMemo } from "react";
import type { Rank } from "@/app/lib/store";

const ACCENT = {
  base: "#965CD9",
  hi: "#B58CFF",
  hover: "#A878E6",
};

const rankDesigns = [
  {
    color: "text-emerald-400",
    bgGlow: "from-emerald-500/20 via-transparent to-transparent",
    borderColor: "border-emerald-500/30",
    icon: Sparkles,
  },
  {
    color: "text-cyan-400",
    bgGlow: "from-cyan-500/30 via-transparent to-transparent",
    borderColor: "border-[#B58CFF]",
    icon: Gem,
  },
  {
    color: "text-amber-400",
    bgGlow: "from-amber-500/20 via-transparent to-transparent",
    borderColor: "border-amber-500/30",
    icon: Crown,
  },
];

const benefits = [
  { icon: Shield, title: "Pagos Seguros", desc: "Encriptacion SSL de 256 bits" },
  { icon: Zap, title: "Entrega Instantanea", desc: "Rangos se activan al instante" },
  { icon: Gift, title: "Beneficios Exclusivos", desc: "Recompensas solo para miembros" },
  { icon: Star, title: "Soporte Prioritario", desc: "Ayuda dedicada 24/7" },
];

type DisplayRank = {
  id: string;
  name: string;
  displayName: string;
  price: number;
  color: string;
  bgGlow: string;
  borderColor: string;
  icon: typeof Crown;
  isPopular: boolean;
  features: string[];
};

export default function Store() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const [ranks, setRanks] = useState<DisplayRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const baseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
  }, []);

  useEffect(() => {
    let alive = true;

    async function fetchRanks() {
      try {
        setIsLoading(true);
        const res = await fetch(`${baseUrl}/api/ranks`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch ranks");

        const data: Rank[] = await res.json();

        const displayRanks: DisplayRank[] = data.map((rank, index) => {
          const designIndex = Math.min(index, rankDesigns.length - 1);
          const design = rankDesigns[designIndex];

          return {
            id: rank.id,
            name: rank.displayName,
            displayName: rank.displayName,
            price: rank.price,
            color: design.color,
            bgGlow: design.bgGlow,
            borderColor: design.borderColor,
            icon: design.icon,
            isPopular: rank.isPopular,
            features: rank.benefits.map((b) => b.text),
          };
        });

        if (alive) setRanks(displayRanks);
      } catch (error) {
        console.error("Error fetching ranks:", error);
        if (alive) {
          setRanks([
            {
              id: "1",
              name: "VIP",
              displayName: "VIP",
              price: 5.99,
              ...rankDesigns[0],
              isPopular: false,
              features: ["Color de Chat: Verde", "Prioridad en Cola: Baja", "1 Caja Misteriosa", "Volar en Lobby"],
            },
            {
              id: "2",
              name: "MVP",
              displayName: "MVP",
              price: 14.99,
              ...rankDesigns[1],
              isPopular: true,
              features: ["Todo lo de VIP", "Color de Chat: Aqua", "Prioridad en Cola: Media", "5 Cajas Misteriosas", "Acceso Beta"],
            },
            {
              id: "3",
              name: "ELITE",
              displayName: "ELITE",
              price: 29.99,
              ...rankDesigns[2],
              isPopular: false,
              features: ["Todo lo de MVP", "Color de Chat: Dorado", "Prioridad en Cola: Alta", "15 Cajas Misteriosas", "Crear Clanes"],
            },
          ]);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    fetchRanks();
    return () => {
      alive = false;
    };
  }, [baseUrl]);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-[#0a0a0e]">
      <Navbar />
      <SocialSidebar />

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-[90px] pb-[50px]">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <Image src="/images/bg-adventure-3.jpg" alt="Aventura Epica" fill className="object-cover object-right" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0e] via-[#0a0a0e]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-transparent to-[#0a0a0e]/50" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center"
        >
          <div className="text-left">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-block px-4 py-2 bg-[#B58CFF]/10 border border-[#B58CFF]/30 rounded-full text-[#B58CFF] text-sm font-bold uppercase tracking-wider mb-6">
                Experiencia Premium
              </span>

              <h1 className="text-6xl md:text-8xl font-display text-white leading-none mb-6">
                TIENDA OFICIAL
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#965CD9] to-[#B58CFF] md:text-4xl">
                  RANGOS, KITS Y COSMETICOS
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-lg mb-8 leading-relaxed">
                Apoya el desarrollo de <b>LuvaNetwork</b> desbloqueando rangos con kits, cosmeticos y beneficios dentro del servidor. Cada compra nos ayuda a mantener el proyecto online, mejorar el rendimiento y sumar nuevas modalidades y sistemas.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 bg-[#7B39D1] hover:bg-[#A878E6] text-white font-display font-bold text-lg uppercase py-4 px-8 rounded-xl transition-all cursor-pointer"
              >
                Explorar Rangos
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[500px]">
              <Image
                src="/assets/hytale-character-qcd.png"
                alt="Personaje Hytale"
                fill
                className="object-contain object-center drop-shadow-[0_0_80px_rgba(150,92,217,0.35)]"
                style={{
                  WebkitMaskImage: "linear-gradient(to top, transparent 0%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)",
                  maskImage: "linear-gradient(to top, transparent 0%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)",
                }}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-[#B58CFF] rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* BENEFITS BAR */}
      <section className="relative z-10 bg-[#12121a] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#B58CFF]/10 border border-[#B58CFF]/20 flex items-center justify-center text-[#B58CFF]">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-white font-bold font-sans">{benefit.title}</h2>
                  <p className="text-gray-500 text-sm">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* RANKS SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a2e]/50 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-5xl md:text-7xl font-display text-white mb-6">
              ELEGI TU <span className="text-[#B58CFF]">RANGO</span>
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              Cada rango suma beneficios y kits, y ademas ayuda a que <b>LuvaNetwork</b> siga creciendo
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-[#B58CFF] animate-spin" />
              <span className="ml-3 text-gray-400">Cargando rangos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {ranks.map((rank, i) => (
                <RankCard key={rank.id} rank={rank} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-24 bg-[#0d0d12]">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display text-white mb-4">COMPARAR CARACTERISTICAS</h2>
            <p className="text-gray-400">Ve exactamente lo que obtienes con cada rango</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#14141e] rounded-3xl border border-white/5 overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-4 p-6 border-b border-white/5 bg-[#1a1a28]">
              <div className="text-gray-400 font-medium">Caracteristica</div>
              {ranks.slice(0, 3).map((rank, i) => (
                <div key={rank.id} className={`text-center font-display ${rankDesigns[i]?.color || "text-white"}`}>
                  {rank.displayName}
                </div>
              ))}
            </div>

            {/* Dynamic comparison based on benefits */}
            {ranks.length > 0 && (
              <>
                {ranks[0]?.features.slice(0, 6).map((_, featureIndex) => (
                  <div
                    key={featureIndex}
                    className={`grid grid-cols-4 gap-4 p-6 ${featureIndex % 2 === 0 ? "bg-[#14141e]" : "bg-[#18182a]"}`}
                  >
                    <div className="text-white font-medium">
                      {ranks[0]?.features[featureIndex]?.split(":")[0] || `Beneficio ${featureIndex + 1}`}
                    </div>
                    {ranks.slice(0, 3).map((rank, rankIndex) => (
                      <div key={rank.id} className="text-center">
                        {rank.features[featureIndex] ? (
                          <Check className={`w-5 h-5 mx-auto ${rankDesigns[rankIndex]?.color || "text-white"}`} />
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/bg-adventure-1.jpg" alt="Fondo" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0e] via-[#0a0a0e]/90 to-[#0a0a0e]/70" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-5xl md:text-7xl font-display text-white mb-6">
              TE INTERESO NUESTRA <span className="text-[#B58CFF]">PROPUESTA</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Unite a miles de jugadores que ya han elevado su experiencia. Tu aventura comienza ahora.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#965CD9] hover:bg-[#A878E6] text-white font-display font-bold text-xl uppercase py-5 px-12 rounded-xl transition-all cursor-pointer shadow-[0_0_40px_rgba(150,92,217,0.35)]"
            >
              JUGAR AHORA
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Footer />
      <DiscordOverlay />
    </div>
  );
}

function RankCard({ rank, index }: { rank: DisplayRank; index: number }) {
  const Icon = rank.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.6 }}
      whileHover={{ y: -10, transition: { duration: 0.3 } }}
      className={`
        relative bg-[#14141e] rounded-3xl overflow-hidden group
        ${rank.isPopular ? "lg:scale-105 z-10" : ""}
      `}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-b ${rank.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div
        className={`absolute inset-0 rounded-3xl border-2 ${
          rank.isPopular ? "border-[#B58CFF]" : "border-white/5 group-hover:border-white/10"
        } transition-colors`}
      />

      {rank.isPopular && (
        <div className="absolute -top-px left-1/2 -translate-x-1/2">
          <div className="bg-[#B58CFF] text-white font-display font-bold px-6 py-2 text-sm uppercase tracking-wider rounded-b-xl">
            Mas Popular
          </div>
        </div>
      )}

      <div className="relative z-10 p-8 pt-12">
        <div
          className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center mb-8 ${rank.color} border border-white/10`}
        >
          <Icon className="w-10 h-10" />
        </div>

        <div className="text-center mb-8">
          <h3 className={`text-4xl font-display mb-2 ${rank.color}`}>{rank.name}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-white">${rank.price.toFixed(2)}</span>
            <span className="text-gray-500">/mes</span>
          </div>
        </div>

        <ul className="space-y-4 mb-10">
          {rank.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                  rank.isPopular ? "bg-[#B58CFF]/20 text-[#B58CFF]" : "bg-white/10 text-white/70"
                }`}
              >
                <Check className="w-3 h-3" />
              </div>
              <span className="text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full font-display font-bold uppercase tracking-wider py-4 rounded-xl transition-all cursor-pointer
            ${
              rank.isPopular
                ? "bg-[#965CD9] hover:bg-[#A878E6] text-white shadow-[0_0_30px_rgba(150,92,217,0.25)]"
                : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
            }
          `}
        >
          Comprar
        </motion.button>
      </div>
    </motion.div>
  );
}
