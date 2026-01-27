"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Search,
  Filter,
  X,
  Save,
  ImageIcon,
} from "lucide-react";
import { newsApi } from "@/app/lib/newsApi";
import { generateSlug, type NewsPost } from "@/app/lib/store";
import { DiscordMarkdown, markdownButtons } from "@/app/lib/discord-markdown";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const categories = [
  "Novedad",
  "Actualizacion",
  "Evento",
  "Mantenimiento",
  "Guia",
  "Comunidad",
];

function Loading() {
  return null;
}

export default function NewsAdminPage() {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [editingPost, setEditingPost] = useState<NewsPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadNews();
  }, [searchParams]);

  const loadNews = async () => {
    try {
      const list = await newsApi.listAdmin();
      setNews(list);
    } catch {
      setNews([]);
    }
  };

  const filteredNews = news.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Estas seguro de eliminar esta noticia?")) return;
    try {
      await newsApi.remove(id);
      await loadNews();
    } catch {
      // ignore
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await newsApi.update(id, { isPublished: !currentStatus });
      await loadNews();
    } catch {
      // ignore
    }
  };

  const handleSave = async (post: NewsPost) => {
    try {
      if (isCreating) {
        await newsApi.create({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl,
          category: post.category,
          author: post.author,
          isPublished: post.isPublished,
          publishedAt: post.isPublished ? new Date().toISOString() : post.publishedAt,
        });
      } else {
        await newsApi.update(post.id, post);
      }
    } finally {
      setEditingPost(null);
      setIsCreating(false);
      await loadNews();
    }
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingPost({
      id: "",
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      coverImageUrl: "",
      category: "Novedad",
      author: "LuvaNetwork",
      isPublished: false,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display text-white mb-2">Noticias</h1>
            <p className="text-gray-400">Administra las noticias y anuncios del servidor</p>
          </div>

          <button
            onClick={startCreate}
            className="flex items-center gap-2 px-6 py-2 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Noticia
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar noticias..."
              className="w-full pl-12 pr-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#965CD9]/50 cursor-pointer"
            >
              <option value="all">Todas las categorias</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* News List */}
        <div className="space-y-4">
          {filteredNews.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1a1a24] rounded-xl border border-white/5 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Cover image preview */}
                  <div className="w-24 h-24 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl || "/placeholder.svg"}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        post.isPublished 
                          ? "bg-green-500/10 text-green-400" 
                          : "bg-gray-500/10 text-gray-400"
                      }`}>
                        {post.isPublished ? "Publicado" : "Borrador"}
                      </span>
                      <span className="px-2 py-1 bg-[#FFC107]/10 text-[#FFC107] rounded text-xs font-bold">
                        {post.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-display text-white mb-2 truncate">
                      {post.title || "Sin titulo"}
                    </h3>

                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                      {post.excerpt || "Sin descripcion"}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(post.id, post.isPublished)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        post.isPublished
                          ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          : "bg-gray-500/10 text-gray-400 hover:bg-gray-500/20"
                      }`}
                      title={post.isPublished ? "Despublicar" : "Publicar"}
                    >
                      {post.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setEditingPost(post);
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredNews.length === 0 && (
            <div className="text-center py-12 bg-[#1a1a24] rounded-xl border border-white/5">
              <Newspaper className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No se encontraron noticias</p>
              <button
                onClick={startCreate}
                className="mt-4 text-[#965CD9] hover:text-[#B58CFF] cursor-pointer"
              >
                Crear la primera noticia
              </button>
            </div>
          )}
        </div>

        {/* Editor Modal */}
        {editingPost && (
          <NewsEditor
            post={editingPost}
            isNew={isCreating}
            onSave={handleSave}
            onCancel={() => {
              setEditingPost(null);
              setIsCreating(false);
            }}
          />
        )}
      </div>
    </Suspense>
  );
}

interface NewsEditorProps {
  post: NewsPost;
  isNew: boolean;
  onSave: (post: NewsPost) => void;
  onCancel: () => void;
}

function NewsEditor({ post, isNew, onSave, onCancel }: NewsEditorProps) {
  const [formData, setFormData] = useState<NewsPost>(post);
  const [showPreview, setShowPreview] = useState(false);
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const handleChange = (field: keyof NewsPost, value: any) => {
    setFormData({ ...formData, [field]: value });

    if (field === "title") {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
    }
  };

  const insertMarkdown = (prefix: string, suffix: string) => {
    if (!textareaRef) return;

    const start = textareaRef.selectionStart;
    const end = textareaRef.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);

    const newText =
      text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);

    setFormData({ ...formData, content: newText });

    setTimeout(() => {
      if (textareaRef) {
        textareaRef.focus();
        const newCursorPos = start + prefix.length + selectedText.length;
        textareaRef.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1a1a24] rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-display text-white">
            {isNew ? "Crear Noticia" : "Editar Noticia"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                showPreview
                  ? "bg-[#965CD9] text-white"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {showPreview ? "Editor" : "Vista Previa"}
            </button>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showPreview ? (
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                {formData.coverImageUrl && (
                  <img
                    src={formData.coverImageUrl || "/placeholder.svg"}
                    alt={formData.title}
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-[#FFC107] text-black rounded-lg font-bold text-sm">
                    {formData.category}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(formData.publishedAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
                <h1 className="text-4xl font-display text-white mb-4">
                  {formData.title || "Sin titulo"}
                </h1>
                <p className="text-xl text-gray-400 mb-8">{formData.excerpt}</p>
                <DiscordMarkdown content={formData.content} />
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Titulo
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Titulo de la noticia"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    placeholder="titulo-de-la-noticia"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripcion corta
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange("excerpt", e.target.value)}
                  placeholder="Breve descripcion para la vista previa..."
                  rows={2}
                  className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#965CD9]/50 cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Autor
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => handleChange("author", e.target.value)}
                    placeholder="Nombre del autor"
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    URL de imagen de portada
                  </label>
                  <input
                    type="text"
                    value={formData.coverImageUrl}
                    onChange={(e) => handleChange("coverImageUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50"
                  />
                </div>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contenido (Markdown de Discord)
                </label>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 p-2 bg-[#0a0a0e] border border-white/10 border-b-0 rounded-t-xl">
                  {markdownButtons.map((btn) => (
                    <button
                      key={btn.label}
                      onClick={() => insertMarkdown(btn.prefix, btn.suffix)}
                      title={btn.tooltip}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded font-mono text-sm transition-colors cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={setTextareaRef}
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  placeholder="# Titulo

Escribe tu contenido aqui usando **markdown de Discord**...

- Lista de items
- Otro item

> Cita importante

`codigo inline`

```
bloque de codigo
```"
                  rows={15}
                  className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-b-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#965CD9]/50 resize-none font-mono text-sm"
                />

                <p className="mt-2 text-gray-500 text-xs">
                  Soporta: **negrita**, *cursiva*, __subrayado__, ~~tachado~~, `codigo`, {'```'}bloque{'```'}, # titulos, {'>'} citas, - listas, ||spoiler||
                </p>
              </div>

              {/* Publish toggle */}
              <div className="flex items-center gap-4 p-4 bg-[#0a0a0e] rounded-xl">
                <div className="flex-1">
                  <p className="text-white font-medium">Publicar noticia</p>
                  <p className="text-gray-500 text-sm">
                    Si esta activo, la noticia sera visible para todos los usuarios
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => handleChange("isPublished", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.title || !formData.slug}
            className="flex items-center gap-2 px-6 py-2 bg-[#965CD9] hover:bg-[#A878E6] text-white rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isNew ? "Crear Noticia" : "Guardar Cambios"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
