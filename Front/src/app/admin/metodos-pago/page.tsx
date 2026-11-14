'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PaymentMethod } from '@/types/database.types';
import { Upload, X, Image as ImageIcon, Edit2, Trash2, PlusCircle, Check, AlertTriangle } from 'lucide-react';

export default function AdminMetodosPagoPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario: Creación / Edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [formato, setFormato] = useState<'solo_numeros' | 'solo_letras' | 'alfanumerico'>('solo_numeros');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Subir logo o QR del método de pago a Supabase Storage
  const handleUploadLogo = async (file: File) => {
    try {
      setUploadingLogo(true);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const cleanName = nombre.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'metodo';
      const path = `metodos_pago/${cleanName}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('catalogo')
        .getPublicUrl(path);

      setLogoUrl(publicUrl);
    } catch (err: any) {
      console.error('Error subiendo logo de pago:', err);
      alert('Error al subir logo: ' + (err.message || err));
    } finally {
      setUploadingLogo(false);
    }
  };

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('nombre_metodo', { ascending: true });
      if (error) throw error;
      setMethods(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  // Iniciar edición de un método
  const handleStartEdit = (method: PaymentMethod) => {
    const methodId = method.id || method.metodo_id || '';
    setEditingId(methodId);
    setNombre(method.nombre_metodo || '');
    setFormato((method.formato_requerido as any) || 'solo_numeros');
    setLogoUrl(method.logo_url || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setNombre('');
    setFormato('solo_numeros');
    setLogoUrl('');
  };

  // Alternar estado activo/inactivo
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ activo: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchMethods();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Eliminar definitivamente un método de pago
  const handleDeleteMethod = async (id: string, nombreMetodo: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar DEFINITIVAMENTE el método de pago "${nombreMetodo}"?\n\nEsta acción borrará el canal permanentemente del sistema.`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') {
          alert(
            `No se puede eliminar "${nombreMetodo}" porque existen recargas o pedidos históricos vinculados a este método de pago.\n\nTe sugerimos usar el botón "DESACTIVAR" para ocultarlo a los clientes sin perder el historial.`
          );
        } else {
          alert('Error al eliminar método: ' + error.message);
        }
        return;
      }

      if (editingId === id) {
        handleCancelEdit();
      }

      await fetchMethods();
    } catch (err: any) {
      alert('Error inesperado: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Guardar (Crear o Actualizar) método
  const handleSubmitMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      setSubmitting(true);

      if (editingId) {
        // MODO EDICIÓN
        const { error } = await supabase
          .from('payment_methods')
          .update({
            nombre_metodo: nombre.trim(),
            formato_requerido: formato,
            logo_url: logoUrl.trim() || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        handleCancelEdit();
      } else {
        // MODO CREACIÓN
        const { error } = await supabase.from('payment_methods').insert({
          nombre_metodo: nombre.trim(),
          formato_requerido: formato,
          logo_url: logoUrl.trim() || null,
          activo: true,
        });

        if (error) throw error;
        setNombre('');
        setLogoUrl('');
      }

      await fetchMethods();
    } catch (err: any) {
      alert('Error guardando método: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
          <span>❄</span> Módulo 6.4: Canales de Pago & Validación de Referencias
        </div>
        <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
          Métodos de Pago y Depósito
        </h1>
        <p className="text-xs text-ice/70 font-mono mt-1">
          Habilita, desactiva, edita o elimina definitivamente pasarelas (Binance, Pago Móvil, Zelle, etc.) y especifica reglas de validación.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario de Alta / Edición (5 COLS) */}
        <div className="lg:col-span-5 cyber-panel rounded-2xl p-6 border-neon/30">
          <div className="flex items-center justify-between pb-3 border-b border-neon/20 mb-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-pure flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${editingId ? 'bg-gold shadow-[0_0_8px_#FBBF24]' : 'bg-neon shadow-[0_0_8px_#00D2FF]'}`} />
              {editingId ? 'Editar Canal de Pago' : 'Nuevo Canal de Pago'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] font-mono text-magenta hover:text-white px-2 py-1 rounded border border-magenta/30 hover:bg-magenta/20"
              >
                ✕ Cancelar edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitMethod} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Nombre del Canal / Banco:
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Binance Pay (USDT)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Formato de Referencia Requerido:
              </label>
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              >
                <option value="solo_numeros">Solo Números (Ej: Pago Móvil / Depósito)</option>
                <option value="alfanumerico">Alfanumérico (Ej: Binance TxID / Hash)</option>
                <option value="solo_letras">Solo Letras</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Logo o Ícono (PNG, JPG, WEBP):
              </label>

              {logoUrl && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-pitch/90 border border-neon/40 mb-2">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-10 h-10 object-contain rounded-lg border border-neon/30 p-1 bg-navy"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-mono text-neon truncate block">
                      {logoUrl}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      ✓ Logo asignado
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="p-1 text-magenta hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <label className="btn-ice-pill px-3 py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Subiendo...' : 'Subir Imagen'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    disabled={uploadingLogo}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadLogo(file);
                    }}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="O URL directa (https://...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || uploadingLogo}
                className={`w-full py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 ${editingId ? 'btn-gold-pill' : 'btn-neon-pill'
                  }`}
              >
                {submitting
                  ? 'Guardando...'
                  : editingId
                    ? '✓ Guardar Cambios del Canal'
                    : '+ Agregar Método de Pago'}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Métodos (7 COLS) */}
        <div className="lg:col-span-7 cyber-panel rounded-2xl p-6 border-neon/30">
          <h2 className="text-base font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_#FBBF24]" />
            Canales Configurados ({methods.length})
          </h2>

          {loading ? (
            <div className="text-center py-8 text-xs font-mono text-ice">Cargando métodos...</div>
          ) : methods.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-ice/60">No hay métodos registrados.</div>
          ) : (
            <div className="space-y-3">
              {methods.map((m) => {
                const methodId = m.id || m.metodo_id || '';
                const isCurrentEditing = editingId === methodId;
                return (
                  <div
                    key={methodId}
                    className={`p-4 rounded-xl bg-navy/60 border transition-all ${isCurrentEditing
                        ? 'border-gold shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                        : 'border-neon/20 hover:border-neon/40'
                      } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {m.logo_url ? (
                        <img
                          src={m.logo_url}
                          alt={m.nombre_metodo}
                          className="w-10 h-10 object-contain rounded-lg bg-pitch p-1 border border-neon/30 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-pitch border border-neon/20 flex items-center justify-center text-sm shrink-0">
                          🏦
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-pure text-sm truncate">{m.nombre_metodo}</h3>
                        <div className="text-[11px] font-mono text-ice/70 flex items-center gap-2 mt-0.5">
                          <span>Validación:</span>
                          <span className="text-neon">{m.formato_requerido}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${m.activo
                            ? 'bg-neon/15 text-neon border border-neon/30'
                            : 'bg-magenta/15 text-magenta border border-magenta/30'
                          }`}
                      >
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(methodId, m.activo)}
                        className="btn-ice-pill px-2.5 py-1 text-[11px] font-mono uppercase"
                        title={m.activo ? 'Desactivar canal' : 'Activar canal'}
                      >
                        {m.activo ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(m)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${isCurrentEditing
                            ? 'bg-gold/20 text-gold border-gold'
                            : 'bg-pitch border-neon/30 text-ice hover:text-white hover:border-neon'
                          }`}
                        title="Editar método de pago"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteMethod(methodId, m.nombre_metodo)}
                        className="p-1.5 rounded-lg bg-magenta/15 border border-magenta/30 text-magenta hover:bg-magenta hover:text-white text-xs transition-colors"
                        title="Eliminar método definitivamente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

