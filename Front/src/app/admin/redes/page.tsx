'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { SocialLink } from '@/types/database.types';
import {
  Share2,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Upload,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  X,
  MessageCircle,
  Send,
  Video,
  Instagram,
  Facebook,
  Globe,
  Youtube,
  Twitter,
} from 'lucide-react';

const PRESET_ICONS = [
  { id: 'message-circle', label: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
  { id: 'send', label: 'Telegram', icon: Send, color: '#0088cc' },
  { id: 'video', label: 'TikTok', icon: Video, color: '#FF007F' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E1306C' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
  { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'globe', label: 'Sitio Web / Enlace', icon: Globe, color: '#00D2FF' },
];

export default function AdminRedesPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

  // Bloquea scroll del fondo cuando el modal está abierto
  useBodyScrollLock(modalOpen);

  // Campos del formulario
  const [nombre, setNombre] = useState('');
  const [url, setUrl] = useState('');
  const [iconoUrl, setIconoUrl] = useState('');
  const [iconoNombre, setIconoNombre] = useState('message-circle');
  const [orden, setOrden] = useState('0');
  const [activo, setActivo] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;
      if (data) setLinks(data as SocialLink[]);
    } catch (err: any) {
      console.error('Error al cargar redes sociales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const openCreateModal = () => {
    setEditingLink(null);
    setNombre('');
    setUrl('');
    setIconoUrl('');
    setIconoNombre('message-circle');
    setOrden(String(links.length + 1));
    setActivo(true);
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (link: SocialLink) => {
    setEditingLink(link);
    setNombre(link.nombre);
    setUrl(link.url);
    setIconoUrl(link.icono_url || '');
    setIconoNombre(link.icono_nombre || 'globe');
    setOrden(String(link.orden || 0));
    setActivo(link.activo);
    setErrorMsg(null);
    setModalOpen(true);
  };

  // Subir icono personalizado a Supabase Storage
  const handleUploadIcon = async (file: File) => {
    try {
      setUploadingImage(true);
      const ext = file.name.split('.').pop();
      const path = `social/icon_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('catalogo').getPublicUrl(path);

      setIconoUrl(publicUrl);
    } catch (err: any) {
      console.error('Error subiendo icono:', err);
      alert('Error al subir imagen de icono: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Guardar (Crear o Actualizar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !url.trim()) {
      setErrorMsg('Nombre y URL de la red social son obligatorios.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const payload = {
        nombre: nombre.trim(),
        url: url.trim(),
        icono_url: iconoUrl.trim() || null,
        icono_nombre: iconoNombre,
        orden: parseInt(orden) || 0,
        activo,
        updated_at: new Date().toISOString(),
      };

      if (editingLink) {
        const { error } = await supabase
          .from('social_links')
          .update(payload)
          .eq('id', editingLink.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('social_links').insert([payload]);
        if (error) throw error;
      }

      setModalOpen(false);
      fetchLinks();
    } catch (err: any) {
      console.error('Error al guardar red social:', err);
      setErrorMsg(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleActive = async (link: SocialLink) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .update({ activo: !link.activo, updated_at: new Date().toISOString() })
        .eq('id', link.id);

      if (error) throw error;
      setLinks((prev) =>
        prev.map((l) => (l.id === link.id ? { ...l, activo: !link.activo } : l))
      );
    } catch (err: any) {
      console.error('Error al cambiar visibilidad:', err);
      alert('Error: ' + err.message);
    }
  };

  // Eliminar red social
  const handleDelete = async (link: SocialLink) => {
    if (!confirm(`¿Eliminar la red "${link.nombre}" de forma permanente?`)) return;

    try {
      const { error } = await supabase.from('social_links').delete().eq('id', link.id);
      if (error) throw error;
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
    } catch (err: any) {
      console.error('Error al eliminar red:', err);
      alert('Error: ' + err.message);
    }
  };

  // Renderizar icono gráfico
  const renderIcon = (link: SocialLink) => {
    if (link.icono_url) {
      return (
        <img
          src={link.icono_url}
          alt={link.nombre}
          className="w-5 h-5 object-contain rounded"
        />
      );
    }

    const preset = PRESET_ICONS.find((p) => p.id === link.icono_nombre);
    if (preset) {
      const IconComponent = preset.icon;
      return <IconComponent className="w-5 h-5" style={{ color: preset.color }} />;
    }

    return <Globe className="w-5 h-5 text-neon-cyan" />;
  };

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-magenta/15 border border-magenta/30 text-magenta-light text-[11px] font-mono uppercase mb-2">
            <Share2 className="w-3.5 h-3.5 text-magenta" />
            <span>Canales de Contacto & Comunidad</span>
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Gestor de Redes Sociales
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Administra los enlaces oficiales que dirigen a tu comunidad y soporte. Los cambios se actualizan de inmediato en los botones del pie de página (Footer).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-neon-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ Agregar Red Social</span>
        </button>
      </div>

      {/* LISTA DE REDES */}
      <div className="cyber-panel rounded-2xl border-neon/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neon/20 bg-pitch/90 text-[10px] font-mono uppercase tracking-wider text-ice/80">
                <th className="p-4">Orden</th>
                <th className="p-4">Icono</th>
                <th className="p-4">Nombre de la Red</th>
                <th className="p-4">Enlace / URL de Destino</th>
                <th className="p-4">Estado en Footer</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neon/15 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ice/60">
                    Cargando canales de redes sociales...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ice/60">
                    No hay redes sociales configuradas aún. Pulsa "+ Agregar Red Social" para crear la primera.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-pitch/60 transition-colors">
                    {/* ORDEN */}
                    <td className="p-4 text-ice/70 font-bold">#{link.orden}</td>

                    {/* ICONO */}
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-xl bg-pitch border border-neon/30 flex items-center justify-center p-2 shadow-sm">
                        {renderIcon(link)}
                      </div>
                    </td>

                    {/* NOMBRE */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{link.nombre}</div>
                    </td>

                    {/* URL */}
                    <td className="p-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-cyan hover:underline inline-flex items-center gap-1.5 max-w-xs truncate"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>

                    {/* ESTADO */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(link)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          link.activo
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                            : 'bg-pitch text-slate-400 border-slate-600 hover:text-white'
                        }`}
                      >
                        {link.activo ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-400" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-400" />
                            <span>Oculto</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* ACCIONES */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(link)}
                          className="p-1.5 rounded-lg bg-pitch border border-neon/40 text-neon hover:bg-neon/20 transition-all"
                          title="Editar red social"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(link)}
                          className="p-1.5 rounded-lg bg-pitch border border-magenta/40 text-magenta hover:bg-magenta/20 transition-all"
                          title="Eliminar red social"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto overscroll-contain animate-fadeIn">
          <div className="cyber-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full border-neon/40 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto overscroll-contain">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-ice/60 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon-cyan text-[10px] font-mono uppercase mb-2">
                <Share2 className="w-3 h-3 text-neon" />
                <span>{editingLink ? 'Modificar Enlace' : 'Nueva Red Social'}</span>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                {editingLink ? 'Editar Canal de Red Social' : 'Vincular Red Social'}
              </h3>
              <p className="text-xs font-mono text-ice/70 mt-1">
                Conecta WhatsApp, Telegram, TikTok o cualquier canal a los botones del pie de página.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-magenta/15 border border-magenta text-xs font-mono text-pure">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-1">
                  Nombre de la Red o Canal <span className="text-magenta">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: WhatsApp Oficial, Canal de Telegram, TikTok"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-pitch border border-neon/30 text-xs font-mono text-pure focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-1">
                  URL / Enlace Directo <span className="text-magenta">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://wa.me/584121234567 o https://instagram.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-pitch border border-neon/30 text-xs font-mono text-pure focus:outline-none focus:border-neon-cyan"
                />
              </div>

              {/* SELECCIÓN DE ICONO */}
              <div className="space-y-3 pt-2 border-t border-neon/15">
                <label className="block text-xs font-mono uppercase text-ice">
                  Seleccionar Icono o Subir Logo Personalizado:
                </label>

                {/* ICONOS PREDEFINIDOS */}
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_ICONS.map((preset) => {
                    const IconComp = preset.icon;
                    const isSelected = iconoNombre === preset.id && !iconoUrl;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setIconoNombre(preset.id);
                          setIconoUrl('');
                        }}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-neon/20 border-neon shadow-neon-border text-white'
                            : 'bg-pitch border-neon/20 text-ice/70 hover:border-neon/40'
                        }`}
                      >
                        <IconComp className="w-5 h-5" style={{ color: preset.color }} />
                        <span className="text-[10px] font-mono truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* SUBIR IMAGEN O LOGO PERSONALIZADO */}
                <div className="p-3 rounded-xl bg-pitch border border-neon/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy/80 border border-neon/30 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {iconoUrl ? (
                        <img src={iconoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                      ) : (
                        <Upload className="w-4 h-4 text-ice/40" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-mono text-pure block">Logo Personalizado (PNG, SVG, JPG)</span>
                      <span className="text-[10px] text-ice/60 font-mono">
                        {iconoUrl ? 'Logo subido con éxito' : 'Opcional si deseas tu propio archivo gráfico'}
                      </span>
                    </div>
                  </div>

                  <label className="btn-ice-pill px-3 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0">
                    <span>{uploadingImage ? 'Subiendo...' : 'Subir Logo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingImage}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadIcon(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* ORDEN Y VISIBILIDAD */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neon/15">
                <div>
                  <label className="block text-xs font-mono uppercase text-ice mb-1">
                    Orden de Visualización
                  </label>
                  <input
                    type="number"
                    value={orden}
                    onChange={(e) => setOrden(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-pitch border border-neon/30 text-xs font-mono text-pure focus:outline-none focus:border-neon-cyan"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-pitch border border-neon/20 cursor-pointer hover:border-neon/40 select-none">
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={(e) => setActivo(e.target.checked)}
                      className="w-4 h-4 rounded border-neon/40 bg-pitch text-neon focus:ring-neon accent-[#00D2FF]"
                    />
                    <span className="text-xs font-mono text-ice">Visible en Footer</span>
                  </label>
                </div>
              </div>

              {/* BOTONES MODAL */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono text-ice/70 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="btn-neon-pill px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <span>{saving ? 'Guardando...' : editingLink ? 'Guardar Cambios' : 'Vincular Red'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

