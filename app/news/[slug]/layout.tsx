import { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getNewsData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
    const res = await fetch(`${baseUrl}/api/news/${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching news for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsData(slug);

  if (!news) {
    return {
      title: "Noticia no encontrada | LuvaNetwork",
      description: "La noticia que buscas no existe.",
    };
  }

  const title = `${news.title} | LuvaNetwork`;
  const description = news.excerpt || "Lee las últimas noticias de LuvaNetwork";
  const imageUrl = news.coverImageUrl || "/assets/luva-logo.png";
  const url = `https://luvanetwork.net/news/${slug}`;

  return {
    title,
    description,
    keywords: [
      "luvanetwork",
      "noticias",
      "hytale",
      "minecraft",
      "servidor",
      news.category,
    ].filter(Boolean),

    openGraph: {
      title,
      description,
      type: "article",
      url,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
      siteName: "LuvaNetwork",
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@luvanetwork",
    },

    alternates: {
      canonical: url,
    },
  };
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}