"use client";

import { useEffect, useMemo, useState } from "react";

type ApiNewsPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  createdAt: string;
  // opcionales si después los agregás en DB
  category?: string;
  author?: string;
};

export type Post = {
  id: string;           // lo dejás string para no tocar tu UI
  slug: string;
  coverImage: string;
  title: string;
  category: string;
  publishedAt: string;
  excerpt: string;
  author: string;
};

function normalize(post: ApiNewsPost): Post {
  return {
    id: String(post.id),
    slug: post.slug,
    coverImage: post.coverImageUrl ?? "",
    title: post.title ?? "Sin título",
    excerpt: post.excerpt ?? "",
    publishedAt: post.createdAt,
    category: post.category ?? "Novedad",
    author: post.author ?? "LuvaNetwork",
  };
}

export function useNews() {
  const [data, setData] = useState<Post[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
  }, []);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${baseUrl}/api/news`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const raw = (await res.json()) as ApiNewsPost[];
        const normalized = raw.map(normalize);

        // Orden newest -> oldest por publishedAt (por si API no ordena)
        normalized.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

        if (alive) setData(normalized);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Error cargando news");
      } finally {
        if (alive) setIsLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [baseUrl]);

  return { data, isLoading, error };
}
