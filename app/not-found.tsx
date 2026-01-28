"use client"
import { motion } from "framer-motion";
import { AlertTriangle, Home, ChevronLeft } from "lucide-react";
import Link from "next/link"; // Asegúrate de usar el Link de Next.js
import { Button } from "@/app/components/Button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#0a0a0e] overflow-hidden">
      
      {/* Fondo con efecto de resplandor lila */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#965CD9]/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="bg-[#1a1a24]/80 backdrop-blur-xl border-2 border-white/5 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          
          {/* Icono de advertencia animado */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 text-red-400 mb-6 border border-red-500/20"
          >
            <AlertTriangle className="h-10 w-10" />
          </motion.div>

          {/* Título con tu fuente Lilita One */}
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4 tracking-tight">
            404 - <span className="text-[#965CD9]">PORTAL PERDIDO</span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Las coordenadas que has introducido te han llevado al <span className="text-white font-bold italic">Vío</span>. 
            Regresa a la superficie antes de que la oscuridad te alcance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="w-full sm:w-auto">
              <button className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-[#8447C8] hover:bg-[#965CD9] text-white font-bold rounded-xl border-b-4 border-b-[#6200b480] active:border-b-0 active:translate-y-[4px] transition-all cursor-pointer">
                <Home className="w-5 h-5" />
                VOLVER AL INICIO
              </button>
            </Link>

            <button 
              onClick={() => window.history.back()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-gray-300 font-bold rounded-xl border-b-4 border-white/10 active:border-b-0 active:translate-y-[4px] transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              ATRÁS
            </button>
          </div>

          {/* Decoración inferior */}
          <div className="mt-10 pt-6 border-t border-white/5">
            <p className="text-xs text-gray-600 uppercase tracking-widest font-mono">
              Error_Code: 0x404_VOID_REALM
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}