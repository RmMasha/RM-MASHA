'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import {
  Sparkles,
  Star,
  CheckCircle2,
  Trash2,
  PlusCircle,
  Eye,
  RotateCw,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import HeroReviewsFloat from '@/components/home/HeroReviewsFloat';

export default function AdminComentariosPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'todas'>('hero');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [intervalSetting, setIntervalSetting] = useState<number>(4000);

  // Formulario para crear referencia manual para el Hero
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users(id, nombre, email, nickname, avatar_url, rol)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Alternar "Mostrar en Hero" (destacado_hero)
  const handleToggleHero = async (reviewId: string, currentVal: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ destacado_hero: !currentVal })
        .eq('id', reviewId);

      if (error) throw error;
      await fetchReviews();
    } catch (err: any) {
      alert('Error al actualizar estado en Hero: ' + err.message);
    }
  };

  // Crear una nueva referencia destacada directa para el Hero
  const handleCreateHeroReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) {
      alert('Por favor ingresa al menos el nombre o nickname del usuario.');
      return;
    }

    try {
      setCreating(true);

      // 1. Obtener usuario actual del admin o buscar usuario existente
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id;
      if (!currentUserId) {
        alert('Debes estar autenticado para registrar referencias.');
        return;
      }

      // 2. Insertar en tabla reviews con destacado_hero = true
      const { error } = await supabase.from('reviews').insert({
        usuario_id: currentUserId,
        entidad_tipo: 'general',
        calificacion: 5,
        comentario_texto: `Referencia verificada de ${newNombre.trim()}`,
        destacado_hero: true,
        activo: true,
      });

      if (error) throw error;

      alert('¡Referencia activada exitosamente para la rotación del Hero!');
      setNewNombre('');
      setNewNickname('');
      setNewAvatarUrl('');
      setShowCreateModal(false);
      await fetchReviews();
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Eliminar reseña
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro permanentemente?')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
      await fetchReviews();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Filtrar reseñas activas en Hero
  const heroReviews = reviews.filter((r) => r.destacado_hero);

  return (
    <div className="space-y-6">
      {/* CABECERA PRINCIPAL */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Módulo 6.3: Referencias del Hero & Reseñas de Clientes</span>
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Control de Referencias del Hero
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Gestiona los testimonios de clientes que rotan automáticamente cada 4 segundos sobre la pantalla principal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReviews()}
            className="btn-ice-pill px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* TABS DE SELECCIÓN */}
      <div className="flex border-b border-neon/20 gap-2">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hero'
              ? 'border-neon text-neon-cyan bg-neon/10'
              : 'border-transparent text-ice/60 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 text-neon-cyan" />
          <span>Referencias del Hero ({heroReviews.length} Activas)</span>
        </button>

        <button
          onClick={() => setActiveTab('todas')}
          className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'todas'
              ? 'border-neon text-neon-cyan bg-neon/10'
              : 'border-transparent text-ice/60 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 text-gold" />
          <span>Todas las Reseñas ({reviews.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: REFERENCIAS DEL HERO (EN VIVO CON PREVISUALIZADOR Y ROTACIÓN) */}
      {/* ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-6">
          
          {/* PANEL DE PREVISUALIZACIÓN EN TIEMPO REAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Simulador Visual (5 COLS) */}
            <div className="lg:col-span-5 cyber-panel rounded-2xl p-6 border-neon/40 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-pitch-black via-navy/60 to-pitch-black">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-mono font-bold uppercase text-ice flex items-center gap-2">
                    <Eye className="w-4 h-4 text-neon-cyan" />
                    <span>Previsualizador en Tiempo Real</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon/10 text-neon-cyan border border-neon/30 animate-pulse">
                    EN VIVO
                  </span>
                </div>
                <p className="text-[11px] text-ice/60 font-mono mb-6">
                  Así se muestra la tarjeta ultra-compacta flotante sobre la portada con rotación suave:
                </p>

                {/* Contenedor de simulación del componente real */}
                <div className="relative h-28 rounded-xl bg-slate-950/80 border border-neon/30 flex items-center justify-center p-4 overflow-hidden">
                  <HeroReviewsFloat
                    position="top-left"
                    variant="cyan"
                    className="relative !top-auto !left-auto !right-auto !bottom-auto"
                    intervalMs={intervalSetting}
                  />
                </div>
              </div>

              {/* Controles de velocidad del Hero */}
              <div className="mt-6 pt-4 border-t border-neon/20 flex items-center justify-between">
                <span className="text-[11px] font-mono text-ice/70 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-gold" />
                  Intervalo de rotación:
                </span>
                <div className="flex gap-1.5">
                  {[3000, 4000, 6000].map((ms) => (
                    <button
                      key={ms}
                      onClick={() => setIntervalSetting(ms)}
                      className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase ${
                        intervalSetting === ms
                          ? 'bg-neon-cyan text-slate-950 shadow-[0_0_8px_#00f0ff]'
                          : 'bg-navy text-ice/60 border border-neon/20 hover:text-white'
                      }`}
                    >
                      {ms / 1000}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen y Acciones (7 COLS) */}
            <div className="lg:col-span-7 cyber-panel rounded-2xl p-6 border-neon/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-neon-cyan" />
                    <span>Configuración de Referencias Activas</span>
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-neon-pill px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Nueva Referencia</span>
                  </button>
                </div>
                <p className="text-xs text-ice/70 font-mono mb-4">
                  Las reseñas marcadas como <strong className="text-neon-cyan">"Activo en Hero"</strong> forman parte del carrusel cíclico infinito. Se recomienda tener al menos 3 o más para garantizar dinamismo visual continuo.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-pitch border border-neon/20">
                    <p className="text-[10px] font-mono uppercase text-ice/60">En Rotación</p>
                    <p className="text-xl font-black text-neon-cyan">{heroReviews.length}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-pitch border border-neon/20">
                    <p className="text-[10px] font-mono uppercase text-ice/60">Intervalo</p>
                    <p className="text-xl font-black text-gold">{intervalSetting / 1000} Segundos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-pitch border border-neon/20">
                    <p className="text-[10px] font-mono uppercase text-ice/60">Transición</p>
                    <p className="text-xl font-black text-pure">Fade In / Out</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-xl bg-navy/60 border border-neon/20 text-[11px] font-mono text-ice/70 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping shrink-0" />
                <span>Cualquier cambio de activación aquí se refleja en vivo en la tienda mediante Supabase Realtime.</span>
              </div>
            </div>

          </div>

          {/* LISTA DE REFERENCIAS DEL HERO CON INTERRUPTOR DE ROTACIÓN */}
          <div className="cyber-panel rounded-2xl overflow-hidden border-neon/30">
            <div className="p-4 border-b border-neon/20 bg-pitch/80 flex justify-between items-center">
              <h3 className="text-xs font-mono font-bold uppercase text-pure">
                Clientes Seleccionados para el Hero
              </h3>
              <span className="text-[11px] font-mono text-ice/60">
                Total: {reviews.length} registrados
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs font-mono text-ice">Cargando referencias...</div>
            ) : reviews.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-ice/60">
                No hay comentarios ni referencias registradas aún.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-neon/20 text-ice/70 bg-pitch/50">
                      <th className="py-3 px-4">Usuario / Gamer</th>
                      <th className="py-3 px-4">Nickname</th>
                      <th className="py-3 px-4">Calificación</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-4 text-center">Estado en Hero</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neon/10">
                    {reviews.map((rev) => {
                      const isHero = rev.destacado_hero;
                      const nombre = rev.users?.nombre || 'Gamer VIP';
                      const nickname = rev.users?.nickname || 'Sin Nick';
                      return (
                        <tr
                          key={rev.id}
                          className={`transition-colors ${
                            isHero ? 'bg-neon/5 hover:bg-neon/10' : 'hover:bg-navy/40'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-neon/20 border border-neon/40 flex items-center justify-center font-bold text-xs text-neon-cyan shrink-0">
                                {nombre.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-bold text-pure">{nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-neon-cyan">
                            @{nickname}
                          </td>
                          <td className="py-3 px-4 text-gold">
                            {'★'.repeat(rev.calificacion || 5)}
                          </td>
                          <td className="py-3 px-4 text-ice/60">
                            {formatDate(rev.created_at || rev.fecha)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleHero(rev.id, isHero)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 mx-auto ${
                                isHero
                                  ? 'bg-neon-cyan/20 border border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                                  : 'bg-navy border border-neon/20 text-ice/50 hover:border-ice/60'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isHero ? 'bg-neon-cyan animate-pulse' : 'bg-slate-600'
                                }`}
                              />
                              <span>{isHero ? 'En Rotación (Hero)' : 'Excluido'}</span>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-1 rounded text-magenta hover:bg-magenta/20 transition-colors"
                              title="Eliminar referencia"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: TODAS LAS RESEÑAS Y MODERACIÓN COMPLETA                        */}
      {/* ========================================================================= */}
      {activeTab === 'todas' && (
        <div className="cyber-panel rounded-2xl overflow-hidden border-neon/30">
          <div className="p-4 border-b border-neon/20 bg-pitch/80 flex justify-between items-center">
            <h3 className="text-xs font-mono font-bold uppercase text-pure">
              Historial Completo de Testimonios de la Comunidad
            </h3>
            <span className="text-[11px] font-mono text-ice/60">
              {reviews.length} comentarios
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neon/20 text-ice/70 bg-pitch/50">
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Contexto</th>
                  <th className="py-3.5 px-4">Calificación</th>
                  <th className="py-3.5 px-4">Comentario</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4 text-center">Hero</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon/10">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-navy/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="text-pure font-bold">{rev.users?.nombre || 'Usuario'}</div>
                      <div className="text-[11px] text-neon">{rev.users?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-navy border border-neon/30 text-ice">
                        {rev.entidad_tipo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gold">
                      {'★'.repeat(rev.calificacion || 5)}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-pure">
                      <p className="line-clamp-2 italic">"{rev.comentario_texto}"</p>
                    </td>
                    <td className="py-3.5 px-4 text-ice/70">
                      {formatDate(rev.created_at || rev.fecha)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleHero(rev.id, rev.destacado_hero)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          rev.destacado_hero
                            ? 'bg-gold/20 border border-gold text-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-navy border border-neon/20 text-ice/50 hover:border-ice/50'
                        }`}
                      >
                        {rev.destacado_hero ? '★ Activo en Hero' : 'Oculto'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteReview(rev.id)}
                        className="px-2.5 py-1 rounded-lg text-magenta hover:bg-magenta/20 border border-transparent hover:border-magenta text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PARA AGREGAR NUEVA REFERENCIA DESTACADA */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-pitch-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md cyber-panel p-6 rounded-2xl border border-neon-cyan/50 shadow-[0_0_30px_rgba(0,210,255,0.2)]">
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-cyan" />
              <span>Nueva Referencia para el Hero</span>
            </h3>
            <p className="text-xs text-ice/70 font-mono mb-4">
              Ingresa los datos del cliente o usuario para que comience a rotar en la pantalla principal.
            </p>

            <form onSubmit={handleCreateHeroReference} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-1">
                  Nombre del Cliente:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Kevin Salazar"
                  value={newNombre}
                  onChange={(e) => setNewNombre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-ice mb-1">
                  Nickname de Juego (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Kevin_FF"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neon/20">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-ice hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-neon-pill px-6 py-2 text-xs font-bold uppercase tracking-wider"
                >
                  {creating ? 'Guardando...' : 'Crear y Activar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
