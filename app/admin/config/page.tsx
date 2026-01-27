"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Globe,
  Server,
  Share2,
  AlertTriangle,
  Save,
  RotateCcw,
  Check,
  Youtube,
  Instagram,
  Facebook,
  ImageIcon as ImageIconComponent,
} from "lucide-react";
import { useSettings } from "@/app/contexts/SettingsContext";
import type { GeneralSettings } from "@/app/lib/store";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

type TabType = "general" | "server" | "social" | "maintenance";

export default function ConfigPage() {
  const { settings, updateSettings, refreshSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [formData, setFormData] = useState<GeneralSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof GeneralSettings, value: string | number | boolean) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);

    try {
      await updateSettings(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      await refreshSettings();
      setSaved(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#965CD9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "general" as TabType, label: "General", icon: Globe },
    { id: "server" as TabType, label: "Servidor", icon: Server },
    { id: "social" as TabType, label: "Redes Sociales", icon: Share2 },
    { id: "maintenance" as TabType, label: "Mantenimiento", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Configuracion</h1>
          <p className="text-gray-400">Administra la configuracion general del sitio</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Guardado!" : "Guardar Cambios"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-[#965CD9] text-white"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a24] rounded-xl p-6 border border-white/5"
      >
        {activeTab === "general" && (
          <div className="space-y-6">
            <h2 className="text-xl font-display text-white mb-4">Configuracion General</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripcion del Sitio
                </label>
                <input
                  type="text"
                  value={formData.siteDescription}
                  onChange={(e) => handleChange("siteDescription", e.target.value)}
                  className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL del Logo
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange("logoUrl", e.target.value)}
                    placeholder="/images/logo.png"
                    className="flex-1 px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  />
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl || "/placeholder.svg"} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIconComponent className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL del Favicon
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={formData.faviconUrl}
                    onChange={(e) => handleChange("faviconUrl", e.target.value)}
                    placeholder="/favicon.ico"
                    className="flex-1 px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  />
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    {formData.faviconUrl ? (
                      <img src={formData.faviconUrl || "/placeholder.svg"} alt="Favicon" className="w-8 h-8 object-contain" />
                    ) : (
                      <ImageIconComponent className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "server" && (
          <div className="space-y-6">
            <h2 className="text-xl font-display text-white mb-4">Configuracion del Servidor</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  IP del Servidor
                </label>
                <input
                  type="text"
                  value={formData.serverIp}
                  onChange={(e) => handleChange("serverIp", e.target.value)}
                  placeholder="play.server.com"
                  className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Puerto del Servidor
                </label>
                <input
                  type="number"
                  value={formData.serverPort}
                  onChange={(e) => handleChange("serverPort", parseInt(e.target.value) || 25565)}
                  placeholder="25565"
                  className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-300 text-sm">
                <strong>Nota:</strong> La IP del servidor se mostrara en la pagina principal y se usara para verificar el estado online.
              </p>
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="space-y-6">
            <h2 className="text-xl font-display text-white mb-4">Redes Sociales</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 flex items-center justify-center">
                  <DiscordIcon className="w-6 h-6 text-[#5865F2]" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
                  <input
                    type="url"
                    value={formData.discordUrl}
                    onChange={(e) => handleChange("discordUrl", e.target.value)}
                    placeholder="https://discord.gg/..."
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Youtube className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">YouTube</label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                    placeholder="https://youtube.com/@..."
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <XIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">X (Twitter)</label>
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => handleChange("twitterUrl", e.target.value)}
                    placeholder="https://x.com/..."
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-pink-400" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.instagramUrl}
                    onChange={(e) => handleChange("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.facebookUrl}
                    onChange={(e) => handleChange("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="space-y-8">
            <h2 className="text-xl font-display text-white mb-4">Modo Mantenimiento</h2>
            
            {/* Server Maintenance */}
            <div className="p-6 bg-[#0a0a0e] rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Server className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Mantenimiento del Servidor</h3>
                    <p className="text-gray-500 text-sm">El servidor de juego no estara disponible</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.serverMaintenance}
                    onChange={(e) => handleChange("serverMaintenance", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mensaje de Mantenimiento
                </label>
                <textarea
                  value={formData.serverMaintenanceMessage}
                  onChange={(e) => handleChange("serverMaintenanceMessage", e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors resize-none"
                />
              </div>
            </div>

            {/* Web Maintenance */}
            <div className="p-6 bg-[#0a0a0e] rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Mantenimiento de la Web</h3>
                    <p className="text-gray-500 text-sm">Los visitantes veran una pagina de mantenimiento</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.webMaintenance}
                    onChange={(e) => handleChange("webMaintenance", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mensaje de Mantenimiento
                  </label>
                  <textarea
                    value={formData.webMaintenanceMessage}
                    onChange={(e) => handleChange("webMaintenanceMessage", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.webMaintenanceShowCountdown}
                      onChange={(e) => handleChange("webMaintenanceShowCountdown", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#965CD9]"></div>
                  </label>
                  <span className="text-gray-300 text-sm">Mostrar cuenta regresiva</span>
                </div>

                {formData.webMaintenanceShowCountdown && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha y hora de finalizacion
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.webMaintenanceEndDate || ""}
                      onChange={(e) => handleChange("webMaintenanceEndDate", e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#965CD9]/50 transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>

            {formData.webMaintenance && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-yellow-300 text-sm">
                  <strong>Atencion:</strong> Cuando el mantenimiento web este activo, todos los visitantes (excepto administradores) veran la pagina de mantenimiento.
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
