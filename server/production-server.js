const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || "23.139.82.92",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "hytale",
  password: process.env.DB_PASS || "LuvaNetwork2024!",
  database: process.env.DB_NAME || "hytale",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function initDatabase() {
  try {
    console.log("🔌 Connecting to database:", DB_CONFIG.host, DB_CONFIG.database);
    pool = mysql.createPool(DB_CONFIG);
    
    // Test connection
    const [rows] = await pool.query("SELECT 1 as test");
    console.log("✅ Database connection successful:", rows[0]);
    
    // Check tables
    const [groupsCount] = await pool.query("SELECT COUNT(*) as total FROM `groups`");
    const [users] = await pool.query("SELECT COUNT(*) as total FROM users");
    const [userGroups] = await pool.query("SELECT COUNT(*) as total FROM user_groups");
    const [arenaStats] = await pool.query("SELECT COUNT(*) as total FROM arena_pvp_stats");
    
    console.log("📊 Database stats:");
    console.log(`   Groups: ${groupsCount[0].total}`);
    console.log(`   Users: ${users[0].total}`);
    console.log(`   User Groups: ${userGroups[0].total}`);
    console.log(`   Arena Stats: ${arenaStats[0].total}`);
    
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

async function query(sql, params = []) {
  if (!pool) throw new Error("Database not initialized");
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ Query error:", error.message);
    throw error;
  }
}

app.use(express.json());
app.use(cors({
  origin: WEB_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Arena leaderboard with real data
app.get("/api/arena/leaderboard", async (req, res) => {
  try {
    console.log("🏆 Fetching real arena leaderboard data...");
    
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

    // Combine all data
    const statsMap = new Map();

    // Process informal stats
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

    // Process competitive stats
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
        SELECT u.username, g.display_name, g.name
        FROM users u
        LEFT JOIN user_groups ug ON ug.user_id = u.id AND ug.is_primary = 1
        LEFT JOIN groups g ON g.id = ug.group_id
        WHERE u.username IN (${allUsernames.map(() => '?').join(',')})
      `, allUsernames);
      
      rankData.forEach(r => {
        rankMap.set(r.username, {
          displayName: r.display_name || r.name || 'Default',
          name: r.name || 'default'
        });
      });
    }

    // Convert to array and sort
    const result = Array.from(statsMap.values()).map(stats => ({
      ...stats,
      avatarUrl: `https://hyvatar.io/render/${stats.username}?size=96`,
      rank: rankMap.get(stats.username)?.displayName || 'Default',
      totalKills: stats.informalKills + stats.competitiveKills,
      totalWins: stats.informalWins + stats.competitiveWins,
    })).sort((a, b) => {
      const totalA = a.totalKills * 100 + a.totalWins;
      const totalB = b.totalKills * 100 + b.totalWins;
      return totalB - totalA;
    }).slice(0, 10);

    console.log(`🏆 Returning ${result.length} arena players`);
    res.json(result);
    
  } catch (error) {
    console.error("❌ Arena leaderboard error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Admin groups with real data from database
app.get("/api/admin/groups", async (req, res) => {
  try {
    console.log("👥 Fetching admin groups from database...");
    
    const groups = await query(`
      SELECT 
        g.id, 
        g.name, 
        g.display_name, 
        g.weight, 
        g.is_default,
        'group' AS type,
        (SELECT COUNT(*) FROM group_permissions gp WHERE gp.group_id = g.id) AS permission_count,
        (SELECT COUNT(*) FROM user_groups ug WHERE ug.group_id = g.id) AS member_count
      FROM \`groups\` g
      ORDER BY g.name ASC
    `);

    const result = groups.map(g => ({
      id: Number(g.id),
      name: g.name,
      displayName: g.display_name || g.name,
      weight: Number(g.weight || 0),
      isDefault: !!Number(g.is_default || 0),
      type: g.type || "group",
      permissionCount: Number(g.permission_count || 0),
      memberCount: Number(g.member_count || 0),
    }));

    console.log(`👥 Returning ${result.length} groups`);
    res.json(result);
  } catch (error) {
    console.error("❌ Admin groups error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Admin group details
app.get("/api/admin/groups/:name", async (req, res) => {
  try {
    const groupName = req.params.name;
    console.log(`👥 Fetching group details for: ${groupName}`);
    
    const groups = await query(`
      SELECT id, name, display_name, weight, is_default, 'group' AS type
      FROM \`groups\`
      WHERE name = ? LIMIT 1
    `, [groupName]);

    if (!groups || groups.length === 0) {
      return res.status(404).json({ error: "Group not found" });
    }

    const g = groups[0];
    
    const perms = await query(`
      SELECT id, permission, value, server, world
      FROM group_permissions
      WHERE group_id = ?
      ORDER BY permission ASC
    `, [g.id]);

    const members = await query(`
      SELECT 
        ug.id, u.id AS user_id, u.username, u.uuid,
        ug.is_primary, ug.expires_at
      FROM \`user_groups\` ug
      JOIN users u ON ug.user_id = u.id
      WHERE ug.group_id = ?
      ORDER BY u.username ASC
    `, [g.id]);

    const result = {
      id: Number(g.id),
      name: g.name,
      displayName: g.display_name || g.name,
      weight: Number(g.weight || 0),
      isDefault: !!Number(g.is_default || 0),
      type: g.type,
      permissions: perms.map(p => ({
        id: Number(p.id),
        permission: p.permission,
        value: Number(p.value ?? 0),
        server: p.server ?? "",
        world: p.world ?? "",
      })),
      members: members.map(m => ({
        id: Number(m.id),
        userId: Number(m.user_id),
        username: m.username,
        uuid: m.uuid,
        isPrimary: !!Number(m.is_primary ?? 0),
        expiresAt: m.expires_at,
      })),
    };

    res.json(result);
  } catch (error) {
    console.error("❌ Admin group details error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Web ranks with prefix support
app.get("/api/ranks", async (req, res) => {
  try {
    console.log("💎 Fetching ranks from database...");
    
    const ranks = await query(`
      SELECT * FROM \`ranks\` ORDER BY sort_order ASC, id ASC
    `);
    
    const ids = ranks.map(r => r.id);
    const benefits = await query(`
      SELECT * FROM rank_benefits WHERE rank_id IN (${ids.map(() => '?').join(',')})
      ORDER BY rank_id ASC, sort_order ASC, id ASC
    `, ids);

    const benefitByRank = new Map();
    benefits.forEach(b => {
      const key = String(b.rank_id);
      if (!benefitByRank.has(key)) benefitByRank.set(key, []);
      benefitByRank.get(key).push({
        id: String(b.id),
        text: b.text,
        order: Number(b.sort_order),
      });
    });

    const result = ranks.map(r => ({
      id: String(r.id),
      name: r.name,
      displayName: r.display_name,
      price: Number(r.price),
      color: r.color,
      order: Number(r.sort_order),
      benefits: benefitByRank.get(String(r.id)) || [],
      isPopular: !!Number(r.is_popular || 0),
    }));

    console.log(`💎 Returning ${result.length} ranks`);
    res.json(result);
  } catch (error) {
    console.error("❌ Ranks error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Update rank with prefix support
app.post("/api/admin/ranks", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.displayName) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const result = await pool.query(`
      INSERT INTO \`ranks\` (name, display_name, price, color, sort_order, is_popular, prefix)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      b.name,
      b.displayName,
      Number(b.price) || 0,
      b.color || "#965CD9",
      Number(b.order) || 0,
      b.isPopular ? 1 : 0,
      b.prefix || ""
    ]);

    const insertId = result[0].insertId;

    const benefits = Array.isArray(b.benefits) ? b.benefits : [];
    for (const ben of benefits) {
      await query(
        "INSERT INTO rank_benefits (rank_id, text, sort_order) VALUES (?, ?, ?)",
        [insertId, String(ben.text || ""), Number(ben.order) || 0]
      );
    }

    // Return the created rank
    const [newRank] = await query("SELECT * FROM ranks WHERE id = ? LIMIT 1", [insertId]);
    const [rankBenefits] = await query("SELECT * FROM \`rank_benefits\` WHERE rank_id = ? ORDER BY sort_order ASC", [insertId]);

    res.json({
      id: String(newRank.id),
      name: newRank.name,
      displayName: newRank.display_name,
      price: Number(newRank.price),
      color: newRank.color,
      order: Number(newRank.sort_order),
      prefix: newRank.prefix || "",
      benefits: rankBenefits.map(b => ({
        id: String(b.id),
        text: b.text,
        order: Number(b.sort_order),
      })),
      isPopular: !!Number(newRank.is_popular || 0),
    });
  } catch (error) {
    console.error("❌ Create rank error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Update existing rank
app.put("/api/admin/ranks/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const b = req.body || {};

    const rows = await query("SELECT id FROM ranks WHERE id = ? LIMIT 1", [id]);
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
      prefix: "prefix"
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
      await query(`UPDATE ranks SET ${sets.join(", ")} WHERE id = ?`, vals);
    }

    if (Array.isArray(b.benefits)) {
      await query("DELETE FROM \`rank_benefits\` WHERE rank_id = ?", [id]);
      for (const ben of b.benefits) {
        await query(
          "INSERT INTO rank_benefits (rank_id, text, sort_order) VALUES (?, ?, ?)",
          [id, String(ben.text || ""), Number(ben.order) || 0]
        );
      }
    }

    // Return updated rank
    const [updatedRank] = await query("SELECT * FROM \`ranks\` WHERE id = ? LIMIT 1", [id]);
    const [rankBenefits] = await query("SELECT * FROM \`rank_benefits\` WHERE rank_id = ? ORDER BY sort_order ASC", [id]);

    res.json({
      id: String(updatedRank.id),
      name: updatedRank.name,
      displayName: updatedRank.display_name,
      price: Number(updatedRank.price),
      color: updatedRank.color,
      order: Number(updatedRank.sort_order),
      prefix: updatedRank.prefix || "",
      benefits: rankBenefits.map(b => ({
        id: String(b.id),
        text: b.text,
        order: Number(b.sort_order),
      })),
      isPopular: !!Number(updatedRank.is_popular || 0),
    });
  } catch (error) {
    console.error("❌ Update rank error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Settings
app.get("/api/settings/general", async (req, res) => {
  try {
    const [settings] = await query("SELECT * FROM web_settings WHERE id = 1 LIMIT 1");
    
    if (settings) {
      res.json({
        siteName: settings.site_name,
        siteDescription: settings.site_description,
        logoUrl: settings.logo_url,
        faviconUrl: settings.favicon_url,
        serverIp: settings.server_ip,
        serverPort: Number(settings.server_port),
        discordUrl: settings.discord_url,
        youtubeUrl: settings.youtube_url,
        twitterUrl: settings.twitter_url,
        instagramUrl: settings.instagram_url,
        facebookUrl: settings.facebook_url,
        serverMaintenance: !!Number(settings.server_maintenance),
        serverMaintenanceMessage: settings.server_maintenance_message,
        webMaintenance: !!Number(settings.web_maintenance),
        webMaintenanceMessage: settings.web_maintenance_message,
        webMaintenanceEndDate: settings.web_maintenance_end_date,
        webMaintenanceShowCountdown: !!Number(settings.web_maintenance_show_countdown),
      });
    } else {
      // Default settings
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
    }
  } catch (error) {
    console.error("❌ Settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Players stats
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

// Generic leaderboard for arena mode
app.get("/api/leaderboard/:gameMode/:metric", async (req, res) => {
  try {
    const { gameMode, metric } = req.params;
    
    if (gameMode === "arena") {
      // Use real arena data
      const gameModeFilter = metric === "kills" ? "uhc_duel" : "competitive";
      
      const data = await query(`
        SELECT 
          aps.player_name as username,
          aps.player_uuid as uuid,
          ${metric === "kills" ? "COUNT(*) as value" : "COUNT(DISTINCT aps.match_id) as value"}
        FROM arena_pvp_stats aps
        WHERE aps.game_mode = ? AND aps.killer_uuid IS NOT NULL
        ${metric === "wins" ? "AND aps.match_id IS NOT NULL AND aps.killer_uuid = aps.player_uuid" : ""}
        GROUP BY aps.player_uuid, aps.player_name
        ORDER BY value DESC LIMIT 10
      `, [gameModeFilter]);

      // Get ranks
      const usernames = data.map(d => d.username);
      const rankMap = new Map();
      
      if (usernames.length > 0) {
        const rankData = await query(`
          SELECT u.username, g.display_name
          FROM users u
          LEFT JOIN user_groups ug ON ug.user_id = u.id AND ug.is_primary = 1
          LEFT JOIN groups g ON g.id = ug.group_id
          WHERE u.username IN (${usernames.map(() => '?').join(',')})
        `, usernames);
        
        rankData.forEach(r => {
          rankMap.set(r.username, r.display_name || 'Default');
        });
      }

      const result = data.map(row => ({
        username: row.username,
        avatarUrl: `https://hyvatar.io/render/${row.username}?size=96`,
        rank: rankMap.get(row.username) || 'Default',
        value: Number(row.value),
      }));

      return res.json(result);
    }

    // Return empty for other modes
    res.json([]);
  } catch (error) {
    console.error("❌ Leaderboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Production server running on http://127.0.0.1:${PORT}`);
    console.log(`🌐 CORS origin: ${WEB_ORIGIN}`);
    console.log(`💾 Database: ${DB_CONFIG.host}/${DB_CONFIG.database}`);
    console.log(`📊 Ready to serve real data from hytale database!`);
  });
}

startServer().catch(console.error);