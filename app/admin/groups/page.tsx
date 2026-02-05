"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  Plus,
  Trash2,
  Eye,
  X,
  Users,
  Key,
  Check,
  AlertTriangle,
  Loader2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { apiFetch } from "@/app/lib/apiClient";
import { useSearchParams } from "next/navigation";


interface Group {
  id: number;
  name: string;
  displayName: string;
  type: string;
  permissionCount: number;
  memberCount: number;
}

interface Permission {
  id: number;
  permission: string;
  value: boolean;
  server: string;
  world: string;
  expiry: number | null;
  contexts: string;
}

interface GroupMember {
  id: number;
  username: string;
  uuid: string;
  isPrimary: boolean;
}

interface GroupDetail {
  id: number;
  name: string;
  displayName: string;
  type: string;
  permissions: Permission[];
  members: GroupMember[];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddPermissionModal, setShowAddPermissionModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newPermission, setNewPermission] = useState("");
  const [creating, setCreating] = useState(false);
  const [addingPermission, setAddingPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [updatingGroup, setUpdatingGroup] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Group[]>("/api/admin/groups");
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setError("Error al cargar los grupos");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetail = async (groupName: string) => {
    try {
      setLoadingDetail(true);
      const data = await apiFetch<GroupDetail>(`/api/admin/groups/${groupName}`);
      setSelectedGroup(data);
      setEditDisplayName(data.displayName);
      setShowEditGroupModal(true);
    } catch (err) {
      console.error("Error fetching group detail:", err);
      setError("Error al cargar el detalle del grupo");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      setCreating(true);
      await apiFetch("/api/admin/groups", {
        method: "POST",
        body: JSON.stringify({ name: newGroupName.toLowerCase().trim() }),
      });
      setShowCreateModal(false);
      setNewGroupName("");
      fetchGroups();
    } catch (err) {
      console.error("Error creating group:", err);
      setError("Error al crear el grupo");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (!confirm(`Estas seguro de eliminar el grupo "${groupName}"? Esta accion no se puede deshacer.`)) {
      return;
    }

    try {
      await apiFetch(`/api/admin/groups/${groupName}`, { method: "DELETE" });
      if (selectedGroup?.name === groupName) {
        setSelectedGroup(null);
      }
      fetchGroups();
    } catch (err) {
      console.error("Error deleting group:", err);
      setError("Error al eliminar el grupo");
    }
  };

  const handleEditGroup = (group: Group) => {
    // Fetch full group details for editing
    fetchGroupDetail(group.name);
    setEditDisplayName(group.displayName);
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup || !editDisplayName.trim()) return;

    try {
      setUpdatingGroup(true);
      await apiFetch(`/api/admin/groups/${selectedGroup.name}`, {
        method: "PATCH",
        body: JSON.stringify({ displayName: editDisplayName.trim() }),
      });
      setShowEditGroupModal(false);
      setEditDisplayName("");
      setEditingGroup(null);
      fetchGroups();
    } catch (err) {
      console.error("Error updating group:", err);
      setError("Error al actualizar el grupo");
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission.trim() || !selectedGroup) return;

    try {
      setAddingPermission(true);
      await apiFetch(`/api/admin/groups/${selectedGroup.name}/permissions`, {
        method: "POST",
        body: JSON.stringify({ permission: newPermission.trim() }),
      });
      setShowAddPermissionModal(false);
      setNewPermission("");
      fetchGroupDetail(selectedGroup.name);
    } catch (err) {
      console.error("Error adding permission:", err);
      setError("Error al agregar el permiso");
    } finally {
      setAddingPermission(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim() || !selectedGroup) return;

    try {
      setAddingMember(true);
      await apiFetch(`/api/admin/groups/${selectedGroup.name}/members`, {
        method: "POST",
        body: JSON.stringify({ username: newMemberName.trim() }),
      });
      setShowAddMemberModal(false);
      setNewMemberName("");
      fetchGroupDetail(selectedGroup.name);
    } catch (err) {
      console.error("Error adding member:", err);
      setError("Error al agregar el miembro al grupo");
    } finally {
      setAddingMember(false);
    }
  };

  const handleDeletePermission = async (permissionId: number) => {
    if (!selectedGroup) return;

    try {
      await apiFetch(`/api/admin/groups/${selectedGroup.name}/permissions/${permissionId}`, {
        method: "DELETE",
      });
      fetchGroupDetail(selectedGroup.name);
    } catch (err) {
      console.error("Error deleting permission:", err);
      setError("Error al eliminar el permiso");
    }
  };

  const handleTogglePermission = async (permissionId: number, currentValue: boolean) => {
    if (!selectedGroup) return;

    try {
      await apiFetch(`/api/admin/groups/${selectedGroup.name}/permissions/${permissionId}`, {
        method: "PATCH",
        body: JSON.stringify({ value: !currentValue }),
      });
      fetchGroupDetail(selectedGroup.name);
    } catch (err) {
      console.error("Error toggling permission:", err);
      setError("Error al cambiar el permiso");
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Grupos</h1>
          <p className="text-gray-400">Gestiona los grupos y sus permisos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Nuevo Grupo
        </button>
      </div>

      {/* Error Alert */}
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
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Total Grupos</p>
          <p className="text-3xl font-bold text-white">{groups.length}</p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Total Permisos</p>
          <p className="text-3xl font-bold text-white">
            {groups.reduce((acc, g) => acc + g.permissionCount, 0)}
          </p>
        </div>
        <div className="bg-[#1a1a24] rounded-xl p-4 border border-white/5">
          <p className="text-gray-400 text-sm">Usuarios en Grupos</p>
          <p className="text-3xl font-bold text-white">
            {groups.reduce((acc, g) => acc + g.memberCount, 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar grupo..."
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
            />
          </div>

          {/* Groups */}
          <div className="bg-[#1a1a24] rounded-xl border border-white/5 overflow-hidden">
            {loading ? (
              <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#965CD9] animate-spin" />
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="p-8 text-center">
                <Shield className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">No se encontraron grupos</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredGroups.map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${
                      selectedGroup?.name === group.name ? "bg-[#965CD9]/10 border-l-2 border-l-[#965CD9]" : ""
                    }`}
                    onClick={() => fetchGroupDetail(group.name)}
                  >
<div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                       <div
                         className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                           group.name === "admin"
                             ? "bg-red-500/20 text-red-400"
                             : group.name === "mod"
                             ? "bg-blue-500/20 text-blue-400"
                             : group.name === "vip"
                             ? "bg-green-500/20 text-green-400"
                             : "bg-[#965CD9]/20 text-[#965CD9]"
                         }`}
                       >
                         <Shield className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-white font-medium capitalize">{group.name}</p>
                         <p className="text-gray-400 text-sm">
                           {group.displayName}
                         </p>
                         <p className="text-gray-500 text-xs">
                           {group.permissionCount} permisos - {group.memberCount} miembros
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       {group.name !== "default" && (
                         <>
                           <button
                             onClick={() => handleEditGroup(group)}
                             className="p-2 rounded-lg bg-[#965CD9]/10 hover:bg-[#965CD9]/20 text-[#B58CFF] transition-colors cursor-pointer"
                             title="Editar grupo"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-11a2 2 0 0 0-2-2z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 9 6-6 6 6" />
                             </svg>
                           </button>
                           <button
                             onClick={() => handleDeleteGroup(group.name)}
                             className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                             title="Eliminar grupo"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </>
                       )}
                       <ChevronRight className="w-5 h-5 text-gray-500" />
                     </div>
                   </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Group Detail */}
        <div className="lg:col-span-2">
          {loadingDetail ? (
            <div className="bg-[#1a1a24] rounded-xl border border-white/5 p-8 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#965CD9] animate-spin" />
            </div>
          ) : selectedGroup ? (
            <div className="bg-[#1a1a24] rounded-xl border border-white/5 overflow-hidden">
              {/* Group Header */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        selectedGroup.name === "admin"
                          ? "bg-red-500/20 text-red-400"
                          : selectedGroup.name === "mod"
                          ? "bg-blue-500/20 text-blue-400"
                          : selectedGroup.name === "vip"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-[#965CD9]/20 text-[#965CD9]"
                      }`}
                    >
                      <Shield className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-display text-white capitalize">{selectedGroup.name}</h2>
                      <p className="text-gray-400 text-sm">Tipo: {selectedGroup.type}</p>
                    </div>
                  </div>
                  {selectedGroup.name !== "default" && (
                    <button
                      onClick={() => handleDeleteGroup(selectedGroup.name)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                      title="Eliminar grupo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Permissions Section */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#965CD9]" />
                    <h3 className="text-lg font-medium text-white">
                      Permisos ({(selectedGroup.permissions ?? []).length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddPermissionModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#965CD9]/20 hover:bg-[#965CD9]/30 text-[#B58CFF] rounded-lg transition-colors text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {selectedGroup.permissions.length === 0 ? (
                  <div className="text-center py-8 bg-[#0a0a0e] rounded-xl">
                    <Key className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Este grupo no tiene permisos</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {(selectedGroup.permissions ?? []).map((perm) => (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-3 bg-[#0a0a0e] rounded-lg group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleTogglePermission(perm.id, perm.value)}
                            className="cursor-pointer"
                            title={perm.value ? "Desactivar" : "Activar"}
                          >
                            {perm.value ? (
                              <ToggleRight className="w-6 h-6 text-green-400" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-gray-500" />
                            )}
                          </button>
                          <code className="text-sm text-gray-300 truncate">{perm.permission}</code>
                          {perm.server !== "global" && (
                            <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                              {perm.server}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeletePermission(perm.id)}
                          className="p-1.5 rounded bg-transparent hover:bg-red-500/10 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Members Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#965CD9]" />
                    <h3 className="text-lg font-medium text-white">
                      Miembros ({(selectedGroup.members ?? []).length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#965CD9]/20 hover:bg-[#965CD9]/30 text-[#B58CFF] rounded-lg transition-colors text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar
                  </button>
                </div>

                {(selectedGroup.members ?? []).length === 0 ? (
                  <div className="text-center py-8 bg-[#0a0a0e] rounded-xl">
                    <Users className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Este grupo no tiene miembros</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-2">
                    {(selectedGroup.members ?? []).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-[#0a0a0e] rounded-lg border border-white/5"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#965CD9]/20 flex items-center justify-center text-[#965CD9] font-bold uppercase text-sm">
                          {member.username.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{member.username}</p>
                          <p className="text-gray-500 text-xs font-mono truncate">{member.uuid.slice(0, 8)}...</p>
                        </div>
                        {member.isPrimary && (
                          <span className="text-xs px-2 py-0.5 bg-[#965CD9]/20 text-[#B58CFF] rounded">
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a24] rounded-xl border border-white/5 p-8 flex flex-col items-center justify-center min-h-[400px]">
              <Shield className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">Selecciona un grupo para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a24] rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-display text-white">Crear Nuevo Grupo</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Nombre del grupo</label>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="ej: vip, moderador, builder"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                  <p className="text-gray-500 text-xs mt-2">El nombre se guardara en minusculas</p>
                </div>
              </div>
              <div className="p-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={creating || !newGroupName.trim()}
                  className="flex-1 px-4 py-3 bg-[#965CD9] hover:bg-[#A878E6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Crear
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Permission Modal */}
      <AnimatePresence>
        {showAddPermissionModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a24] rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-display text-white">Agregar Permiso</h2>
                <button
                  onClick={() => setShowAddPermissionModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-[#0a0a0e] rounded-lg">
                  <p className="text-gray-400 text-sm">Grupo:</p>
                  <p className="text-white font-medium capitalize">{selectedGroup.name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Permiso</label>
                  <input
                    type="text"
                    value={newPermission}
                    onChange={(e) => setNewPermission(e.target.value)}
                    placeholder="ej: essentials.fly, worldedit.wand"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowAddPermissionModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPermission}
                  disabled={addingPermission || !newPermission.trim()}
                  className="flex-1 px-4 py-3 bg-[#965CD9] hover:bg-[#A878E6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {addingPermission ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  Agregar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
    <AnimatePresence>
      {showAddMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#1a1a24] rounded-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-display text-white">Agregar Miembro</h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-[#0a0a0e] rounded-lg">
                <p className="text-gray-400 text-sm">Agregar como:</p>
                {/* AQUÍ ESTÁ EL CAMBIO: Ponemos "miembro" en lugar de selectedGroup.name */}
                <p className="text-white font-medium capitalize">miembro</p> 
              </div>
              <div>
                <label htmlFor="member-name" className="text-gray-400 text-sm mb-2 block">Nombre del Usuario</label>
                <input
                  id="member-name"
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="Nombre del jugador..."
                  className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/5 flex gap-3">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddMember}
                disabled={addingMember || !newMemberName.trim()}
                className="flex-1 px-4 py-3 bg-[#965CD9] hover:bg-[#A878E6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {addingMember ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                Agregar
              </button>
            </div>
          </motion.div>
        </div>
      )}
</AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {showEditGroupModal && selectedGroup && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1a1a24] rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-display text-white">Editar Grupo</h2>
                <button
                  onClick={() => setShowEditGroupModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-[#0a0a0e] rounded-lg">
                  <p className="text-gray-400 text-sm">Grupo:</p>
                  <p className="text-white font-medium capitalize">{selectedGroup.name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Display Name</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    placeholder="Nombre para mostrar del grupo"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowEditGroupModal(false)}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateGroup}
                  disabled={updatingGroup || !editDisplayName.trim()}
                  className="flex-1 px-4 py-3 bg-[#965CD9] hover:bg-[#A878E6] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  {updatingGroup ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
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