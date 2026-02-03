const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8082;
const WEB_ORIGIN = "http://localhost:3000";

app.use(express.json());
app.use(
  cors({
    origin: WEB_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

// Settings endpoint with defaults
app.get("/api/settings/general", (req, res) => {
  const defaultSettings = {
    siteName: "LuvaNetwork",
    siteDescription: "Network hispanohablante de Hytale en construcción: minijuegos, sistemas propios y comunidad metiendo mano desde el día uno.",
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

  res.json(defaultSettings);
});

// Players count endpoint
app.get("/api/players/count", (req, res) => {
  res.json({ total: 493 });
});

// Players hours count endpoint
app.get("/api/players/hours_count", (req, res) => {
  res.json({ totalSeconds: 1785600, totalHours: 496 });
});

// Admin endpoints
app.get("/api/admin/groups", (req, res) => {
  const groups = [
    {
      id: 1,
      name: "default",
      displayName: "Usuario",
      weight: 0,
      isDefault: true,
      type: "group",
      permissionCount: 0,
      memberCount: 2,
    },
    {
      id: 2,
      name: "vip",
      displayName: "VIP",
      weight: 10,
      isDefault: false,
      type: "group", 
      permissionCount: 0,
      memberCount: 1,
    },
    {
      id: 3,
      name: "admin",
      displayName: "Administrador",
      weight: 500,
      isDefault: false,
      type: "group",
      permissionCount: 8,
      memberCount: 2,
    }
  ];

  res.json(groups);
});

app.get("/api/admin/groups/:name", (req, res) => {
  const groupName = req.params.name;
  
  const groups = {
    "default": {
      id: 1,
      name: "default",
      displayName: "Usuario",
      weight: 0,
      isDefault: true,
      type: "group",
      permissions: [],
      members: [
        {
          id: 1,
          userId: 160,
          username: "imAndix",
          uuid: "2d440a28-d746-41d1-a2bd-906c3bc82832",
          isPrimary: true,
          expiresAt: null,
        }
      ]
    },
    "admin": {
      id: 3,
      name: "admin", 
      displayName: "Administrador",
      weight: 500,
      isDefault: false,
      type: "group",
      permissions: [
        {
          id: 1,
          permission: "luva.admin.breakblocks",
          value: 1,
          server: "global",
          world: "global"
        },
        {
          id: 2,
          permission: "luva.hologram.create",
          value: 1,
          server: "global",
          world: "global"
        }
      ],
      members: [
        {
          id: 2,
          userId: 2,
          username: "rehen",
          uuid: "b8acc972-307f-4ed3-8083-f7941cb24c8b",
          isPrimary: true,
          expiresAt: null,
        },
        {
          id: 3,
          userId: 152,
          username: "Carriedo",
          uuid: "cf97dc66-495a-4e07-a932-e821b5c75af8",
          isPrimary: true,
          expiresAt: null,
        }
      ]
    }
  };

  const group = groups[groupName];
  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  res.json(group);
});

app.get("/api/admin/stats", (req, res) => {
  res.json({
    totalUsers: 493,
    totalNews: 1,
    publishedNews: 1,
    totalRanks: 3,
    onlineUsers: 12,
  });
});

app.get("/api/admin/users", (req, res) => {
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
});

// Auth endpoint for testing (no real auth)
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  
  // Accept any username/password for testing
  if (!username || !password) {
    return res.status(400).json({ error: "Missing username/password" });
  }

  res.json({
    token: "fake-jwt-token-for-testing",
    user: { 
      id: 1, 
      username: username, 
      role: "admin" 
    }
  });
});

// Additional endpoints needed
app.get("/api/admin/news", (req, res) => {
  res.json([
    {
      id: 1,
      slug: "apertura-del-servidor-muy-pronto-web-oficial-inaugurada",
      title: "📰 🚀 Apertura del servidor muy pronto + ¡Web oficial inaugurada!",
      excerpt: "El servidor de Luva Network está por abrir y ya podés visitar la web oficial. Gracias por la paciencia: lo mejor está por comenzar.",
      content: "# Hola, comunidad de Luva Network. 👋\nQueremos informarles que el equipo continúa trabajando de manera constante y dedicada en el desarrollo del proyecto.",
      coverImageUrl: "/_next/static/media/bg-adventure--1.2109a75f.jpg",
      category: "Actualizacion",
      author: "LuvaNetwork",
      isPublished: true,
      publishedAt: "2026-01-30T00:50:55.000Z",
      createdAt: "2026-01-22T22:24:54.000Z",
      updatedAt: "2026-01-30T02:15:00.000Z",
    }
  ]);
});

app.get("/api/ranks", (req, res) => {
  res.json([
    {
      id: 1,
      name: "vip",
      displayName: "VIP",
      price: 5.00,
      color: "#965CD9",
      order: 0,
      benefits: [],
      isPopular: false,
    },
    {
      id: 2,
      name: "vip+",
      displayName: "VIP+",
      price: 10.00,
      color: "#FFD700",
      order: 1,
      benefits: [],
      isPopular: true,
    }
  ]);
});

app.get("/api/news", (req, res) => {
  res.json([
    {
      id: 1,
      slug: "apertura-del-servidor-muy-pronto-web-oficial-inaugurada",
      title: "📰 🚀 Apertura del servidor muy pronto + ¡Web oficial inaugurada!",
      excerpt: "El servidor de Luva Network está por abrir y ya podés visitar la web oficial.",
      content: "# Hola, comunidad de Luva Network. 👋",
      coverImageUrl: "/_next/static/media/bg-adventure--1.2109a75f.jpg",
      createdAt: "2026-01-22T22:24:54.000Z",
    }
  ]);
});

app.get("/api/players/online", (req, res) => {
  res.json({
    windowSeconds: 90,
    count: 12,
    players: [
      {
        username: "Rehen",
        uuid: "b8acc972-307f-4ed3-8083-f7941cb24c8b",
        lastSeen: new Date().toISOString(),
      },
      {
        username: "Carriedo",
        uuid: "cf97dc66-495a-4e07-a932-e821b5c75af8",
        lastSeen: new Date().toISOString(),
      }
    ]
  });
});

app.get("/api/players/online_count", (req, res) => {
  res.json({ online: 12, windowSeconds: 90 });
});

// Arena leaderboard endpoint
app.get("/api/arena/leaderboard", (req, res) => {
  const fakeArenaData = [
    {
      username: "Rehen",
      uuid: "b8acc972-307f-4ed3-8083-f7941cb24c8b",
      avatarUrl: "https://hyvatar.io/render/Rehen?size=96",
      rank: "Owner",
      informalKills: 150,
      informalWins: 25,
      competitiveKills: 89,
      competitiveWins: 12,
      totalKills: 239,
      totalWins: 37,
    },
    {
      username: "Carriedo",
      uuid: "cf97dc66-495a-4e07-a932-e821b5c75af8",
      avatarUrl: "https://hyvatar.io/render/Carriedo?size=96",
      rank: "Admin",
      informalKills: 120,
      informalWins: 18,
      competitiveKills: 67,
      competitiveWins: 8,
      totalKills: 187,
      totalWins: 26,
    },
    {
      username: "zenbn",
      uuid: "d6a64f68-2094-45c3-ad6e-9f3c5c1673b3",
      avatarUrl: "https://hyvatar.io/render/zenbn?size=96",
      rank: "Moderator",
      informalKills: 95,
      informalWins: 15,
      competitiveKills: 45,
      competitiveWins: 6,
      totalKills: 140,
      totalWins: 21,
    }
  ];

  res.json(fakeArenaData);
});

// Generic leaderboard endpoint
app.get("/api/leaderboard/:gameMode/:metric", (req, res) => {
  const { gameMode, metric } = req.params;
  
  const fakeData = [
    {
      username: "Rehen",
      avatarUrl: "https://hyvatar.io/render/Rehen?size=96",
      rank: "Owner",
      value: 100,
    }
  ];

  res.json(fakeData);
});

app.listen(PORT, () => {
  console.log(`Simple server running on http://127.0.0.1:${PORT}`);
  console.log(`CORS origin: ${WEB_ORIGIN}`);
});