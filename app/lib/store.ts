// Mock data store - simulates database with localStorage
// In production, replace with actual database calls

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  serverIp: string;
  serverPort: number;
  
  // Social links
  discordUrl: string;
  youtubeUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  
  // Maintenance
  serverMaintenance: boolean;
  serverMaintenanceMessage: string;
  webMaintenance: boolean;
  webMaintenanceMessage: string;
  webMaintenanceEndDate: string | null; // ISO date string
  webMaintenanceShowCountdown: boolean;
}

export interface Rank {
  id: string;
  name: string;
  displayName: string;
  price: number;
  color: string; // hex color
  order: number;
  benefits: RankBenefit[];
  isPopular: boolean;
}

export interface RankBenefit {
  id: string;
  text: string;
  order: number;
}

export interface NewsPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Discord markdown format
  coverImageUrl: string;
  category: string;
  author: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string; // In real app, this would be hashed
  role: 'admin' | 'moderator';
  lastLogin: string | null;
}

export interface ServerUser {
  id: number;
  username: string;
  uuid: string;
  joinedAt: string;
  lastSeen: string;
  playtimeSeconds: number;
  primaryGroup: string;
  groups: string[];
}

// Default settings
const defaultSettings: GeneralSettings = {
  siteName: 'LuvaNetwork',
  siteDescription: 'La mejor experiencia de Minecraft PvP en Latinoamerica',
  logoUrl: '/app/assets/logoluva_1768898408478.png',
  faviconUrl: '/favicon.ico',
  serverIp: 'play.LuvaNetwork.net',
  serverPort: 25565,
  
  discordUrl: 'https://discord.gg/luvanetwork',
  youtubeUrl: 'https://youtube.com/@luvanetwork',
  twitterUrl: 'https://twitter.com/luvanetwork',
  instagramUrl: 'https://instagram.com/luvanetwork',
  facebookUrl: 'https://facebook.com/luvanetwork',
  
  serverMaintenance: false,
  serverMaintenanceMessage: 'El servidor esta en mantenimiento. Vuelve pronto!',
  webMaintenance: false,
  webMaintenanceMessage: 'Estamos realizando mejoras en el sitio. Vuelve pronto!',
  webMaintenanceEndDate: null,
  webMaintenanceShowCountdown: false,
};

// Default admin users (from the Hytale database users with admin group)
const defaultAdminUsers: AdminUser[] = [
  {
    id: '1',
    username: 'rehen',
    passwordHash: 'admin123', // In production, use bcrypt
    role: 'admin',
    lastLogin: null,
  },
  {
    id: '2',
    username: 'zenbn',
    passwordHash: 'admin123',
    role: 'admin',
    lastLogin: null,
  },
];

// Default ranks (from the store page)
const defaultRanks: Rank[] = [
  {
    id: '1',
    name: 'VIP',
    displayName: 'VIP',
    price: 5.99,
    color: '#10B981',
    order: 0,
    isPopular: false,
    benefits: [
      { id: '1', text: 'Color de Chat: Verde', order: 0 },
      { id: '2', text: 'Prioridad en Cola: Baja', order: 1 },
      { id: '3', text: '1 Caja Misteriosa', order: 2 },
      { id: '4', text: 'Volar en Lobby', order: 3 },
    ],
  },
  {
    id: '2',
    name: 'MVP',
    displayName: 'MVP',
    price: 14.99,
    color: '#22D3D1',
    order: 1,
    isPopular: true,
    benefits: [
      { id: '1', text: 'Todo lo de VIP', order: 0 },
      { id: '2', text: 'Color de Chat: Aqua', order: 1 },
      { id: '3', text: 'Prioridad en Cola: Media', order: 2 },
      { id: '4', text: '5 Cajas Misteriosas', order: 3 },
      { id: '5', text: 'Acceso Beta', order: 4 },
    ],
  },
  {
    id: '3',
    name: 'ELITE',
    displayName: 'ELITE',
    price: 29.99,
    color: '#F59E0B',
    order: 2,
    isPopular: false,
    benefits: [
      { id: '1', text: 'Todo lo de MVP', order: 0 },
      { id: '2', text: 'Color de Chat: Dorado', order: 1 },
      { id: '3', text: 'Prioridad en Cola: Alta', order: 2 },
      { id: '4', text: '15 Cajas Misteriosas', order: 3 },
      { id: '5', text: 'Crear Clanes', order: 4 },
    ],
  },
];

