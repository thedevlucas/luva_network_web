"use client";

import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import {
  Crown,
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Save,
  X,
  Check,
  Star,
  DollarSign,
} from "lucide-react";
import type { Rank, RankBenefit } from "@/app/lib/store";
import { ranksApi } from "@/app/lib/ranksApi";

export default function RanksPage() {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadRanks();
  }, []);

  const loadRanks = async () => {
    try {
      const loadedRanks = await ranksApi.list();
      setRanks(loadedRanks);
    } catch {
      setRanks([]);
    }
  };

  const handleReorder = (newOrder: Rank[]) => {
    setRanks(newOrder);
    setHasChanges(true);
  };

  const saveOrder = async () => {
    try {
      // Persist the new order by updating each rank with its new `order`.
      await Promise.all(
        ranks.map((r, idx) => ranksApi.update(r.id, { order: idx }))
      );
      setHasChanges(false);
      await loadRanks();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Estas seguro de eliminar este rango?")) return;
    try {
      await ranksApi.remove(id);
      await loadRanks();
    } catch {
      // ignore
    }
  };

  const handleSaveRank = async (rank: Rank) => {
    try {
      if (isCreating) {
        await ranksApi.create({
          name: rank.name,
          displayName: rank.displayName,
          price: rank.price,
          color: rank.color,
          order: ranks.length,
          benefits: rank.benefits,
          isPopular: rank.isPopular,
        });
      } else {
        await ranksApi.update(rank.id, rank);
      }
    } finally {
      setEditingRank(null);
      setIsCreating(false);
      await loadRanks();
    }
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingRank({
      id: "",
      name: "",
      displayName: "",
      price: 0,
      color: "#965CD9",
      order: ranks.length,
      benefits: [],
      isPopular: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Rangos</h1>
          <p className="text-gray-400">Administra los rangos de la tienda. Arrastra para reordenar.</p>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <button
              onClick={saveOrder}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Orden
            </button>
          )}
          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-6 py-2 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Rango
          </button>
        </div>
      </div>

      {/* Ranks List */}
      <Reorder.Group
        axis="y"
        values={ranks}
        onReorder={handleReorder}
        className="space-y-4"
      >
        {ranks.map((rank) => (
          <Reorder.Item
            key={rank.id}
            value={rank}
            className="bg-[#1a1a24] rounded-xl border border-white/5 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-300">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Color indicator */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${rank.color}20` }}
                >
                  <Crown className="w-6 h-6" style={{ color: rank.color }} />
                </div>

                {/* Rank Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display text-white">{rank.displayName}</h3>
                    {rank.isPopular && (
                      <span className="px-2 py-0.5 bg-[#965CD9]/20 text-[#B58CFF] text-xs rounded-full font-bold">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{rank.benefits.length} beneficios</p>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${rank.price.toFixed(2)}</p>
                  <p className="text-gray-500 text-sm">/mes</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setEditingRank(rank);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(rank.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Benefits Preview */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                  {rank.benefits.slice(0, 4).map((benefit) => (
                    <span
                      key={benefit.id}
                      className="px-3 py-1 bg-white/5 rounded-lg text-gray-300 text-sm"
                    >
                      {benefit.text}
                    </span>
                  ))}
                  {rank.benefits.length > 4 && (
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-gray-500 text-sm">
                      +{rank.benefits.length - 4} mas
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {ranks.length === 0 && (
        <div className="text-center py-12 bg-[#1a1a24] rounded-xl border border-white/5">
          <Crown className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No hay rangos creados todavia</p>
          <button
            onClick={startCreate}
            className="mt-4 text-[#965CD9] hover:text-[#B58CFF] cursor-pointer"
          >
            Crear el primer rango
          </button>
        </div>
      )}

      {/* Edit/Create Modal */}
      {editingRank && (
        <RankEditor
          rank={editingRank}
          isNew={isCreating}
          onSave={handleSaveRank}
          onCancel={() => {
            setEditingRank(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}

interface RankEditorProps {
  rank: Rank;
  isNew: boolean;
  onSave: (rank: Rank) => void;
  onCancel: () => void;
}

function RankEditor({ rank, isNew, onSave, onCancel }: RankEditorProps) {
  const [formData, setFormData] = useState<Rank>(rank);
  const [newBenefit, setNewBenefit] = useState("");

  const handleChange = (field: keyof Rank, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    const benefit: RankBenefit = {
      id: Date.now().toString(),
      text: newBenefit.trim(),
      order: formData.benefits.length,
    };
    setFormData({
      ...formData,
      benefits: [...formData.benefits, benefit],
    });
    setNewBenefit("");
  };

  const removeBenefit = (id: string) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter(b => b.id !== id),
    });
  };

  const handleBenefitReorder = (newOrder: RankBenefit[]) => {
    setFormData({
      ...formData,
      benefits: newOrder.map((b, i) => ({ ...b, order: i })),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a24] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-2xl font-display text-white">
            {isNew ? "Crear Rango" : "Editar Rango"}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre interno
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="vip"
                className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre a mostrar
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="VIP"
                className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#965CD9]/50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-14 h-12 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="flex-1 px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:border-[#965CD9]/50"
                />
              </div>
            </div>
          </div>

          {/* Popular toggle */}
          <div className="flex items-center gap-4 p-4 bg-[#0a0a0e] rounded-xl">
            <Star className="w-5 h-5 text-[#FFC107]" />
            <div className="flex-1">
              <p className="text-white font-medium">Marcar como Popular</p>
              <p className="text-gray-500 text-sm">Se mostrara destacado en la tienda</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => handleChange("isPopular", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#965CD9]"></div>
            </label>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Beneficios (arrastra para reordenar)
            </label>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addBenefit()}
                placeholder="Agregar beneficio..."
                className="flex-1 px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
              />
              <button
                onClick={addBenefit}
                className="px-4 py-3 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-xl cursor-pointer"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <Reorder.Group
              axis="y"
              values={formData.benefits}
              onReorder={handleBenefitReorder}
              className="space-y-2"
            >
              {formData.benefits.map((benefit) => (
                <Reorder.Item
                  key={benefit.id}
                  value={benefit}
                  className="flex items-center gap-3 p-3 bg-[#0a0a0e] rounded-xl group"
                >
                  <GripVertical className="w-4 h-4 text-gray-500 cursor-grab active:cursor-grabbing" />
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="flex-1 text-gray-300">{benefit.text}</span>
                  <button
                    onClick={() => removeBenefit(benefit.id)}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {formData.benefits.length === 0 && (
              <p className="text-center py-4 text-gray-500 text-sm">
                Agrega beneficios para este rango
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.name || !formData.displayName}
            className="px-6 py-2 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isNew ? "Crear Rango" : "Guardar Cambios"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
