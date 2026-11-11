'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Review } from '@/types/database.types';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Star, CheckCircle, XCircle, Sparkles, Loader2 } from 'lucide-react';

export default function AdminComentariosPage() {
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('reviews')
        .select('*, users(nombre, email, nickname, avatar_url, pais)')
        .order('created_at', { ascending: false });

      if (data) setReviews(data as Review[]);
    } catch (err) {
      console.error('Error cargando reseñas:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Toggle "Destacado en Hero"
  const handleToggleHero = async (id: string, current: boolean) => {
    try {
      await supabase
        .from('reviews')
        .update({ destacado_hero: !current })
        .eq('id', id);

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, destacado_hero: !current } : r))
      );
    } catch (err: any) {
      alert('Error al actualizar reseña: ' + err.message);
    }
  };

  // Toggle Activo / Moderado
  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await supabase
        .from('reviews')
        .update({ activo: !current })
        .eq('id', id);

      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, activo: !current } : r))
      );
    } catch (err: any) {
      alert('Error al moderar reseña: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Moderación de Reseñas y Destacados del Hero</h2>
        <p className="text-xs text-slate-400">
          Supervisa las opiniones dejadas por los usuarios y activa el switch para mostrarlas como burbujas flotantes en la página de inicio.
        </p>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Cargando comentarios...</div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No hay comentarios registrados aún.</div>
        ) : (
          <div className="divide-y divide-surface-border overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Usuario</th>
                  <th className="px-5 py-3 font-semibold">Calificación</th>
                  <th className="px-5 py-3 font-semibold">Comentario</th>
                  <th className="px-5 py-3 font-semibold">Hero Switch</th>
                  <th className="px-5 py-3 font-semibold text-right">Moderación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-surface-hover/30 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {formatDate(rev.created_at)}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-bold text-white block">
                        {rev.users?.nickname || rev.users?.nombre || 'Usuario'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {rev.users?.email}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex text-brand-gold text-xs">
                        {'★'.repeat(rev.calificacion)}
                        {'☆'.repeat(5 - rev.calificacion)}
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-sm">
                      <p className="text-slate-300 italic">"{rev.comentario_texto}"</p>
                      <span className="text-[10px] text-slate-500 capitalize">
                        Nivel: {rev.entidad_tipo}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleHero(rev.id, rev.destacado_hero)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
                          rev.destacado_hero
                            ? 'bg-brand-gold/10 text-brand-gold border border-brand-gold/40 shadow-glow-gold/20'
                            : 'bg-surface border border-surface-border text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {rev.destacado_hero ? 'En Hero (Activo)' : 'Oculto de Hero'}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(rev.id, rev.activo)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                          rev.activo
                            ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {rev.activo ? 'Desactivar' : 'Aprobar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