// Default server users (from the SQL dump)
const defaultServerUsers: ServerUser[] = [
  {
    id: 2,
    username: 'rehen',
    uuid: 'b8acc972-307f-4ed3-8083-f7941cb24c8b',
    joinedAt: '2026-01-14T02:16:16',
    lastSeen: '2026-01-18T02:02:27',
    playtimeSeconds: 0,
    primaryGroup: 'admin',
    groups: ['admin'],
  },
  {
    id: 3,
    username: 'zenbn',
    uuid: 'd6a64f68-2094-45c3-ad6e-9f3c5c1673b3',
    joinedAt: '2026-01-17T16:34:30',
    lastSeen: '2026-01-18T01:45:11',
    playtimeSeconds: 0,
    primaryGroup: 'admin',
    groups: ['admin'],
  },
];

// Default news posts
const defaultNewsPosts: NewsPost[] = [
  {
    id: '1',
    slug: 'bienvenidos-a-luvanetwork',
    title: 'Bienvenidos a LuvaNetwork',
    excerpt: 'El servidor oficial de Hytale en Latinoamerica esta aqui. Preparate para la aventura!',
    content: `# Bienvenidos a LuvaNetwork

Estamos emocionados de anunciar el lanzamiento oficial de **LuvaNetwork**, el primer servidor de Hytale en Latinoamerica.

## Que ofrecemos?

- **Skywars** - Batallas epicas en islas flotantes
- **Survival** - Experiencia clasica mejorada
- **Duels** - Combate 1v1 competitivo

### Unite a nuestra comunidad

> Entra a nuestro Discord y conoce a otros jugadores!

\`\`\`
IP: play.LuvaNetwork.net
\`\`\`

*Nos vemos en el servidor!*`,
    coverImageUrl: '/app/assets/bg_1768898406606.png',
    category: 'Novedad',
    author: 'LuvaNetwork',
    isPublished: true,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Storage keys
const KEYS = {
  settings: 'luva_settings',
  ranks: 'luva_ranks',
  news: 'luva_news',
  adminUsers: 'luva_admin_users',
  serverUsers: 'luva_server_users',
  authSession: 'luva_auth_session',
};

// Helper to safely access localStorage
function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

// Settings API
export const settingsApi = {
  get: (): GeneralSettings => getStorage(KEYS.settings, defaultSettings),
  update: (settings: Partial<GeneralSettings>): GeneralSettings => {
    const current = settingsApi.get();
    const updated = { ...current, ...settings };
    setStorage(KEYS.settings, updated);
    return updated;
  },
  reset: (): GeneralSettings => {
    setStorage(KEYS.settings, defaultSettings);
    return defaultSettings;
  },
};

// Ranks API
export const ranksApi = {
  getAll: (): Rank[] => {
    const ranks = getStorage(KEYS.ranks, defaultRanks);
    return ranks.sort((a, b) => a.order - b.order);
  },
  get: (id: string): Rank | undefined => {
    const ranks = ranksApi.getAll();
    return ranks.find(r => r.id === id);
  },
  create: (rank: Omit<Rank, 'id'>): Rank => {
    const ranks = ranksApi.getAll();
    const newRank: Rank = {
      ...rank,
      id: Date.now().toString(),
    };
    setStorage(KEYS.ranks, [...ranks, newRank]);
    return newRank;
  },
  update: (id: string, data: Partial<Rank>): Rank | null => {
    const ranks = ranksApi.getAll();
    const index = ranks.findIndex(r => r.id === id);
    if (index === -1) return null;
    ranks[index] = { ...ranks[index], ...data };
    setStorage(KEYS.ranks, ranks);
    return ranks[index];
  },
  delete: (id: string): boolean => {
    const ranks = ranksApi.getAll();
    const filtered = ranks.filter(r => r.id !== id);
    if (filtered.length === ranks.length) return false;
    setStorage(KEYS.ranks, filtered);
    return true;
  },
  reorder: (orderedIds: string[]): Rank[] => {
    const ranks = ranksApi.getAll();
    const reordered = orderedIds.map((id, index) => {
      const rank = ranks.find(r => r.id === id);
      if (rank) return { ...rank, order: index };
      return null;
    }).filter(Boolean) as Rank[];
    setStorage(KEYS.ranks, reordered);
    return reordered;
  },
};

// News API
export const newsApi = {
  getAll: (): NewsPost[] => {
    const news = getStorage(KEYS.news, defaultNewsPosts);
    return news.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  },
  getPublished: (): NewsPost[] => {
    return newsApi.getAll().filter(n => n.isPublished);
  },
  get: (id: string): NewsPost | undefined => {
    return newsApi.getAll().find(n => n.id === id);
  },
  getBySlug: (slug: string): NewsPost | undefined => {
    return newsApi.getAll().find(n => n.slug === slug);
  },
  create: (post: Omit<NewsPost, 'id' | 'createdAt' | 'updatedAt'>): NewsPost => {
    const news = newsApi.getAll();
    const newPost: NewsPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStorage(KEYS.news, [...news, newPost]);
    return newPost;
  },
  update: (id: string, data: Partial<NewsPost>): NewsPost | null => {
    const news = newsApi.getAll();
    const index = news.findIndex(n => n.id === id);
    if (index === -1) return null;
    news[index] = { ...news[index], ...data, updatedAt: new Date().toISOString() };
    setStorage(KEYS.news, news);
    return news[index];
  },
  delete: (id: string): boolean => {
    const news = newsApi.getAll();
    const filtered = news.filter(n => n.id !== id);
    if (filtered.length === news.length) return false;
    setStorage(KEYS.news, filtered);
    return true;
  },
};

// Admin Users API
export const adminUsersApi = {
  getAll: (): AdminUser[] => getStorage(KEYS.adminUsers, defaultAdminUsers),
  authenticate: (username: string, password: string): AdminUser | null => {
    const users = adminUsersApi.getAll();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === password
    );
    if (user) {
      // Update last login
      const index = users.findIndex(u => u.id === user.id);
      users[index] = { ...user, lastLogin: new Date().toISOString() };
      setStorage(KEYS.adminUsers, users);
      return users[index];
    }
    return null;
  },
};

// Server Users API
export const serverUsersApi = {
  getAll: (): ServerUser[] => getStorage(KEYS.serverUsers, defaultServerUsers),
  get: (id: number): ServerUser | undefined => {
    return serverUsersApi.getAll().find(u => u.id === id);
  },
  getByUsername: (username: string): ServerUser | undefined => {
    return serverUsersApi.getAll().find(u => u.username.toLowerCase() === username.toLowerCase());
  },
};

// Auth Session API
export interface AuthSession {
  userId: string;
  username: string;
  role: 'admin' | 'moderator';
  loginAt: string;
}

export const authApi = {
  getSession: (): AuthSession | null => {
    return getStorage<AuthSession | null>(KEYS.authSession, null);
  },
  login: (username: string, password: string): AuthSession | null => {
    const user = adminUsersApi.authenticate(username, password);
    if (!user) return null;
    
    const session: AuthSession = {
      userId: user.id,
      username: user.username,
      role: user.role,
      loginAt: new Date().toISOString(),
    };
    setStorage(KEYS.authSession, session);
    return session;
  },
  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(KEYS.authSession);
    }
  },
  isAuthenticated: (): boolean => {
    return authApi.getSession() !== null;
  },
};

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
