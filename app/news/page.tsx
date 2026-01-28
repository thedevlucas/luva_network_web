"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Filter, Search } from "lucide-react";

import { Navbar } from "@/app/components/Navbar";
import { Footer } from "@/app/components/Footer";
import { DiscordOverlay } from "@/app/components/DiscordOverlay";
import { SocialSidebar } from "@/app/components/SocialSidebar";
import { useNews, Post } from "@/app/hooks/use-news";

import heroBg from "@/app/assets/bg_1768898406606.png";

const defaultCategories = [
  { id: "all", label: "Todas" },
  { id: "Actualizacion", label: "Actualizaciones" },
  { id: "Evento", label: "Eventos" },
  { id: "Mantenimiento", label: "Mantenimiento" },
  { id: "Guia", label: "Guias" },
  { id: "Novedad", label: "Novedades" },
];

export default function News() {
  const { data: news, isLoading, error } = useNews();

  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const categories = useMemo(() => {
    if (!news || news.length === 0) return defaultCategories;
    const unique = Array.from(new Set(news.map((n) => n.category).filter(Boolean)));
    if (unique.length === 0) return defaultCategories;
    
    return [{ id: "all", label: "Todas" }].concat(
      unique.map((c) => ({ id: c, label: c }))
    );
  }, [news]);

  const filteredNews = useMemo(() => {
    if (!news) return [];

    return news.filter((post) => {
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [news, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0e]">
      <Navbar />
      <SocialSidebar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBg || "/placeholder.svg"}
            alt="Background"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0e]/80 to-[#0a0a0e]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-[#B58CFF]/10 border border-[#B58CFF]/30 rounded-full text-[#B58CFF] text-sm font-bold uppercase tracking-wider mb-6">
              Centro de Noticias
            </span>

            <h1 className="text-5xl md:text-7xl font-display text-white mb-4">
              NOTICIAS DEL{" "}
              <span className="text-[#965CD9] drop-shadow(0 6px 0 #6200b480)">
                SERVIDOR
              </span>
            </h1>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Mantente al dia con las ultimas actualizaciones, eventos y anuncios de la comunidad{" "}
              <b>LuvaNetwork</b>.
            </p>

            {error && (
              <p className="mt-6 text-red-400 font-semibold">
                Error cargando noticias: {error}
              </p>
            )}
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8"
          >
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar noticias..."
                aria-label="Buscar noticias del servidor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FFC107]/50 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Filter className="w-4 h-4 text-gray-500 mr-2" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                    selectedCategory === cat.id
                      ? "bg-[#7B39D1] text-white"
                      : "bg-[#1a1a24] text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* News Grid */}
      <main className="flex-grow pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Featured Post */}
          {!isLoading && filteredNews.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
              <FeaturedNewsCard post={filteredNews[0]} />
            </motion.div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-[#1a1a24] rounded-2xl animate-pulse" />
              ))
            ) : filteredNews.length > 1 ? (
              filteredNews.slice(1).map((post, i) => (
                <NewsCard key={post.id} post={post} index={i} />
              ))
            ) : filteredNews.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <p className="text-gray-400 text-lg">No se encontraron noticias con esos criterios.</p>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <Footer />
      <DiscordOverlay />
    </div>
  );
}

function FeaturedNewsCard({ post }: { post: Post }) {
  return (
    <Link href={`/news/${post.slug}`} className="block">
      <motion.div
        whileHover={{ y: -5 }}
        className="relative rounded-3xl overflow-hidden bg-[#1a1a24] border border-white/5 group cursor-pointer"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-64 lg:h-96 overflow-hidden">
            {post.coverImage ? (
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-black/30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1a1a24] lg:opacity-100 opacity-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent lg:opacity-0 opacity-100" />
          </div>

          {/* Content */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-sm mb-4">
              <span className="bg-[#FFC107] text-black px-3 py-1 rounded-lg font-bold uppercase">
                {post.category}
              </span>
              <span className="text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-display text-white mb-4 group-hover:text-[#FFC107] transition-colors">
              {post.title}
            </h2>

            <p className="text-gray-400 text-lg mb-6 line-clamp-3">{post.excerpt}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFC107]/20 flex items-center justify-center text-[#FFC107]">
                  <User className="w-5 h-5" />
                </div>
                <span className="font-bold text-white">{post.author}</span>
              </div>

              <span className="flex items-center gap-2 text-[#FFC107] font-bold group-hover:gap-4 transition-all">
                Leer Mas <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function NewsCard({ post, index }: { post: Post; index: number }) {
  return (
    <Link href={`/news/${post.slug}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08 }}
        whileHover={{ y: -10 }}
        className="bg-[#1a1a24] rounded-2xl overflow-hidden border border-white/5 group cursor-pointer"
      >
        {/* Image */}
        <div className="h-48 overflow-hidden relative">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-black/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a24] to-transparent opacity-60" />
          <span className="absolute top-4 left-4 bg-[#FFC107] text-black px-3 py-1 rounded-lg font-bold text-xs uppercase">
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.publishedAt).toLocaleDateString("es-ES")}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {post.author}
            </span>
          </div>

          <h3 className="text-xl font-display text-white mb-3 group-hover:text-[#FFC107] transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-gray-400 text-sm line-clamp-3 mb-4">{post.excerpt}</p>

          <span className="text-[#FFC107] text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
            Leer Mas <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
