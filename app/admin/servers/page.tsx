"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Server,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Globe,
  Users,
  Activity,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { apiFetch } from "@/app/lib/apiClient";

interface ServerData {
  id: number;
  name: string;
  displayName: string;
  host: string;
  port: number;
  maxPlayers: number;
  currentPlayers: number;
  status: 'online' | 'offline' | 'maintenance';
  description: string;
  lastCheck: string;
  createdAt: string;
  isActive: boolean;
}

export default function ServersPage() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerData | null>(null);
  const [checkingAll, setCheckingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [newServer, setNewServer] = useState({
    name: '',
    displayName: '',
    host: '127.0.0.1',
    port: 1234,
    maxPlayers: 100,
    description: '',
  });

  useEffect(() => {
    fetchServers();
    
    // Auto-refresh servers data every 15 seconds
    const interval = setInterval(() => {
      if (!loading) {
        fetchServers();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [loading]);

  const fetchServers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<ServerData[]>("/api/admin/servers");
      setServers(data);
    } catch (err) {
      console.error("Error fetching servers:", err);
      setError("Error al cargar los servidores");
    } finally {
      setLoading(false);
    }
  };

  const handleAddServer = async () => {
    if (!newServer.name.trim()) return;

    try {
      await apiFetch("/api/admin/servers", {
        method: "POST",
        body: JSON.stringify(newServer),
      });
      
      setShowAddModal(false);
      setNewServer({
        name: '',
        displayName: '',
        host: '127.0.0.1',
        port: 1234,
        maxPlayers: 100,
        description: '',
      });
      setSuccess("Servidor agregado exitosamente");
      fetchServers();
    } catch (err) {
      console.error("Error adding server:", err);
      setError("Error al agregar el servidor");
    }
  };

  const handleUpdateServer = async () => {
    if (!editingServer) return;

    try {
      await apiFetch(`/api/admin/servers/${editingServer.id}`, {
        method: "PUT",
        body: JSON.stringify(editingServer),
      });
      
      setShowEditModal(false);
      setEditingServer(null);
      setSuccess("Servidor actualizado exitosamente");
      fetchServers();
    } catch (err) {
      console.error("Error updating server:", err);
      setError("Error al actualizar el servidor");
    }
  };

  const handleDeleteServer = async (serverId: number, serverName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el servidor "${serverName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await apiFetch(`/api/admin/servers/${serverId}`, { method: "DELETE" });
      setSuccess("Servidor eliminado exitosamente");
      fetchServers();
    } catch (err) {
      console.error("Error deleting server:", err);
      setError("Error al eliminar el servidor");
    }
  };

  const handleCheckServer = async (serverId: number) => {
    try {
      const response = await apiFetch(`/api/admin/servers/${serverId}/check-status`, {
        method: "POST",
      }) as any;
      
      if (response.success) {
        setSuccess("Estado del servidor actualizado");
        fetchServers();
      }
    } catch (err) {
      console.error("Error checking server:", err);
      setError("Error al verificar el estado del servidor");
    }
  };

  const handleCheckAllServers = async () => {
    try {
      setCheckingAll(true);
      const response = await apiFetch("/api/admin/servers/check-all", {
        method: "POST",
      }) as any;
      
      if (response.success) {
        setSuccess(`Verificados ${response.totalServers} servidores, ${response.updatedServers} actualizados`);
        fetchServers();
      }
    } catch (err) {
      console.error("Error checking all servers:", err);
      setError("Error al verificar todos los servidores");
    } finally {
      setCheckingAll(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'offline': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'maintenance': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Check className="w-4 h-4" />;
      case 'offline': return <X className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const totalPlayers = servers.reduce((sum, server) => sum + server.currentPlayers, 0);
  const totalSlots = servers.reduce((sum, server) => sum + server.maxPlayers, 0);
  const onlineServers = servers.filter(s => s.status === 'online').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Servidores</h1>
          <p className="text-gray-400">Gestiona los servidores de la red</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCheckAllServers}
            disabled={checkingAll || servers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {checkingAll ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            Verificar Todos
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Nuevo Servidor
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 flex-1">{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/5 rounded cursor-pointer">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3"
          >
            <Check className="w-5 h-5 text-green-400" />
            <span className="text-green-400 flex-1">{success}</span>
            <button onClick={() => setSuccess(null)} className="p-1 hover:bg-white/5 rounded cursor-pointer">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Total Servidores</p>
          <p className="text-3xl font-bold text-white">{servers.length}</p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">En Línea</p>
          <p className="text-3xl font-bold text-green-400">{onlineServers}</p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Jugadores Totales</p>
          <p className="text-3xl font-bold text-white">{totalPlayers.toLocaleString()}</p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Uso de Red</p>
          <p className="text-3xl font-bold text-white">
            {totalSlots > 0 ? Math.round((totalPlayers / totalSlots) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Servers List */}
      <div className="bg-[#1a1a24] rounded-xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#965CD9] animate-spin" />
          </div>
        ) : servers.length === 0 ? (
          <div className="p-8 text-center">
            <Server className="w-12 h-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No hay servidores configurados</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-lg transition-colors cursor-pointer"
            >
              Agregar Primer Servidor
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0a0e] border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Servidor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Jugadores
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Conexión
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Última Verificación
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {servers.map((server, index) => (
                  <motion.tr
                    key={server.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`${!server.isActive ? 'opacity-50' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          server.status === 'online' ? 'bg-green-500/20 text-green-400' :
                          server.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          <Server className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{server.displayName || server.name}</p>
                          <p className="text-gray-400 text-sm">{server.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(server.status)}`}>
                        {getStatusIcon(server.status)}
                        {server.status === 'online' ? 'En Línea' :
                         server.status === 'offline' ? 'Fuera de Línea' : 'Mantenimiento'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-white font-medium">{server.currentPlayers}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-400">{server.maxPlayers}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-[#965CD9] h-1.5 rounded-full transition-all"
                          style={{ width: `${server.maxPlayers > 0 ? (server.currentPlayers / server.maxPlayers) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Globe className="w-4 h-4" />
                        <span className="font-mono text-sm">{server.host}:{server.port}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {new Date(server.lastCheck).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCheckServer(server.id)}
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors cursor-pointer"
                          title="Verificar estado"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingServer(server);
                            setShowEditModal(true);
                          }}
                          className="p-2 rounded-lg bg-[#965CD9]/10 hover:bg-[#965CD9]/20 text-[#B58CFF] transition-colors cursor-pointer"
                          title="Editar servidor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteServer(server.id, server.name)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Eliminar servidor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Server Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a24] rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-display text-white">Agregar Nuevo Servidor</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Nombre del Servidor</label>
                  <input
                    type="text"
                    value={newServer.name}
                    onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                    placeholder="ej: survival, skyblock"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Nombre para Mostrar</label>
                  <input
                    type="text"
                    value={newServer.displayName}
                    onChange={(e) => setNewServer({ ...newServer, displayName: e.target.value })}
                    placeholder="ej: Survival Mode"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Host</label>
                    <input
                      type="text"
                      value={newServer.host}
                      onChange={(e) => setNewServer({ ...newServer, host: e.target.value })}
                      placeholder="127.0.0.1"
                      className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Puerto</label>
                    <input
                      type="number"
                      value={newServer.port}
                      onChange={(e) => setNewServer({ ...newServer, port: parseInt(e.target.value) || 1234 })}
                      placeholder="1234"
                      className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Jugadores Máximos</label>
                  <input
                    type="number"
                    value={newServer.maxPlayers}
                    onChange={(e) => setNewServer({ ...newServer, maxPlayers: parseInt(e.target.value) || 100 })}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Descripción</label>
                  <textarea
                    value={newServer.description}
                    onChange={(e) => setNewServer({ ...newServer, description: e.target.value })}
                    placeholder="Descripción del servidor..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 resize-none"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddServer}
                  disabled={!newServer.name.trim()}
                  className="flex-1 px-4 py-3 bg-[#965CD9] hover:bg-[#A878E6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  Agregar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Server Modal */}
      <AnimatePresence>
        {showEditModal && editingServer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a24] rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-display text-white">Editar Servidor</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Nombre del Servidor</label>
                  <input
                    type="text"
                    value={editingServer.name}
                    onChange={(e) => setEditingServer({ ...editingServer, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Nombre para Mostrar</label>
                  <input
                    type="text"
                    value={editingServer.displayName}
                    onChange={(e) => setEditingServer({ ...editingServer, displayName: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Host</label>
                    <input
                      type="text"
                      value={editingServer.host}
                      onChange={(e) => setEditingServer({ ...editingServer, host: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm mb-2 block">Puerto</label>
                    <input
                      type="number"
                      value={editingServer.port}
                      onChange={(e) => setEditingServer({ ...editingServer, port: parseInt(e.target.value) || 1234 })}
                      className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Jugadores Máximos</label>
                  <input
                    type="number"
                    value={editingServer.maxPlayers}
                    onChange={(e) => setEditingServer({ ...editingServer, maxPlayers: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Descripción</label>
                  <textarea
                    value={editingServer.description}
                    onChange={(e) => setEditingServer({ ...editingServer, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-[#0a0a0e] rounded-lg">
                  <span className="text-gray-300">Servidor Activo</span>
                  <button
                    onClick={() => setEditingServer({ ...editingServer, isActive: !editingServer.isActive })}
                    className="cursor-pointer"
                  >
                    {editingServer.isActive ? (
                      <ToggleRight className="w-8 h-8 text-green-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="p-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateServer}
                  className="flex-1 px-4 py-3 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  Actualizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}