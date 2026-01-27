"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, Clock, Share2 } from "lucide-react";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { DiscordOverlay } from "@/app/components/DiscordOverlay";
import { SocialSidebar } from "@/app/components/SocialSidebar";
import { DiscordMarkdown } from "@/app/lib/discord-markdown";

import heroBg from "@/app/assets/bg_1768898406606.png";

type NewsDetail = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  category?: string;
  author?: string;
  createdAt: string;
};

export default function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
  }, []);

  useEffect(() => {
    let alive = true;

    async function fetchNews() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/api/news/${encodeURIComponent(slug)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Noticia no encontrada");
          }
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        if (alive) setNews(data);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Error cargando la noticia");
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    fetchNews();
    return () => {
      alive = false;
    };
  }, [baseUrl, slug]);

  const formattedDate = news
    ? new Date(news.createdAt).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const readingTime = news
    ? Math.max(1, Math.ceil(news.content.split(/\s+/).length / 200))
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0e]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#965CD9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando noticia...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0e]">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-display text-white mb-4">Noticia no encontrada</h1>
            <p className="text-gray-400 mb-8">{error || "La noticia que buscas no existe."}</p>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a Noticias
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0e]">
      <Navbar />
      <SocialSidebar />

      {/* Hero Section */}
      <section className="relative w-full min-h-[70vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          {news.coverImageUrl ? (
            <img
              src={news.coverImageUrl}
              alt={news.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Image
              src={heroBg}
              alt="Background"
              fill
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0e]/80 via-transparent to-[#0a0a0e]/80" />
        </div>

        <div className="relative z-10 w-full">
          <div className="max-w-5xl mx-auto px-4 pb-16 pt-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver a Noticias
              </Link>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-[#FFC107] text-black px-4 py-1.5 rounded-lg font-bold text-sm uppercase tracking-wide">
                  {news.category || "Novedad"}
                </span>
                <span className="text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formattedDate}
                </span>
                <span className="text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {readingTime} min de lectura
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display text-white mb-6 leading-tight text-balance">
                {news.title}
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl leading-relaxed mb-8">
                {news.excerpt}
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#965CD9]/20 flex items-center justify-center text-[#B58CFF]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-white font-bold">{news.author || "LuvaNetwork"}</p>
                  <p className="text-gray-500 text-sm">Autor</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <main className="flex-grow w-full bg-[#0a0a0e]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full"
        >
          <article className="max-w-4xl mx-auto px-4 py-16">
            <div className="bg-[#12121a] rounded-3xl border border-white/5 p-8 md:p-12">
              <div className="prose prose-invert prose-lg max-w-none">
                {/* CORRECCIÓN AQUÍ: Usamos el componente que procesa el contenido */}
                <DiscordMarkdown content={news.content} />
              </div>
            </div>

            {/* Share Section */}
            <div className="mt-12 p-6 bg-[#1a1a24] rounded-2xl border border-white/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-[#965CD9]" />
                  <span className="text-gray-400">Comparte esta noticia</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: news.title,
                          text: news.excerpt,
                          url: window.location.href,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                      }
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Copiar enlace
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#965CD9] hover:bg-[#A878E6] text-white font-display font-bold uppercase rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Ver todas las noticias
              </Link>
            </div>
          </article>
        </motion.div>
      </main>

      <Footer />
      <DiscordOverlay />
    </div>
  );
}