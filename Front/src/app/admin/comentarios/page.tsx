'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function AdminComentariosPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users(nombre, email, nickname, rol)')
        .order('fecha', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error(err);
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
      alert('Error: ' + err.message);
    }
  };

  // Eliminar reseña
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      await fetchReviews();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-mono uppercase mb-2">
            <span>❄</span> Módulo 6.3: Moderación de Reseñas & Burbujas del Hero
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Gestión de Comentarios
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Modera testimonios de la comunidad y activa el interruptor "Mostrar en Hero" para visibilidad destacada.
          </p>
        </div>

        <button
          onClick={() => fetchReviews()}
          className="btn-ice-pill px-4 py-2 text-xs font-bold uppercase tracking-wider"
        >
          ↻ Actualizar
        </button>
      </div>

      {/* Lista de Reseñas */}
      <div className="cyber-panel rounded-2xl overflow-hidden border-neon/30">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-ice">Cargando reseñas...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-ice/60">No hay comentarios registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neon/20 text-ice/70 bg-pitch/80">
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Tipo / Contexto</th>
                  <th className="py-3.5 px-4">Calificación</th>
                  <th className="py-3.5 px-4">Comentario</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4 text-center">Mostrar en Hero</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon/10">
                {reviews.map((rev) => {
                  const revId = rev.id || rev.review_id;
                  const revFecha = rev.created_at || rev.fecha;
                  return (
                    <tr key={revId} className="hover:bg-navy/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="text-pure font-bold">{rev.users?.nombre || 'Usuario'}</div>
                        <div className="text-[11px] text-neon">{rev.users?.nickname ? `@${rev.users.nickname}` : rev.users?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-navy border border-neon/30 text-ice">
                          {rev.entidad_tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gold">
                        {Array.from({ length: rev.calificacion || 5 }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-pure">
                        <p className="line-clamp-2 italic">"{rev.comentario_texto}"</p>
                      </td>
                      <td className="py-3.5 px-4 text-ice/70">
                        {formatDate(revFecha)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleHero(revId, rev.destacado_hero)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                            rev.destacado_hero
                              ? 'bg-gold/20 border border-gold text-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                              : 'bg-navy border border-neon/20 text-ice/50 hover:border-ice/50'
                          }`}
                        >
                          {rev.destacado_hero ? '★ Activo en Hero' : 'Oculto en Hero'}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteReview(revId)}
                          className="px-2.5 py-1 rounded-lg text-magenta hover:bg-magenta/20 border border-transparent hover:border-magenta text-xs"
                        >
                          Eliminar
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
  );
}

