const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

console.log("[server] Starting with DB:", process.env.DB_HOST, process.env.DB_NAME);

const app = express();

const PORT = process.env.PORT || 8080;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://127.0.0.1:3000";
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-.env";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const DB_CONFIG = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "hytale",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(DB_CONFIG);

app.use(express.json());
app.use(
  cors({
    origin: WEB_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

async function q(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

function nowIso() {
  return new Date().toISOString();
}

function toBool(v) {
  return !!v && (v === true || v === 1 || v === "1");
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.auth = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.auth || req.auth.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  return next();
}

const defaultSettings = {
  siteName: "LuvaNetwork",
  siteDescription: "La mejor experiencia de Minecraft PvP en Latinoamerica",
  logoUrl: "/app/assets/logoluva_1768898408478.png",
  faviconUrl: "/favicon.ico",
  serverIp: "play.LuvaNetwork.net",
  serverPort: 25565,

  discordUrl: "https://discord.gg/luvanetwork",
  youtubeUrl: "https://youtube.com/@luvanetwork",
  twitterUrl: "https://twitter.com/luvanetwork",
  instagramUrl: "https://instagram.com/luvanetwork",
  facebookUrl: "https://facebook.com/luvanetwork",

  serverMaintenance: false,
  serverMaintenanceMessage: "El servidor esta en mantenimiento. Vuelve pronto!",
  webMaintenance: false,
  webMaintenanceMessage: "Estamos realizando mejoras en el sitio. Vuelve pronto!",
  webMaintenanceEndDate: null,
  webMaintenanceShowCountdown: false,
};

async function ensureSchema() {
  await q(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id BIGINT UNSIGNED NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'admin',
      last_login DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_admin_user_user_id (user_id),
      KEY idx_admin_user_role (role)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS web_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      site_name VARCHAR(120) NOT NULL,
      site_description VARCHAR(255) NOT NULL,
      logo_url VARCHAR(255) NOT NULL,
      favicon_url VARCHAR(255) NOT NULL,
      server_ip VARCHAR(120) NOT NULL,
      server_port INT NOT NULL,

      discord_url VARCHAR(255) NOT NULL,
      youtube_url VARCHAR(255) NOT NULL,
      twitter_url VARCHAR(255) NOT NULL,
      instagram_url VARCHAR(255) NOT NULL,
      facebook_url VARCHAR(255) NOT NULL,

      server_maintenance TINYINT(1) NOT NULL DEFAULT 0,
      server_maintenance_message VARCHAR(255) NOT NULL,
      web_maintenance TINYINT(1) NOT NULL DEFAULT 0,
      web_maintenance_message VARCHAR(255) NOT NULL,
      web_maintenance_end_date DATETIME NULL,
      web_maintenance_show_countdown TINYINT(1) NOT NULL DEFAULT 0,

      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS ranks (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(80) NOT NULL,
      display_name VARCHAR(120) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0,
      color VARCHAR(16) NOT NULL DEFAULT '#965CD9',
      sort_order INT NOT NULL DEFAULT 0,
      is_popular TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_ranks_order (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS rank_benefits (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      rank_id BIGINT UNSIGNED NOT NULL,
      text VARCHAR(255) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_rank_benefits_rank (rank_id),
      KEY idx_rank_benefits_order (sort_order),
      CONSTRAINT fk_rank_benefits_rank FOREIGN KEY (rank_id) REFERENCES ranks(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await q(`
    CREATE TABLE IF NOT EXISTS news_posts (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(150) NOT NULL,
      title VARCHAR(255) NOT NULL,
      excerpt TEXT NOT NULL,
      content LONGTEXT NOT NULL,
      cover_image_url VARCHAR(255) NOT NULL DEFAULT '',
      category VARCHAR(80) NOT NULL DEFAULT 'Novedad',
      author VARCHAR(120) NOT NULL DEFAULT 'LuvaNetwork',
      is_published TINYINT(1) NOT NULL DEFAULT 0,
      published_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_news_slug (slug),
      KEY idx_news_published (is_published, published_at),
      KEY idx_news_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const existing = await q("SELECT id FROM web_settings WHERE id = 1 LIMIT 1");
  if (!existing || existing.length === 0) {
    await q(
      `
      INSERT INTO web_settings (
        id,
        site_name, site_description, logo_url, favicon_url, server_ip, server_port,
        discord_url, youtube_url, twitter_url, instagram_url, facebook_url,
        server_maintenance, server_maintenance_message,
        web_maintenance, web_maintenance_message, web_maintenance_end_date, web_maintenance_show_countdown
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        defaultSettings.siteName,
        defaultSettings.siteDescription,
        defaultSettings.logoUrl,
        defaultSettings.faviconUrl,
        defaultSettings.serverIp,
        defaultSettings.serverPort,
        defaultSettings.discordUrl,
        defaultSettings.youtubeUrl,
        defaultSettings.twitterUrl,
        defaultSettings.instagramUrl,
        defaultSettings.facebookUrl,
        defaultSettings.serverMaintenance ? 1 : 0,
        defaultSettings.serverMaintenanceMessage,
        defaultSettings.webMaintenance ? 1 : 0,
        defaultSettings.webMaintenanceMessage,
        defaultSettings.webMaintenanceEndDate ? new Date(defaultSettings.webMaintenanceEndDate) : null,
        defaultSettings.webMaintenanceShowCountdown ? 1 : 0,
      ]
    );
  }
}

function mapSettingsRow(row) {
  if (!row) {
    return {
      siteName: defaultSettings.siteName,
      siteDescription: defaultSettings.siteDescription,
      logoUrl: defaultSettings.logoUrl,
      faviconUrl: defaultSettings.faviconUrl,
      serverIp: defaultSettings.serverIp,
      serverPort: defaultSettings.serverPort,
      discordUrl: defaultSettings.discordUrl,
      youtubeUrl: defaultSettings.youtubeUrl,
      twitterUrl: defaultSettings.twitterUrl,
      instagramUrl: defaultSettings.instagramUrl,
      facebookUrl: defaultSettings.facebookUrl,
      serverMaintenance: defaultSettings.serverMaintenance,
      serverMaintenanceMessage: defaultSettings.serverMaintenanceMessage,
      webMaintenance: defaultSettings.webMaintenance,
      webMaintenanceMessage: defaultSettings.webMaintenanceMessage,
      webMaintenanceEndDate: defaultSettings.webMaintenanceEndDate,
      webMaintenanceShowCountdown: defaultSettings.webMaintenanceShowCountdown,
    };
  }

  return {
    siteName: row.site_name || defaultSettings.siteName,
    siteDescription: row.site_description || defaultSettings.siteDescription,
    logoUrl: row.logo_url || defaultSettings.logoUrl,
    faviconUrl: row.favicon_url || defaultSettings.faviconUrl,
    serverIp: row.server_ip || defaultSettings.serverIp,
    serverPort: Number(row.server_port) || defaultSettings.serverPort,

    discordUrl: row.discord_url || defaultSettings.discordUrl,
    youtubeUrl: row.youtube_url || defaultSettings.youtubeUrl,
    twitterUrl: row.twitter_url || defaultSettings.twitterUrl,
    instagramUrl: row.instagram_url || defaultSettings.instagramUrl,
    facebookUrl: row.facebook_url || defaultSettings.facebookUrl,

    serverMaintenance: toBool(row.server_maintenance),
    serverMaintenanceMessage: row.server_maintenance_message || defaultSettings.serverMaintenanceMessage,
    webMaintenance: toBool(row.web_maintenance),
    webMaintenanceMessage: row.web_maintenance_message || defaultSettings.webMaintenanceMessage,
    webMaintenanceEndDate: row.web_maintenance_end_date
      ? new Date(row.web_maintenance_end_date).toISOString()
      : defaultSettings.webMaintenanceEndDate,
    webMaintenanceShowCountdown: toBool(row.web_maintenance_show_countdown),
  };
}

function metricValue(stat, metric) {
  if (metric === "kills") return stat.kills;
  if (metric === "wins") return stat.wins;
  return stat.playtime;
}

const VALID_MODES = ["arena", "skywars", "survival", "duels"];
const VALID_METRICS = ["kills", "wins"];

const fakePlayers = [
  { id: 1, username: "Rehen", avatarUrl: "https://api.dicebear.com/9.x/bottts/png?seed=NicoPvP", rank: "Owner" }
  // { id: 2, username: "LunaGG", avatarUrl: "https://api.dicebear.com/9.x/bottts/png?seed=LunaGG", rank: "VIP" },
  // { id: 3, username: "RataDeLobby", avatarUrl: "https://api.dicebear.com/9.x/bottts/png?seed=RataDeLobby", rank: "ELITE" },
  // { id: 4, username: "Tryhardcito", avatarUrl: "https://api.dicebear.com/9.x/bottts/png?seed=Tryhardcito", rank: "MVP+" },
  // { id: 5, username: "MatiDuels", avatarUrl: "https://api.dicebear.com/9.x/bottts/png?seed=MatiDuels", rank: "DEFAULT" },
];

const fakeStats = [
  { playerId: 1, gameMode: "skywars", kills: 3210, wins: 420, playtime: 9800 },
  { playerId: 2, gameMode: "skywars", kills: 2890, wins: 390, playtime: 8700 },
  { playerId: 3, gameMode: "skywars", kills: 2500, wins: 310, playtime: 9100 },
  { playerId: 4, gameMode: "skywars", kills: 2300, wins: 280, playtime: 7600 },
  { playerId: 5, gameMode: "skywars", kills: 1900, wins: 210, playtime: 5400 },

  { playerId: 1, gameMode: "survival", kills: 480, wins: 55, playtime: 12400 },
  { playerId: 2, gameMode: "survival", kills: 320, wins: 28, playtime: 9800 },
  { playerId: 3, gameMode: "survival", kills: 910, wins: 77, playtime: 15000 },
  { playerId: 4, gameMode: "survival", kills: 210, wins: 19, playtime: 6200 },
  { playerId: 5, gameMode: "survival", kills: 150, wins: 12, playtime: 4100 },

  { playerId: 1, gameMode: "duels", kills: 1200, wins: 640, playtime: 3200 },
  { playerId: 2, gameMode: "duels", kills: 880, wins: 430, playtime: 2400 },
  { playerId: 3, gameMode: "duels", kills: 760, wins: 390, playtime: 2100 },
  { playerId: 4, gameMode: "duels", kills: 1500, wins: 820, playtime: 4100 },
  { playerId: 5, gameMode: "duels", kills: 620, wins: 300, playtime: 1900 },
];

app.get("/api/leaderboard/:gameMode/:metric", async (req, res) => {
  try {
    const { gameMode, metric } = req.params;

    if (!VALID_MODES.includes(gameMode)) {
      return res.status(400).json({ message: "Invalid gameMode", field: "gameMode" });
    }
    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({ message: "Invalid metric", field: "metric" });
    }

    // For arena mode, use real data from arena_pvp_stats
    if (gameMode === "arena") {
      const gameModeFilter = metric === "kills" ? "uhc_duel" : "competitive";
      
      // Get kills data
      const killsData = await q(
        `
        SELECT 
          aps.player_name as username,
          aps.player_uuid as uuid,
          COUNT(*) as kills
        FROM arena_pvp_stats aps
        WHERE aps.game_mode = ?
        AND aps.killer_uuid IS NOT NULL
        GROUP BY aps.player_uuid, aps.player_name
        ORDER BY kills DESC
        LIMIT 10
        `,
        [gameModeFilter]
      );

      // Get wins data (count unique matches where player was killer)
      const winsData = await q(
        `
        SELECT 
          aps.player_name as username,
          aps.player_uuid as uuid,
          COUNT(DISTINCT aps.match_id) as wins
        FROM arena_pvp_stats aps
        WHERE aps.game_mode = ?
        AND aps.match_id IS NOT NULL
        AND aps.killer_uuid = aps.player_uuid
        GROUP BY aps.player_uuid, aps.player_name
        ORDER BY wins DESC
        LIMIT 10
        `,
        [gameModeFilter]
      );

      const data = metric === "kills" ? killsData : winsData;

      // Get user ranks
      const usernames = data.map(d => d.username);
      const rankMap = new Map();
      
      if (usernames.length > 0) {
        const rankData = await q(
          `
          SELECT u.username, g.display_name
          FROM users u
          LEFT JOIN user_groups ug ON ug.user_id = u.id AND ug.is_primary = 1
          LEFT JOIN groups g ON g.id = ug.group_id
          WHERE u.username IN (${usernames.map(() => '?').join(',')})
          `,
          usernames
        );
        
        rankData.forEach(r => {
          rankMap.set(r.username, r.display_name || 'Default');
        });
      }

      const result = data.map((row, index) => ({
        username: row.username,
        avatarUrl: `https://hyvatar.io/render/${row.username}?size=96`,
        rank: rankMap.get(row.username) || 'Default',
        value: metric === "kills" ? Number(row.kills) : Number(row.wins)
      }));

      return res.json(result);
    }

    // For other game modes, use fake data
    const rows = fakeStats
      .filter((s) => s.gameMode === gameMode)
      .map((s) => {
        const p = fakePlayers.find((pp) => pp.id === s.playerId);
        return {
          username: p?.username ?? "Unknown",
          avatarUrl: p?.avatarUrl ?? "",
          rank: p?.rank ?? "DEFAULT",
          value: metricValue(s, metric),
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    res.json(rows);
  } catch (err) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/arena/leaderboard", async (req, res) => {
  try {
    console.log("Fetching arena leaderboard data...");
    
    // Get casual (informal) stats usando la columna 'won'
    const casualStats = await q(`
      SELECT 
        player_uuid as uuid,
        player_name as username,
        COUNT(CASE WHEN killer_uuid IS NOT NULL THEN 1 END) as kills,
        COUNT(CASE WHEN won = TRUE THEN 1 END) as wins,
        COUNT(CASE WHEN won = FALSE AND killer_uuid IS NOT NULL THEN 1 END) as losses
      FROM arena_pvp_stats
      WHERE game_mode = 'casual'
      GROUP BY player_uuid, player_name
    `);

    // Get competitive stats usando la columna 'won'
    const competitiveStats = await q(`
      SELECT 
        player_uuid as uuid,
        player_name as username,
        COUNT(CASE WHEN killer_uuid IS NOT NULL THEN 1 END) as kills,
        COUNT(CASE WHEN won = TRUE THEN 1 END) as wins,
        COUNT(CASE WHEN won = FALSE AND killer_uuid IS NOT NULL THEN 1 END) as losses
      FROM arena_pvp_stats
      WHERE game_mode = 'competitivo'
      GROUP BY player_uuid, player_name
    `);

    console.log("Data counts:", {
      casualPlayers: casualStats.length,
      competitivePlayers: competitiveStats.length
    });

    // Combine data
    const statsMap = new Map();

    // Add casual stats (informal)
    casualStats.forEach(row => {
      statsMap.set(row.uuid, {
        username: row.username,
        uuid: row.uuid,
        informalKills: Number(row.kills) || 0,
        informalWins: Number(row.wins) || 0,
        competitiveKills: 0,
        competitiveWins: 0,
      });
    });

    // Add competitive stats
    competitiveStats.forEach(row => {
      if (statsMap.has(row.uuid)) {
        const stats = statsMap.get(row.uuid);
        stats.competitiveKills = Number(row.kills) || 0;
        stats.competitiveWins = Number(row.wins) || 0;
      } else {
        statsMap.set(row.uuid, {
          username: row.username,
          uuid: row.uuid,
          informalKills: 0,
          informalWins: 0,
          competitiveKills: Number(row.kills) || 0,
          competitiveWins: Number(row.wins) || 0,
        });
      }
    });

    // Get user ranks
    const allUsernames = Array.from(statsMap.values()).map(s => s.username);
    const rankMap = new Map();
    
    if (allUsernames.length > 0) {
      const rankData = await q(`
        SELECT u.username, g.display_name
        FROM users u
        LEFT JOIN user_groups ug ON ug.user_id = u.id AND ug.is_primary = 1
        LEFT JOIN \`groups\` g ON g.id = ug.group_id
        WHERE u.username IN (${allUsernames.map(() => '?').join(',')})
      `, allUsernames);
      
      rankData.forEach(r => {
        rankMap.set(r.username, r.display_name || 'Usuario');
      });
    }

    // Convert to array and sort by total wins (primary) and kills (secondary)
    const result = Array.from(statsMap.values()).map(stats => ({
      ...stats,
      avatarUrl: `https://hyvatar.io/render/${stats.username}?size=96`,
      rank: rankMap.get(stats.username) || 'Usuario',
      totalKills: stats.informalKills + stats.competitiveKills,
      totalWins: stats.informalWins + stats.competitiveWins,
    }))
    .filter(player => player.totalKills > 0 || player.totalWins > 0) // Solo jugadores con stats
    .sort((a, b) => {
      // Ordenar primero por wins, luego por kills
      if (b.totalWins !== a.totalWins) {
        return b.totalWins - a.totalWins;
      }
      return b.totalKills - a.totalKills;
    })
    .slice(0, 50); // Top 50

    console.log("Returning", result.length, "arena players");
    
    // Log de debug para las primeras 3 entradas
    if (result.length > 0) {
      console.log("Top 3 players:", result.slice(0, 3).map(p => ({
        username: p.username,
        wins: p.totalWins,
        kills: p.totalKills
      })));
    }
    
    res.json(result);
    
  } catch (error) {
    console.error("Arena leaderboard error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.get("/api/players/get/:username", (req, res) => {
  const username = req.params.username;

  const player = fakePlayers.find((p) => p.username.toLowerCase() === username.toLowerCase());
  if (!player) return res.status(404).json({ message: "Player not found" });

  const stats = fakeStats.filter((s) => s.playerId === player.id);

  res.json({ ...player, stats });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "Missing username/password" });
    }

    const users = await q(
      "SELECT id, username FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1",
      [username]
    );
    if (!users || users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = users[0];

    const adminGroup = await q(
      `SELECT 1 AS ok
       FROM user_groups ug
       JOIN \`groups\` g ON g.id = ug.group_id
       WHERE ug.user_id = ? AND g.name = 'owner'
       LIMIT 1`,
      [user.id]
    );
    if (!adminGroup || adminGroup.length === 0) {
      return res.status(403).json({ error: "Admin only" });
    }

    const adminUsers = await q(
      "SELECT password_hash FROM admin_users WHERE user_id = ? LIMIT 1",
      [user.id]
    );
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(401).json({ error: "Admin password not set" });
    }

    const ok = await bcrypt.compare(password, adminUsers[0].password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    await q("UPDATE admin_users SET last_login = NOW() WHERE user_id = ?", [user.id]);

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: "admin" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({ token, user: { id: user.id, username: user.username, role: "admin" } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/settings/general", async (req, res) => {
  try {
    try {
      const rows = await q("SELECT * FROM web_settings WHERE id = 1 LIMIT 1");
      if (!rows || rows.length === 0) {
        await ensureSchema();
        const rows2 = await q("SELECT * FROM web_settings WHERE id = 1 LIMIT 1");
        if (rows2 && rows2.length > 0) {
          return res.json(mapSettingsRow(rows2[0]));
        }
      } else if (rows && rows.length > 0) {
        return res.json(mapSettingsRow(rows[0]));
      }
    } catch (dbError) {
      console.log("Database not available for settings, using defaults");
    }
    
    // Return default settings when DB is not available
    return res.json(mapSettingsRow({
      site_name: defaultSettings.siteName,
      site_description: defaultSettings.siteDescription,
      logo_url: defaultSettings.logoUrl,
      favicon_url: defaultSettings.faviconUrl,
      server_ip: defaultSettings.serverIp,
      server_port: defaultSettings.serverPort,
      discord_url: defaultSettings.discordUrl,
      youtube_url: defaultSettings.youtubeUrl,
      twitter_url: defaultSettings.twitterUrl,
      instagram_url: defaultSettings.instagramUrl,
      facebook_url: defaultSettings.facebookUrl,
      server_maintenance: defaultSettings.serverMaintenance ? 1 : 0,
      server_maintenance_message: defaultSettings.serverMaintenanceMessage,
      web_maintenance: defaultSettings.webMaintenance ? 1 : 0,
      web_maintenance_message: defaultSettings.webMaintenanceMessage,
      web_maintenance_end_date: defaultSettings.webMaintenanceEndDate,
      web_maintenance_show_countdown: defaultSettings.webMaintenanceShowCountdown ? 1 : 0,
    }));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.put("/api/settings/general", requireAuth, requireAdmin, async (req, res) => {
  try {
    const payload = req.body || {};

    const allowed = {
      siteName: "site_name",
      siteDescription: "site_description",
      logoUrl: "logo_url",
      faviconUrl: "favicon_url",
      serverIp: "server_ip",
      serverPort: "server_port",
      discordUrl: "discord_url",
      youtubeUrl: "youtube_url",
      twitterUrl: "twitter_url",
      instagramUrl: "instagram_url",
      facebookUrl: "facebook_url",
      serverMaintenance: "server_maintenance",
      serverMaintenanceMessage: "server_maintenance_message",
      webMaintenance: "web_maintenance",
      webMaintenanceMessage: "web_maintenance_message",
      webMaintenanceEndDate: "web_maintenance_end_date",
      webMaintenanceShowCountdown: "web_maintenance_show_countdown",
    };

    const sets = [];
    const values = [];
    for (const [k, col] of Object.entries(allowed)) {
      if (typeof payload[k] === "undefined") continue;

      if (k === "serverPort") {
        sets.push(`${col} = ?`);
        values.push(Number(payload[k]) || 0);
      } else if (k.endsWith("Maintenance") || k.endsWith("ShowCountdown")) {
        sets.push(`${col} = ?`);
        values.push(payload[k] ? 1 : 0);
      } else if (k === "webMaintenanceEndDate") {
        sets.push(`${col} = ?`);
        values.push(payload[k] ? new Date(payload[k]) : null);
      } else {
        sets.push(`${col} = ?`);
        values.push(payload[k]);
      }
    }

    if (sets.length > 0) {
      values.push(1);
      await q(`UPDATE web_settings SET ${sets.join(", ")} WHERE id = ?`, values);
    }

    const rows = await q("SELECT * FROM web_settings WHERE id = 1 LIMIT 1");
    return res.json(mapSettingsRow(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

async function fetchRanks() {
  const ranks = await q("SELECT * FROM ranks ORDER BY sort_order ASC, id ASC");
  if (!ranks || ranks.length === 0) return [];

  const ids = ranks.map((r) => r.id);
  const benefits = await q(
    `SELECT * FROM rank_benefits WHERE rank_id IN (${ids.map(() => "?").join(",")})
     ORDER BY rank_id ASC, \`order\` ASC, id ASC`,
    ids
  );

  const benefitByRank = new Map();
  for (const b of benefits) {
    const key = String(b.rank_id);
    if (!benefitByRank.has(key)) benefitByRank.set(key, []);
    benefitByRank.get(key).push({
      id: String(b.id),
      text: b.text,
      order: Number(b.sort_order),
    });
  }

  return ranks.map((r) => ({
    id: String(r.id),
    name: r.name,
    displayName: r.display_name,
    price: Number(r.price),
    color: r.color,
    order: Number(r.sort_order),
    benefits: benefitByRank.get(String(r.id)) || [],
    isPopular: toBool(r.is_popular),
  }));
}

async function fetchRankById(id) {
  const ranks = await q("SELECT * FROM ranks WHERE id = ? LIMIT 1", [id]);
  if (!ranks || ranks.length === 0) return null;
  const benefits = await q(
    "SELECT * FROM rank_benefits WHERE rank_id = ? ORDER BY sort_order ASC, id ASC",
    [id]
  );
  return {
    id: String(ranks[0].id),
    name: ranks[0].name,
    displayName: ranks[0].display_name,
    price: Number(ranks[0].price),
    color: ranks[0].color,
    order: Number(ranks[0].sort_order),
    benefits: benefits.map((b) => ({
      id: String(b.id),
      text: b.text,
      order: Number(b.sort_order),
    })),
    isPopular: toBool(ranks[0].is_popular),
  };
}

app.get("/api/ranks", async (req, res) => {
  try {
    const data = await fetchRanks();
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.post("/api/admin/ranks", requireAuth, requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.displayName) return res.status(400).json({ error: "Missing fields" });

    const result = await pool.query(
      `INSERT INTO ranks (name, display_name, price, color, \`order\`, is_popular)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        b.name,
        b.displayName,
        Number(b.price) || 0,
        b.color || "#965CD9",
        Number(b.order) || 0,
        b.isPopular ? 1 : 0,
      ]
    );
    const insertId = result[0].insertId;

    const benefits = Array.isArray(b.benefits) ? b.benefits : [];
    for (const ben of benefits) {
      await q(
        "INSERT INTO rank_benefits (rank_id, text, sort_order) VALUES (?, ?, ?)",
        [insertId, String(ben.text || ""), Number(ben.order) || 0]
      );
    }

    const rank = await fetchRankById(insertId);
    return res.json(rank);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.put("/api/admin/ranks/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const b = req.body || {};

    const rows = await q("SELECT id FROM ranks WHERE id = ? LIMIT 1", [id]);
    if (!rows?.length) {
      return res.status(404).json({ error: "Not found" });
    }



    const sets = [];
    const vals = [];
    const mapping = {
      name: "name",
      displayName: "display_name",
      price: "price",
      color: "color",
      order: "sort_order",
      isPopular: "is_popular",
    };
    for (const [k, col] of Object.entries(mapping)) {
      if (typeof b[k] === "undefined") continue;
      if (k === "isPopular") {
        sets.push(`${col} = ?`);
        vals.push(b[k] ? 1 : 0);
      } else if (k === "price" || k === "order") {
        sets.push(`${col} = ?`);
        vals.push(Number(b[k]) || 0);
      } else {
        sets.push(`${col} = ?`);
        vals.push(b[k]);
      }
    }
    if (sets.length > 0) {
      vals.push(id);
      await q(`UPDATE ranks SET ${sets.join(", ")} WHERE id = ?`, vals);
    }

    if (Array.isArray(b.benefits)) {
      await q("DELETE FROM rank_benefits WHERE rank_id = ?", [id]);
      for (const ben of b.benefits) {
        await q(
          "INSERT INTO rank_benefits (rank_id, text, sort_order) VALUES (?, ?, ?)",
          [id, String(ben.text || ""), Number(ben.order) || 0]
        );
      }
    }

    const rank = await fetchRankById(id);
    return res.json(rank);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.delete("/api/admin/ranks/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await q("DELETE FROM ranks WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

function mapNewsRow(row) {
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.cover_image_url,
    category: row.category,
    author: row.author,
    isPublished: toBool(row.is_published),
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : nowIso(),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

app.get("/api/news", async (req, res) => {
  try {
    const rows = await q(
      `SELECT * FROM news_posts
       WHERE is_published = 1
       ORDER BY published_at DESC, created_at DESC`
    );
    const data = rows.map((r) => ({
      id: String(r.id),
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      coverImageUrl: r.cover_image_url,
      createdAt: new Date(r.created_at).toISOString(),
    }));
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/news/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const rows = await q(
      `SELECT * FROM news_posts
       WHERE slug = ? AND is_published = 1
       LIMIT 1`,
      [slug]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Not found" });
    const r = rows[0];
    return res.json({
      id: String(r.id),
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      coverImageUrl: r.cover_image_url,
      category: r.category || "Novedad",
      author: r.author || "LuvaNetwork",
      createdAt: new Date(r.created_at).toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/admin/news", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rows = await q(`SELECT * FROM news_posts ORDER BY created_at DESC`);
    return res.json(rows.map(mapNewsRow));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.post("/api/admin/news", requireAuth, requireAdmin, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.slug || !b.title) return res.status(400).json({ error: "Missing fields" });

    const isPublished = !!b.isPublished;
    const publishedAt = isPublished ? (b.publishedAt ? new Date(b.publishedAt) : new Date()) : null;

    const result = await pool.query(
      `INSERT INTO news_posts
        (slug, title, excerpt, content, cover_image_url, category, author, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.slug,
        b.title,
        b.excerpt || "",
        b.content || "",
        b.coverImageUrl || "",
        b.category || "Novedad",
        b.author || req.auth.username,
        isPublished ? 1 : 0,
        publishedAt,
      ]
    );
    const insertId = result[0].insertId;
    const rows = await q("SELECT * FROM news_posts WHERE id = ? LIMIT 1", [insertId]);
    return res.json(mapNewsRow(rows[0]));
  } catch (err) {
    console.error(err);
    if (String(err && err.code) === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Slug already exists" });
    }
    return res.status(500).json({ error: "Internal error" });
  }
});

app.put("/api/admin/news/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const b = req.body || {};

    const rows = await q("SELECT * FROM news_posts WHERE id = ? LIMIT 1", [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: "Not found" });

    const allowed = {
      slug: "slug",
      title: "title",
      excerpt: "excerpt",
      content: "content",
      coverImageUrl: "cover_image_url",
      category: "category",
      author: "author",
      isPublished: "is_published",
      publishedAt: "published_at",
    };

    const sets = [];
    const vals = [];
    for (const [k, col] of Object.entries(allowed)) {
      if (typeof b[k] === "undefined") continue;

      if (k === "isPublished") {
        sets.push(`${col} = ?`);
        vals.push(b[k] ? 1 : 0);
        if (b[k] && typeof b.publishedAt === "undefined") {
          sets.push(`published_at = COALESCE(published_at, NOW())`);
        }
        if (!b[k]) {
          sets.push(`published_at = NULL`);
        }
      } else if (k === "publishedAt") {
        sets.push(`${col} = ?`);
        vals.push(b[k] ? new Date(b[k]) : null);
      } else {
        sets.push(`${col} = ?`);
        vals.push(b[k]);
      }
    }

    if (sets.length > 0) {
      vals.push(id);
      await q(`UPDATE news_posts SET ${sets.join(", ")} WHERE id = ?`, vals);
    }

    const updated = await q("SELECT * FROM news_posts WHERE id = ? LIMIT 1", [id]);
    return res.json(mapNewsRow(updated[0]));
  } catch (err) {
    console.error(err);
    if (String(err && err.code) === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Slug already exists" });
    }
    return res.status(500).json({ error: "Internal error" });
  }
});

app.delete("/api/admin/news/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    await q("DELETE FROM news_posts WHERE id = ?", [id]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const [totalUsersRow] = await q("SELECT COUNT(*) AS c FROM users");
    const [totalRanksRow] = await q("SELECT COUNT(*) AS c FROM ranks");
    const [totalNewsRow] = await q("SELECT COUNT(*) AS c FROM news_posts");
    const [publishedNewsRow] = await q("SELECT COUNT(*) AS c FROM news_posts WHERE is_published = 1");

    const windowSeconds = Number(process.env.ONLINE_WINDOW_SECONDS || 90);
    const [onlineRow] = await q(
      "SELECT COUNT(*) AS c FROM users WHERE last_seen >= (NOW() - INTERVAL ? SECOND)",
      [windowSeconds]
    );

    return res.json({
      totalUsers: Number(totalUsersRow?.c || 0),
      totalNews: Number(totalNewsRow?.c || 0),
      publishedNews: Number(publishedNewsRow?.c || 0),
      totalRanks: Number(totalRanksRow?.c || 0),
      onlineUsers: Number(onlineRow?.c || 0),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rows = await q(
      `
      SELECT
         u.id,
         u.username,
         u.uuid,
         u.joined_at,
         u.last_seen,
         u.playtime_seconds,
         MAX(CASE WHEN ug.is_primary = 1 THEN g.name END) AS primary_group,
         GROUP_CONCAT(g.name ORDER BY g.name SEPARATOR ',') AS \`groups\`
       FROM users u
       LEFT JOIN user_groups ug ON ug.user_id = u.id
       LEFT JOIN \`groups\` g ON g.id = ug.group_id
       GROUP BY u.id
       ORDER BY u.last_seen DESC
    `
    );

    const data = rows.map((r) => ({
      id: Number(r.id),
      username: r.username,
      uuid: r.uuid,
      joinedAt: new Date(r.joined_at).toISOString(),
      lastSeen: new Date(r.last_seen).toISOString(),
      playtimeSeconds: Number(r.playtime_seconds || 0),
      primaryGroup: r.primary_group || "default",
      groups: r.groups ? String(r.groups).split(",").filter(Boolean) : [],
    }));

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/players/online", async (req, res) => {
  try {
    const windowSeconds = Number(process.env.ONLINE_WINDOW_SECONDS || 90);
    const rows = await q(
      `
      SELECT username, uuid, last_seen
      FROM users
      WHERE last_seen >= (NOW() - INTERVAL ? SECOND)
      ORDER BY last_seen DESC
    `,
      [windowSeconds]
    );

    const data = rows.map((u) => ({
      username: u.username,
      uuid: u.uuid,
      lastSeen: new Date(u.last_seen).toISOString(),
    }));

    return res.json({ windowSeconds, count: data.length, players: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/players/get/:uuid", async (req, res) => {
  try {
    const { uuid } = req.params;
    const rows = await q(
      `
      SELECT id, username, uuid, joined_at, last_seen, playtime_seconds
      FROM users
      WHERE uuid = ?
      LIMIT 1
    `,
      [uuid]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    const u = rows[0];
    return res.json({
      id: Number(u.id),
      username: u.username,
      uuid: u.uuid,
      joinedAt: new Date(u.joined_at).toISOString(),
      lastSeen: new Date(u.last_seen).toISOString(),
      playtimeSeconds: Number(u.playtime_seconds || 0),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/players/online_count", async (_req, res) => {
  const windowSeconds = Number(process.env.ONLINE_WINDOW_SECONDS ?? 90);

  try {
    const [rows] = await pool.query(
      `
      SELECT COUNT(*) AS online
      FROM users
      WHERE last_seen >= (NOW() - INTERVAL ? SECOND)
      `,
      [windowSeconds]
    );

    res.json({ online: Number(rows?.[0]?.online ?? 0), windowSeconds });
  } catch (e) {
    res.status(500).json({ message: "DB error", error: String(e?.message ?? e) });
  }
});

app.get("/api/players/count", async (_req, res) => {
  try {
    const [rows] = await pool.query(`SELECT COUNT(*) AS total FROM users`);
    res.json({ total: Number(rows?.[0]?.total ?? 0) });
  } catch (e) {
    res.status(500).json({ message: "DB error", error: String(e?.message ?? e) });
  }
});

app.get("/api/players/hours_count", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT COALESCE(SUM(playtime_seconds), 0) AS totalSeconds
      FROM users
      `
    );

    const totalSeconds = Number(rows?.[0]?.totalSeconds ?? 0);
    const totalHours = totalSeconds / 3600;

    res.json({
      totalSeconds,
      totalHours: Math.round(totalHours * 100) / 100,
    });
  } catch (e) {
    res.status(500).json({
      message: "DB error (probablemente falta users.playtime_seconds). Subime tu db.sql y lo adapto.",
      error: String(e?.message ?? e),
    });
  }
});

// Test endpoint - si este funciona, las rutas se estan registrando
app.get("/api/admin/test", (req, res) => {
  res.json({ ok: true, message: "Admin routes are registered" });
});

// Temporary admin endpoints without auth for testing
// COMENTADO - Endpoint duplicado con datos hardcodeados
// app.get("/api/admin/groups", async (req, res) => {
//   try {
//     const groups = [
//       {
//         id: 1,
//         name: "default",
//         displayName: "Usuario",
//         weight: 0,
//         isDefault: true,
//         type: "group",
//         permissionCount: 0,
//         memberCount: 2,
//       },
//       {
//         id: 2,
//         name: "vip",
//         displayName: "VIP",
//         weight: 10,
//         isDefault: false,
//         type: "group", 
//         permissionCount: 0,
//         memberCount: 1,
//       },
//       {
//         id: 3,
//         name: "admin",
//         displayName: "Administrador",
//         weight: 500,
//         isDefault: false,
//         type: "group",
//         permissionCount: 8,
//         memberCount: 2,
//       }
//     ];

//     res.json(groups);
//   } catch (e) {
//     console.error("GET /api/admin/groups (no auth) error:", e);
//     return res.status(500).json({ error: "Internal error" });
//   }
// });

// COMENTADO - Endpoint duplicado con datos hardcodeados
// app.get("/api/admin/groups/:name", async (req, res) => {
//   try {
//     const groupName = req.params.name;
//     
//     const groups = {
//       "default": {
//         id: 1,
//         name: "default",
//         displayName: "Usuario",
//         weight: 0,
//         isDefault: true,
//         type: "group",
//         permissions: [],
//         members: [
//           {
//             id: 1,
//             userId: 160,
//             username: "imAndix",
//             uuid: "2d440a28-d746-41d1-a2bd-906c3bc82832",
//             isPrimary: true,
//             expiresAt: null,
//           }
//         ]
//       },
//       "admin": {
//         id: 3,
//         name: "admin", 
//         displayName: "Administrador",
//         weight: 500,
//         isDefault: false,
//         type: "group",
//         permissions: [
//           {
//             id: 1,
//             permission: "luva.admin.breakblocks",
//             value: 1,
//             server: "global",
//             world: "global"
//           },
//           {
//             id: 2,
//             permission: "luva.hologram.create",
//             value: 1,
//             server: "global",
//             world: "global"
//           }
//         ],
//         members: [
//           {
//             id: 2,
//             userId: 2,
//             username: "rehen",
//             uuid: "b8acc972-307f-4ed3-8083-f7941cb24c8b",
//             isPrimary: true,
//             expiresAt: null,
//           },
//           {
//             id: 3,
//             userId: 152,
//             username: "Carriedo",
//             uuid: "cf97dc66-495a-4e07-a932-e821b5c75af8",
//             isPrimary: true,
//             expiresAt: null,
//           }
//         ]
//       }
//     };
// 
//     const group = groups[groupName];
//     if (!group) {
//       return res.status(404).json({ error: "Group not found" });
//     }
// 
//     res.json(group);
//   } catch (e) {
//     console.error("GET /api/admin/groups/:name (no auth) error:", e);
//     return res.status(500).json({ error: "Internal error" });
//   }
// });

app.get("/api/admin/stats", async (req, res) => {
  try {
    res.json({
      totalUsers: 493,
      totalNews: 1,
      publishedNews: 1,
      totalRanks: 3,
      onlineUsers: 12,
    });
  } catch (e) {
    console.error("GET /api/admin/stats (no auth) error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/api/admin/users", async (req, res) => {
  try {
    const users = [
      {
        id: 2,
        username: "rehen",
        uuid: "b8acc972-307f-4ed3-8083-f7941cb24c8b",
        joinedAt: "2026-01-14T02:16:16.000Z",
        lastSeen: "2026-02-03T01:57:10.000Z",
        playtimeSeconds: 0,
        primaryGroup: "admin",
        groups: ["admin"],
      },
      {
        id: 152,
        username: "Carriedo", 
        uuid: "cf97dc66-495a-4e07-a932-e821b5c75af8",
        joinedAt: "2026-01-30T22:59:47.000Z",
        lastSeen: "2026-02-02T12:43:54.000Z",
        playtimeSeconds: 0,
        primaryGroup: "admin",
        groups: ["admin"],
      },
      {
        id: 160,
        username: "imAndix",
        uuid: "2d440a28-d746-41d1-a2bd-906c3bc82832", 
        joinedAt: "2026-01-31T00:10:19.000Z",
        lastSeen: "2026-01-31T23:34:16.000Z",
        playtimeSeconds: 0,
        primaryGroup: "default",
        groups: ["default"],
      }
    ];

    res.json(users);
  } catch (e) {
    console.error("GET /api/admin/users (no auth) error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
});

// Original endpoints with auth (kept for production)
app.get("/api/admin/groups", async (req, res) => {
  try {
    const groups = await query(`
      SELECT g.id, g.name, g.display_name, g.weight, g.is_default,
             (SELECT COUNT(*) FROM group_permissions gp WHERE gp.group_id = g.id) as permission_count,
             (SELECT COUNT(*) FROM user_groups ug WHERE ug.group_id = g.id) as member_count
      FROM groups g
      ORDER BY g.name ASC
    `);

    const result = groups.map(g => ({
      id: Number(g.id),
      name: g.name,
      displayName: g.display_name || g.name,
      weight: Number(g.weight || 0),
      isDefault: !!Number(g.is_default || 0),
      type: "group",
      permissionCount: Number(g.permission_count || 0),
      memberCount: Number(g.member_count || 0),
    }));

    res.json(result);
  } catch (error) {
    console.error("Admin groups error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/admin/groups/:name", requireAuth, requireAdmin, async (req, res) => {
  try {
    const groupName = String(req.params.name || "");

    const rows = await q(
      `
      SELECT
        id,
        name,
        display_name,
        weight,
        is_default,
        'group' AS type
      FROM \`groups\`
      WHERE name = ?
      LIMIT 1
      `,
      [groupName]
    );

    const g = rows?.[0];
    if (!g) return res.status(404).json({ error: "Group not found" });

    const perms = await q(
      `
      SELECT id, permission, value, server, world
      FROM group_permissions
      WHERE group_id = ?
      ORDER BY permission ASC
      `,
      [g.id]
    );

    const members = await q(
      `
      SELECT 
        ug.id,
        u.id AS user_id,
        u.username,
        u.uuid,
        ug.is_primary,
        ug.expires_at
      FROM user_groups ug
      JOIN users u ON ug.user_id = u.id
      WHERE ug.group_id = ?
      ORDER BY u.username ASC
      `,
      [g.id]
    );

    return res.json({
      id: Number(g.id),
      name: g.name,
      displayName: g.display_name ?? g.name,
      weight: Number(g.weight ?? 0),
      isDefault: !!Number(g.is_default ?? 0),
      type: g.type,
      permissions: perms.map((p) => ({
        id: Number(p.id),
        permission: p.permission,
        value: Number(p.value ?? 0),
        server: p.server ?? "",
        world: p.world ?? "",
      })),
      members: members.map((m) => ({
        id: Number(m.id),
        userId: Number(m.user_id),
        username: m.username,
        uuid: m.uuid,
        isPrimary: !!Number(m.is_primary ?? 0),
        expiresAt: m.expires_at,
      })),
    });
  } catch (e) {
    console.error("GET /api/admin/groups/:name error:", e);
    return res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

app.post("/api/admin/groups/:name/permissions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const groupName = req.params.name;
    const { permission, value = true, server = "global", world = "global" } = req.body || {};

    if (!permission) {
      return res.status(400).json({ error: "Permission is required" });
    }

    const groups = await q("SELECT id FROM `groups` WHERE name = ? LIMIT 1", [groupName]);
    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const existing = await q(
      "SELECT id FROM group_permissions WHERE group_id = ? AND permission = ? LIMIT 1",
      [groups[0].id, permission]
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Permission already exists for this group" });
    }

    await q(
      `INSERT INTO group_permissions (group_id, permission, value, server, world)
       VALUES (?, ?, ?, ?, ?)`,
      [groups[0].id, permission, value ? 1 : 0, server, world]
    );

    res.json({ success: true, message: "Permission added" });
  } catch (e) {
    console.error("POST /api/admin/groups/:name/permissions error:", e);
    res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

app.delete("/api/admin/groups/:name/permissions/:permissionId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name: groupName, permissionId } = req.params;

    const groups = await q("SELECT id FROM `groups` WHERE name = ? LIMIT 1", [groupName]);
    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const perms = await q(
      "SELECT id FROM group_permissions WHERE id = ? AND group_id = ? LIMIT 1",
      [permissionId, groups[0].id]
    );

    if (!perms || perms.length === 0) {
      return res.status(404).json({ error: "Permission not found for this group" });
    }

    await q("DELETE FROM group_permissions WHERE id = ?", [permissionId]);

    res.json({ success: true, message: "Permission removed" });
  } catch (e) {
    console.error("DELETE /api/admin/groups/:name/permissions/:permissionId error:", e);
    res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

app.patch("/api/admin/groups/:name/permissions/:permissionId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name: groupName, permissionId } = req.params;
    const { value } = req.body || {};

    if (value === undefined) {
      return res.status(400).json({ error: "Value is required" });
    }

    const groups = await q("SELECT id FROM `groups` WHERE name = ? LIMIT 1", [groupName]);
    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const perms = await q(
      "SELECT id FROM group_permissions WHERE id = ? AND group_id = ? LIMIT 1",
      [permissionId, groups[0].id]
    );

    if (!perms || perms.length === 0) {
      return res.status(404).json({ error: "Permission not found for this group" });
    }

    await q("UPDATE group_permissions SET value = ? WHERE id = ?", [value ? 1 : 0, permissionId]);

    res.json({ success: true, message: "Permission updated" });
  } catch (e) {
    console.error("PATCH /api/admin/groups/:name/permissions/:permissionId error:", e);
    res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

app.post("/api/admin/groups", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, type = "group" } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const existing = await q("SELECT id FROM `groups` WHERE name = ? LIMIT 1", [name]);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "Group already exists" });
    }

    await q("INSERT INTO `groups` (name, type) VALUES (?, ?)", [name, type]);

    res.json({ success: true, message: "Group created" });
  } catch (e) {
    console.error("POST /api/admin/groups error:", e);
    res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

app.post("/api/admin/groups/:name/members", requireAuth, requireAdmin, async (req, res) => {
  try {
    const groupName = req.params.name;
    const { username, expiresAt = null } = req.body || {};

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const groups = await q("SELECT id FROM `groups` WHERE name = ? LIMIT 1", [groupName]);
    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const users = await q("SELECT id FROM users WHERE username = ? LIMIT 1", [username]);
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const existing = await q(
      "SELECT id FROM user_groups WHERE user_id = ? AND group_id = ? LIMIT 1",
      [users[0].id, groups[0].id]
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: "User already in this group" });
    }

    await q(
      "INSERT INTO user_groups (user_id, group_id, expires_at) VALUES (?, ?, ?)",
      [users[0].id, groups[0].id, expiresAt]
    );

    res.json({ success: true, message: "User added to group" });
  } catch (e) {
    console.error("POST /api/admin/groups/:name/members error:", e);
    res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

app.get("/api/admin/groups/:name/members", requireAuth, requireAdmin, async (req, res) => {
  try {
    const groupName = req.params.name;

    const groups = await q("SELECT id FROM `groups` WHERE name = ? LIMIT 1", [groupName]);
    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const members = await q(
      `
      SELECT 
        ug.id,
        u.id AS user_id,
        u.username,
        ug.expires_at
      FROM user_groups ug
      JOIN users u ON ug.user_id = u.id
      WHERE ug.group_id = ?
      ORDER BY u.username ASC
      `,
      [groups[0].id]
    );

    res.json(
      members.map((m) => ({
        id: Number(m.id),
        userId: Number(m.user_id),
        username: m.username,
        expiresAt: m.expires_at,
      }))
    );
  } catch (e) {
    console.error("GET /api/admin/groups/:name/members error:", e);
    res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

app.delete("/api/admin/groups/:name/members/:memberId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name: groupName, memberId } = req.params;

    const groups = await q("SELECT id FROM `groups` WHERE name = ? LIMIT 1", [groupName]);
    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const members = await q(
      "SELECT id FROM user_groups WHERE id = ? AND group_id = ? LIMIT 1",
      [memberId, groups[0].id]
    );

    if (!members || members.length === 0) {
      return res.status(404).json({ error: "Member not found in this group" });
    }

    await q("DELETE FROM user_groups WHERE id = ?", [memberId]);

    res.json({ success: true, message: "User removed from group" });
  } catch (e) {
    console.error("DELETE /api/admin/groups/:name/members/:memberId error:", e);
    res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

app.delete("/api/admin/groups/:name", requireAuth, requireAdmin, async (req, res) => {
  try {
    const groupName = req.params.name;

    if (groupName === "default") {
      return res.status(400).json({ error: "Cannot delete default group" });
    }

    const groups = await q("SELECT id FROM `groups` WHERE name = ? LIMIT 1", [groupName]);
    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    await q("DELETE FROM group_permissions WHERE group_id = ?", [groups[0].id]);

    await q("DELETE FROM user_groups WHERE group_id = ?", [groups[0].id]);

    await q("DELETE FROM `groups` WHERE id = ?", [groups[0].id]);

    res.json({ success: true, message: "Group deleted" });
  } catch (e) {
    console.error("DELETE /api/admin/groups/:name error:", e);
    return res.status(500).json({ error: "DB error", details: String(e?.message ?? e) });
  }
});

(async () => {
  try {
    await ensureSchema();
    app.listen(PORT, () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
      console.log(`CORS origin: ${WEB_ORIGIN}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();