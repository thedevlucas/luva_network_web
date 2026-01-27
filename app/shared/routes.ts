import { z } from "zod";
import {
  insertPlayerSchema,
  insertGameStatsSchema,
  insertNewsPostSchema,
  players,
  newsPosts,
  gameStats,
} from "./schema";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  leaderboard: {
    list: {
      method: "GET" as const,
      path: "/api/leaderboard/:gameMode/:metric",
      responses: {
        200: z.array(
          z.object({
            username: z.string(),
            avatarUrl: z.string(),
            rank: z.string(),
            value: z.number(),
          })
        ),
      },
    },
  },
  players: {
    get: {
      method: "GET" as const,
      path: "/api/players/get/:username",
      responses: {
        200: z.custom<
          typeof players.$inferSelect & { stats: typeof gameStats.$inferSelect[] }
        >(),
        404: errorSchemas.notFound,
      },
    },
  },
  news: {
    list: {
      method: "GET" as const,
      path: "/api/news",
      responses: {
        200: z.array(z.custom<typeof newsPosts.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/news/:slug",
      responses: {
        200: z.custom<typeof newsPosts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // ✅ NUEVO: Discord widget (lo sirve Next => mismo origin, ideal dejarlo relativo)
  discord: {
    widget: {
      method: "GET" as const,
      path: "/api/discord/widget",
      responses: {
        200: z.object({
          presence_count: z.number(),
          members: z.array(
            z.object({
              id: z.string(),
              username: z.string(),
              avatar_url: z.string().optional(),
              status: z.string().optional(),
            })
          ),
        }),
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number>
): string {
  let url = path;

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url = url.replaceAll(`:${key}`, encodeURIComponent(String(value)));
    }
  }

  // ya es absoluta
  if (/^https?:\/\//i.test(url)) return url;

  // ⚠️ Si es una ruta "interna" de Next (mismo origin), NO le pegues al backend 8080
  // (por ejemplo /api/discord/widget)
  if (url.startsWith("/api/discord/")) return url;

  // resto de rutas: van al backend (8080)
  const base = API_BASE_URL.replace(/\/+$/, "");
  const rel = url.startsWith("/") ? url : `/${url}`;
  return `${base}${rel}`;
}
