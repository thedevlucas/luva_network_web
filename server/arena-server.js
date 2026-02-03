const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "hytale",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function initDatabase() {
  try {
    console.log("Connecting to database:", DB_CONFIG.host, DB_CONFIG.database);
    pool = mysql.createPool(DB_CONFIG);
    
    // Test connection
    const [rows] = await pool.query("SELECT 1 as test");
    console.log("Database connection successful:", rows[0]);
    
    // Check if arena_pvp_stats table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'arena_pvp_stats'");
    console.log("Arena table exists:", tables.length > 0);
    
    if (tables.length > 0) {
      const [count] = await pool.query("SELECT COUNT(*) as total FROM arena_pvp_stats");
      console.log("Total arena_pvp_stats records:", count[0].total);
    }
    
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.log("Server will continue with empty data...");
  }
}

async function query(sql, params = []) {
  if (!pool) return [];
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Query error:", error.message);
    return [];
  }
}

app.use(express.json());
app.use(cors({
  origin: WEB_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Arena leaderboard endpoint with real data
app.get("/api/arena/leaderboard", async (req, res) => {
  try {
    console.log("Fetching arena leaderboard data...");
    
    // Get informal (uhc_duel) stats
    const informalKillsData = await query(`
      SELECT aps.player_name as username, aps.player_uuid as uuid, COUNT(*) as kills
      FROM arena_pvp_stats aps
      WHERE aps.game_mode = 'uhc_duel' AND aps.killer_uuid IS NOT NULL
      GROUP BY aps.player_uuid, aps.player_name
      ORDER BY kills DESC LIMIT 50
    `);

    const informalWinsData = await query(`
      SELECT aps.player_name as username, aps.player_uuid as uuid, COUNT(DISTINCT aps.match_id) as wins
      FROM arena_pvp_stats aps
      WHERE aps.game_mode = 'uhc_duel' AND aps.match_id IS NOT NULL AND aps.killer_uuid = aps.player_uuid
      GROUP BY aps.player_uuid, aps.player_name
      ORDER BY wins DESC LIMIT 50
    `);

    // Get competitive stats
    const competitiveKillsData = await query(`
      SELECT aps.player_name as username, aps.player_uuid as uuid, COUNT(*) as kills
      FROM arena_pvp_stats aps
      WHERE aps.game_mode = 'competitive' AND aps.killer_uuid IS NOT NULL
      GROUP BY aps.player_uuid, aps.player_name
      ORDER BY kills DESC LIMIT 50
    `);

    const competitiveWinsData = await query(`
      SELECT aps.player_name as username, aps.player_uuid as uuid, COUNT(DISTINCT aps.match_id) as wins
      FROM arena_pvp_stats aps
      WHERE aps.game_mode = 'competitive' AND aps.match_id IS NOT NULL AND aps.killer_uuid = aps.player_uuid
      GROUP BY aps.player_uuid, aps.player_name
      ORDER BY wins DESC LIMIT 50
    `);

    console.log("Data counts:", {
      informalKills: informalKillsData.length,
      informalWins: informalWinsData.length,
      competitiveKills: competitiveKillsData.length,
      competitiveWins: competitiveWinsData.length
    });

    // Combine data
    const statsMap = new Map();

    informalKillsData.forEach(row => {
      statsMap.set(row.uuid, {
        username: row.username,
        uuid: row.uuid,
        informalKills: Number(row.kills),
        informalWins: 0,
        competitiveKills: 0,
        competitiveWins: 0,
      });
    });

    informalWinsData.forEach(row => {
      if (statsMap.has(row.uuid)) {
        statsMap.get(row.uuid).informalWins = Number(row.wins);
      } else {
        statsMap.set(row.uuid, {
          username: row.username,
          uuid: row.uuid,
          informalKills: 0,
          informalWins: Number(row.wins),
          competitiveKills: 0,
          competitiveWins: 0,
        });
      }
    });

    competitiveKillsData.forEach(row => {
      if (statsMap.has(row.uuid)) {
        statsMap.get(row.uuid).competitiveKills = Number(row.kills);
      } else {
        statsMap.set(row.uuid, {
          username: row.username,
          uuid: row.uuid,
          informalKills: 0,
          informalWins: 0,
          competitiveKills: Number(row.kills),
          competitiveWins: 0,
        });
      }
    });

    competitiveWinsData.forEach(row => {
      if (statsMap.has(row.uuid)) {
        statsMap.get(row.uuid).competitiveWins = Number(row.wins);
      } else {
        statsMap.set(row.uuid, {
          username: row.username,
          uuid: row.uuid,
          informalKills: 0,
          informalWins: 0,
          competitiveKills: 0,
          competitiveWins: Number(row.wins),
        });
      }
    });

    // Get user ranks
    const allUsernames = Array.from(statsMap.values()).map(s => s.username);
    const rankMap = new Map();
    
    if (allUsernames.length > 0) {
      const rankData = await query(`
        SELECT u.username, g.display_name
        FROM users u
        LEFT JOIN user_groups ug ON ug.user_id = u.id AND ug.is_primary = 1
        LEFT JOIN groups g ON g.id = ug.group_id
        WHERE u.username IN (${allUsernames.map(() => '?').join(',')})
      `, allUsernames);
      
      rankData.forEach(r => {
        rankMap.set(r.username, r.display_name || 'Default');
      });
    }

    // Convert to array and sort
    const result = Array.from(statsMap.values()).map(stats => ({
      ...stats,
      avatarUrl: `https://hyvatar.io/render/${stats.username}?size=96`,
      rank: rankMap.get(stats.username) || 'Default',
      totalKills: stats.informalKills + stats.competitiveKills,
      totalWins: stats.informalWins + stats.competitiveWins,
    })).sort((a, b) => {
      const totalA = a.totalKills * 100 + a.totalWins;
      const totalB = b.totalKills * 100 + b.totalWins;
      return totalB - totalA;
    }).slice(0, 10);

    console.log("Returning", result.length, "arena players");
    res.json(result);
    
  } catch (error) {
    console.error("Arena leaderboard error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Admin groups endpoint
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

// Other required endpoints
app.get("/api/settings/general", (req, res) => {
  res.json({
    siteName: "LuvaNetwork",
    siteDescription: "Network hispanohablante de Hytale en construcción",
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
  });
});

app.get("/api/players/count", async (req, res) => {
  try {
    const [result] = await query("SELECT COUNT(*) as total FROM users");
    res.json({ total: Number(result?.total || 0) });
  } catch (error) {
    res.json({ total: 0 });
  }
});

app.get("/api/players/hours_count", async (req, res) => {
  try {
    const [result] = await query("SELECT COALESCE(SUM(playtime_seconds), 0) as totalSeconds FROM users");
    const totalSeconds = Number(result?.totalSeconds || 0);
    const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;
    res.json({ totalSeconds, totalHours });
  } catch (error) {
    res.json({ totalSeconds: 0, totalHours: 0 });
  }
});

// Generic leaderboard endpoint
app.get("/api/leaderboard/:gameMode/:metric", async (req, res) => {
  const { gameMode, metric } = req.params;
  
  if (gameMode === "arena") {
    // Redirect to arena-specific endpoint
    try {
      const response = await fetch(`http://localhost:${PORT}/api/arena/leaderboard`);
      const data = await response.json();
      
      const result = data.map(player => ({
        username: player.username,
        avatarUrl: player.avatarUrl,
        rank: player.rank,
        value: metric === "kills" ? player.totalKills : player.totalWins,
      }));
      
      return res.json(result);
    } catch (error) {
      return res.json([]);
    }
  }
  
  // Return empty for other modes
  res.json([]);
});

// Start server
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Arena server running on http://127.0.0.1:${PORT}`);
    console.log(`🌐 CORS origin: ${WEB_ORIGIN}`);
    console.log(`💾 Database: ${DB_CONFIG.host}/${DB_CONFIG.database}`);
  });
}

startServer().catch(console.error);