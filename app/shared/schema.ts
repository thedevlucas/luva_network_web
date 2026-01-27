import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  rank: text("rank").default("Member"),

  totalKills: integer("total_kills").default(0),
  totalWins: integer("total_wins").default(0),
  lastActive: timestamp("last_active").defaultNow(),
});

export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  gameMode: text("game_mode").notNull(), // 'skywars', 'survival', 'bedwars'
  kills: integer("kills").default(0),
  deaths: integer("deaths").default(0),
  wins: integer("wins").default(0),
  losses: integer("losses").default(0),
  playTimeMinutes: integer("play_time_minutes").default(0),
});

export const newsPosts = pgTable("news_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  author: text("author").default("Admin"),
  publishedAt: timestamp("published_at").defaultNow(),
  category: text("category").default("General"),
});

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true, lastActive: true });
export const insertGameStatsSchema = createInsertSchema(gameStats).omit({ id: true });
export const insertNewsPostSchema = createInsertSchema(newsPosts).omit({ id: true, publishedAt: true });

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type GameStats = typeof gameStats.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;

export type NewsPost = typeof newsPosts.$inferSelect;
export type InsertNewsPost = z.infer<typeof insertNewsPostSchema>;

export type PlayerWithStats = Player & {
  stats: GameStats[];
};

export type LeaderboardEntry = {
  username: string;
  avatarUrl: string;
  rank: string;
  value: number;
};
