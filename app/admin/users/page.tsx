"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  Shield,
  Eye,
  X,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { ServerUser } from "@/app/lib/store";
import { serverUsersApi } from "@/app/lib/serverUsersApi";
import { useSearchParams } from "next/navigation";

type SortField = "username" | "joinedAt" | "lastSeen" | "playtimeSeconds";
type SortOrder = "asc" | "desc";

export default function UsersPage() {
  const searchParams = useSearchParams(); // Use useSearchParams here
  const [users, setUsers] = useState<ServerUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroup, setFilterGroup] = useState("all");
  const [sortField, setSortField] = useState<SortField>("lastSeen");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedUser, setSelectedUser] = useState<ServerUser | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await serverUsersApi.list();
        if (mounted) setUsers(list);
      } catch {
        if (mounted) setUsers([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Get unique groups from users
  const groups = useMemo(() => {
    const allGroups = users.flatMap((u) => u.groups);
    return ["all", ...Array.from(new Set(allGroups))];
  }, [users]);

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.uuid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGroup = filterGroup === "all" || user.groups.includes(filterGroup);
      return matchesSearch && matchesGroup;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "username":
          comparison = a.username.localeCompare(b.username);
          break;
        case "joinedAt":
          comparison = new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
          break;
        case "lastSeen":
          comparison = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
          break;
        case "playtimeSeconds":
          comparison = a.playtimeSeconds - b.playtimeSeconds;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [users, searchQuery, filterGroup, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const formatPlaytime = (seconds: number) => {
    if (seconds === 0) return "0h 0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-white mb-2">Usuarios</h1>
        <p className="text-gray-400">Lista de usuarios registrados en el servidor</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Total Usuarios</p>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Admins</p>
          <p className="text-3xl font-bold text-white">
            {users.filter((u) => u.groups.includes("admin")).length}
          </p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Activos Ultimos 7 Dias</p>
          <p className="text-3xl font-bold text-white">
            {users.filter((u) => {
              const lastSeen = new Date(u.lastSeen);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return lastSeen >= weekAgo;
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o UUID..."
            className="w-full pl-12 pr-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#965CD9]/50 cursor-pointer capitalize"
          >
            {groups.map((group) => (
              <option key={group} value={group}>
                {group === "all" ? "Todos los grupos" : group}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1a1a24] rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left">
                <th className="p-4">
                  <button
                    onClick={() => handleSort("username")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    Usuario
                    <SortIcon field="username" />
                  </button>
                </th>
                <th className="p-4 hidden md:table-cell">
                  <span className="text-gray-400 font-medium">Grupo</span>
                </th>
                <th className="p-4 hidden lg:table-cell">
                  <button
                    onClick={() => handleSort("joinedAt")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    Se unio
                    <SortIcon field="joinedAt" />
                  </button>
                </th>
                <th className="p-4">
                  <button
                    onClick={() => handleSort("lastSeen")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    Ultima vez
                    <SortIcon field="lastSeen" />
                  </button>
                </th>
                <th className="p-4 hidden sm:table-cell">
                  <button
                    onClick={() => handleSort("playtimeSeconds")}
                    className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    Tiempo jugado
                    <SortIcon field="playtimeSeconds" />
                  </button>
                </th>
                <th className="p-4 text-right">
                  <span className="text-gray-400 font-medium">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#965CD9]/20 flex items-center justify-center text-[#965CD9] font-bold uppercase">
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-500 text-xs font-mono truncate max-w-[120px]">
                          {user.uuid.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      user.primaryGroup === "admin"
                        ? "bg-red-500/10 text-red-400"
                        : user.primaryGroup === "mod"
                        ? "bg-blue-500/10 text-blue-400"
                        : user.primaryGroup === "vip"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}>
                      {user.primaryGroup}
                    </span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-gray-300 text-sm">{formatDate(user.joinedAt)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300 text-sm">{formatDate(user.lastSeen)}</span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-gray-300 text-sm">{formatPlaytime(user.playtimeSeconds)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          formatPlaytime={formatPlaytime}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
}

interface UserDetailModalProps {
  user: ServerUser;
  onClose: () => void;
  formatPlaytime: (seconds: number) => string;
  formatDateTime: (dateStr: string) => string;
}

function UserDetailModal({ user, onClose, formatPlaytime, formatDateTime }: UserDetailModalProps) {
  const [copied, setCopied] = useState(false);

  const copyUUID = () => {
    navigator.clipboard.writeText(user.uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a24] rounded-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-display text-white">Detalles del Usuario</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User avatar and name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#965CD9]/20 flex items-center justify-center text-[#965CD9] font-display text-2xl uppercase">
              {user.username.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-display text-white">{user.username}</h3>
              <div className="flex items-center gap-2 mt-1">
                {user.groups.map((group) => (
                  <span
                    key={group}
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      group === "admin"
                        ? "bg-red-500/10 text-red-400"
                        : group === "mod"
                        ? "bg-blue-500/10 text-blue-400"
                        : group === "vip"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* UUID */}
          <div className="p-4 bg-[#0a0a0e] rounded-xl">
            <label className="text-gray-400 text-xs uppercase mb-2 block">UUID</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-white font-mono text-sm bg-white/5 px-3 py-2 rounded-lg">
                {user.uuid}
              </code>
              <button
                onClick={copyUUID}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#0a0a0e] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <label className="text-gray-400 text-xs uppercase">Se unio</label>
              </div>
              <p className="text-white font-medium">{formatDateTime(user.joinedAt)}</p>
            </div>
            <div className="p-4 bg-[#0a0a0e] rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <label className="text-gray-400 text-xs uppercase">Ultima vez</label>
              </div>
              <p className="text-white font-medium">{formatDateTime(user.lastSeen)}</p>
            </div>
          </div>

          <div className="p-4 bg-[#0a0a0e] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <label className="text-gray-400 text-xs uppercase">Tiempo de juego total</label>
            </div>
            <p className="text-2xl font-bold text-white">{formatPlaytime(user.playtimeSeconds)}</p>
          </div>

          {/* Primary Group */}
          <div className="p-4 bg-[#0a0a0e] rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <label className="text-gray-400 text-xs uppercase">Grupo primario</label>
            </div>
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold uppercase ${
              user.primaryGroup === "admin"
                ? "bg-red-500/20 text-red-400"
                : user.primaryGroup === "mod"
                ? "bg-blue-500/20 text-blue-400"
                : user.primaryGroup === "vip"
                ? "bg-green-500/20 text-green-400"
                : "bg-gray-500/20 text-gray-400"
            }`}>
              {user.primaryGroup}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Export the Loading component to wrap the page in a Suspense boundary
export function Loading() {
  return null; // The Loading component should return null
}
