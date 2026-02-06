"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Newspaper,
  Crown,
  Server,
  TrendingUp,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Globe,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useSettings } from "@/app/contexts/SettingsContext";
import { adminApi } from "@/app/lib/adminApi";
import { newsApi } from "@/app/lib/newsApi";
import { apiFetch } from "@/app/lib/apiClient";
import type { NewsPost } from "@/app/lib/store";

interface ServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number;
  latency: number;
  version: string;
}

export default function AdminDashboard() {
  const { settings } = useSettings();
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNews: 0,
    totalRanks: 0,
    publishedNews: 0,
  });
  const [serverStats, setServerStats] = useState({
    totalServers: 0,
    onlineServers: 0,
    totalPlayers: 0,
    totalSlots: 0,
  });
  const [recentNews, setRecentNews] = useState<NewsPost[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await adminApi.stats();
        if (mounted) {
          setStats({
            totalUsers: s.totalUsers,
            totalNews: s.totalNews,
            totalRanks: s.totalRanks,
            publishedNews: s.publishedNews,
          });
        }
        
        // Fetch server statistics
        try {
          const serverResponse = await apiFetch('/api/servers/total-players') as any;
          if (mounted && serverResponse.success) {
            const serversData = await apiFetch('/api/admin/servers') as any[];
            if (serversData) {
              const onlineServers = serversData.filter((s: any) => s.status === 'online' && s.isActive).length;
              const totalSlots = serversData.reduce((sum: number, s: any) => sum + s.maxPlayers, 0);
              
              setServerStats({
                totalServers: serversData.length,
                onlineServers,
                totalPlayers: serverResponse.totalPlayers,
                totalSlots,
              });
            }
          }
        } catch (serverError) {
          console.error("Error fetching server stats:", serverError);
          if (mounted) {
            setServerStats({
              totalServers: 0,
              onlineServers: 0,
              totalPlayers: 0,
              totalSlots: 0,
            });
          }
        }
        
        try {
          const posts = await newsApi.listAdmin();
          if (mounted) setRecentNews(posts);
        } catch {
          if (mounted) setRecentNews([]);
        }
      } catch {
        // keep zeros on error
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-refresh server stats every 15 seconds
  useEffect(() => {
    let mounted = true;
    const interval = setInterval(async () => {
      try {
        const serverResponse = await apiFetch('/api/servers/total-players') as any;
        if (mounted && serverResponse.success) {
          const serversData = await apiFetch('/api/admin/servers') as any[];
          if (serversData) {
            const onlineServers = serversData.filter((s: any) => s.status === 'online' && s.isActive).length;
            const totalSlots = serversData.reduce((sum: number, s: any) => sum + s.maxPlayers, 0);
            
            setServerStats({
              totalServers: serversData.length,
              onlineServers,
              totalPlayers: serverResponse.totalPlayers,
              totalSlots,
            });
          }
        }
      } catch (error) {
        console.error("Error refreshing server stats:", error);
      }
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const checkServerStatus = async () => {
    if (!settings?.serverIp) return;
    
    setIsCheckingServer(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (settings.serverMaintenance) {
        setServerStatus({
          online: false,
          players: 0,
          maxPlayers: 100,
          latency: 0,
          version: "Mantenimiento",
        });
      } else {
        setServerStatus({
          online: Math.random() > 0.2,
          players: Math.floor(Math.random() * 50) + 10,
          maxPlayers: 100,
          latency: Math.floor(Math.random() * 50) + 20,
          version: "Hytale 1.0",
        });
      }
    } catch (error) {
      setServerStatus({
        online: false,
        players: 0,
        maxPlayers: 0,
        latency: 0,
        version: "Error",
      });
    } finally {
      setIsCheckingServer(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, [settings?.serverIp, settings?.serverMaintenance]);

  const statCards = [
    {
      label: "Usuarios Registrados",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Noticias Publicadas",
      value: `${stats.publishedNews}/${stats.totalNews}`,
      icon: Newspaper,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      label: "Rangos Configurados",
      value: stats.totalRanks,
      icon: Crown,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    {
      label: "Jugadores Online",
      value: serverStats.totalPlayers,
      icon: Activity,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  ];

  const serverStatCards = [
    {
      label: "Total Servidores",
      value: serverStats.totalServers,
      icon: Server,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      label: "Servidores En Línea",
      value: `${serverStats.onlineServers}/${serverStats.totalServers}`,
      icon: Wifi,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      label: "Capacidad Total",
      value: `${serverStats.totalSlots} slots`,
      icon: Globe,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      label: "Uso de Red",
      value: `${serverStats.totalSlots > 0 ? Math.round((serverStats.totalPlayers / serverStats.totalSlots) * 100) : 0}%`,
      icon: TrendingUp,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Bienvenido al panel de administracion de LuvaNetwork</p>
      </div>

      {/* Maintenance Alerts */}
      {(settings?.serverMaintenance || settings?.webMaintenance) && (
        <div className="space-y-3">
          {settings.serverMaintenance && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl"
            >
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-orange-300">El servidor esta en modo mantenimiento</span>
            </motion.div>
          )}
          {settings.webMaintenance && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">La pagina web esta en modo mantenimiento</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-[#1a1a24] rounded-xl p-6 border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Server Statistics */}
      <div>
        <h2 className="text-xl font-display text-white mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-[#965CD9]" />
          Estadísticas de Servidores
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serverStatCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={`bg-[#1a1a24] rounded-xl p-6 border ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Server Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1a1a24] rounded-xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-[#965CD9]" />
              Estado del Servidor
            </h2>
            <button
              onClick={checkServerStatus}
              disabled={isCheckingServer}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isCheckingServer ? "animate-spin" : ""}`} />
            </button>
          </div>

          {serverStatus ? (
            <div className="space-y-4">
              {/* Status indicator */}
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  serverStatus.online ? "bg-green-500/10" : "bg-red-500/10"
                }`}>
                  {serverStatus.online ? (
                    <Wifi className="w-8 h-8 text-green-400" />
                  ) : (
                    <WifiOff className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <div>
                  <p className={`text-2xl font-bold ${serverStatus.online ? "text-green-400" : "text-red-400"}`}>
                    {serverStatus.online ? "ONLINE" : "OFFLINE"}
                  </p>
                  <p className="text-gray-400 text-sm">{settings?.serverIp}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Jugadores</p>
                  <p className="text-white font-bold">
                    {serverStatus.players}/{serverStatus.maxPlayers}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Latencia</p>
                  <p className="text-white font-bold">{serverStatus.latency}ms</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase mb-1">Version</p>
                  <p className="text-white font-bold">{serverStatus.version}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-[#965CD9] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1a24] rounded-xl p-6 border border-white/5"
        >
          <h2 className="text-xl font-display text-white flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5 text-[#965CD9]" />
            Configuracion Actual
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-gray-400">Nombre del sitio</span>
              <span className="text-white font-medium">{settings?.siteName || "No configurado"}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-gray-400">IP del servidor</span>
              <span className="text-white font-mono">{settings?.serverIp || "No configurado"}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <span className="text-gray-400">Mantenimiento servidor</span>
              <span className={`flex items-center gap-2 ${settings?.serverMaintenance ? "text-orange-400" : "text-green-400"}`}>
                {settings?.serverMaintenance ? (
                  <>
                    <XCircle className="w-4 h-4" /> Activo
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Inactivo
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-400">Mantenimiento web</span>
              <span className={`flex items-center gap-2 ${settings?.webMaintenance ? "text-orange-400" : "text-green-400"}`}>
                {settings?.webMaintenance ? (
                  <>
                    <XCircle className="w-4 h-4" /> Activo
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Inactivo
                  </>
                )}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#1a1a24] rounded-xl p-6 border border-white/5"
      >
        <h2 className="text-xl font-display text-white flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-[#965CD9]" />
          Ultimas Noticias
        </h2>

        <div className="space-y-3">
          {recentNews.slice(0, 5).map((post, i) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 bg-[#0a0a0e] rounded-xl"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                post.isPublished ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
              }`}>
                <Newspaper className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{post.title}</p>
                <p className="text-gray-500 text-sm">
                  {new Date(post.publishedAt).toLocaleDateString("es-ES")} - {post.author}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                post.isPublished 
                  ? "bg-green-500/10 text-green-400" 
                  : "bg-gray-500/10 text-gray-400"
              }`}>
                {post.isPublished ? "Publicado" : "Borrador"}
              </span>
            </div>
          ))}

          {recentNews.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay noticias creadas todavia
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
