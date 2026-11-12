'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Review } from '@/types/database.types';

interface EntityReviewsSectionProps {
  entidadTipo: 'categoria' | 'subcategoria' | 'producto' | 'general';
  entidadId: string;
  entidadNombre: string;
  initialReviews?: (Review & {
    users?: {
      nombre: string;
      nickname?: string | null;
      avatar_url?: string | null;
    };
  })[];
}

export default function EntityReviewsSection({
  entidadTipo,
  entidadId,
  entidadNombre,
  initialReviews = [],
}: EntityReviewsSectionProps) {
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [loading, setLoading] = useState(initialReviews.length === 0);
  const [calificacion, setCalificacion] = useState<number>(5);
  const [comentario, setComentario] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar reseñas si no vinieron en props
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users(nombre, nickname, avatar_url)')
        .eq('entidad_tipo', entidadTipo)
        .eq('entidad_id', entidadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setReviews(data);
    } catch (err) {
      console.error('Error fetching entity reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialReviews.length === 0 && entidadId) {
      fetchReviews();
    }
  }, [entidadId, entidadTipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!user) {
      setFeedbackMsg({ type: 'error', text: 'Debes iniciar sesión para publicar una valoración.' });
      return;
    }

    if (!comentario.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Escribe un comentario sobre tu experiencia.' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          usuario_id: user.id,
          entidad_tipo: entidadTipo,
          entidad_id: entidadId,
          calificacion,
          comentario_texto: comentario.trim(),
          destacado_hero: false,
        })
        .select('*, users(nombre, nickname, avatar_url)')
        .single();

      if (error) throw error;

      if (data) {
        setReviews([data, ...reviews]);
        setComentario('');
        setCalificacion(5);
        setFeedbackMsg({ type: 'success', text: '¡Tu valoración ha sido publicada con éxito!' });
      }
    } catch (err: any) {
      console.error('Error enviando reseña:', err);
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al guardar la reseña. Inténtalo de nuevo.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculo de promedio
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + (r.calificacion || 5), 0) / totalReviews).toFixed(1)
    : '5.0';

  const tipoLabel =
    entidadTipo === 'categoria'
      ? 'esta categoría'
      : entidadTipo === 'subcategoria'
      ? 'esta subcategoría'
      : entidadTipo === 'producto'
      ? 'este servicio'
      : 'la plataforma';

  return (
    <section className="mt-12 pt-8 border-t border-neon/20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
            <span>⭐</span> Opiniones de la Comunidad
          </div>
          <h2 className="text-2xl font-black text-pure uppercase tracking-wider">
            Valoraciones de {entidadNombre}
          </h2>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Experiencias de clientes verificados que han recargado en {tipoLabel}.
          </p>
        </div>

        {totalReviews > 0 && (
          <div className="cyber-panel px-4 py-2.5 rounded-xl border-neon/30 flex items-center gap-3 shrink-0">
            <span className="text-2xl font-black text-gold">{avgRating}</span>
            <div className="text-left">
              <div className="flex text-gold text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.round(Number(avgRating)) ? 'text-gold' : 'text-slate-600'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-[10px] font-mono text-ice/70">
                {totalReviews} {totalReviews === 1 ? 'opinión' : 'opiniones'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario para dejar reseña */}
        <div className="cyber-panel rounded-2xl p-6 border-neon/30 lg:col-span-1 h-fit">
          <h3 className="text-base font-bold text-pure mb-2 flex items-center gap-2">
            <span>✍️</span> Deja tu Valoración
          </h3>
          <p className="text-xs text-ice/70 font-mono mb-4">
            Comparte cómo fue tu entrega y velocidad de servicio.
          </p>

          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-mono mb-4 border ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}
            >
              {feedbackMsg.text}
            </div>
          )}

          {user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-ice/80 mb-1.5">
                  Calificación (1 a 5 estrellas)
                </label>
                <div className="flex items-center gap-1.5 text-2xl cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCalificacion(star)}
                      className={`transition-transform hover:scale-125 focus:outline-none ${
                        star <= calificacion ? 'text-gold' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-mono text-gold ml-2">
                    {calificacion} / 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-ice/80 mb-1.5">
                  Tu Comentario
                </label>
                <textarea
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder={`¿Qué te pareció el servicio en ${entidadNombre}?`}
                  className="cyber-input w-full p-3 rounded-xl text-xs text-pure font-mono resize-none focus:outline-none"
                  maxLength={300}
                  required
                />
                <div className="text-[10px] text-ice/50 font-mono text-right mt-1">
                  {comentario.length}/300 caracteres
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-neon-pill w-full py-2.5 text-xs uppercase tracking-wider font-bold justify-center"
              >
                {submitting ? 'Publicando...' : 'Publicar Valoración'}
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-xl bg-pitch/60 border border-neon/20 text-center space-y-3">
              <p className="text-xs text-ice/80 font-mono">
                Debes identificarte para publicar una opinión verificada en la plataforma.
              </p>
              <Link
                href="/login"
                className="btn-ice-pill inline-flex w-full py-2 text-xs uppercase tracking-wider font-bold justify-center"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>

        {/* Lista de reseñas */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="cyber-panel p-8 rounded-2xl text-center text-xs font-mono text-ice/60">
              Cargando opiniones de la comunidad...
            </div>
          ) : reviews.length === 0 ? (
            <div className="cyber-panel p-8 rounded-2xl text-center border-dashed border-neon/20">
              <div className="text-3xl mb-2">💬</div>
              <h4 className="text-sm font-bold text-pure mb-1">
                Aún no hay valoraciones aquí
              </h4>
              <p className="text-xs text-ice/70 font-mono">
                Sé el primero en calificar tu experiencia en {entidadNombre}.
              </p>
            </div>
          ) : (
            reviews.map((rev) => {
              const userName = rev.users?.nombre || 'Gamer Verificado';
              const userNick = rev.users?.nickname;
              const userAvatar = rev.users?.avatar_url;
              const dateStr = rev.created_at || rev.fecha;

              return (
                <div
                  key={rev.id || rev.review_id}
                  className="cyber-panel rounded-2xl p-5 border-neon/20 hover:border-ice/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="w-10 h-10 rounded-full object-cover border border-neon/40 shadow-[0_0_8px_#00D2FF]"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon to-magenta flex items-center justify-center text-xs font-bold text-white shadow-[0_0_8px_#00D2FF]">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-pure">{userName}</span>
                          <span className="text-[10px] text-neon" title="Cliente Verificado">
                            ✓
                          </span>
                        </div>
                        {userNick && (
                          <div className="text-[10px] font-mono text-ice/60">
                            @{userNick}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex text-gold text-xs">
                        {Array.from({ length: rev.calificacion || 5 }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                      {dateStr && (
                        <span className="text-[10px] font-mono text-ice/50">
                          {new Date(dateStr).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-mono text-pure/90 leading-relaxed pl-1">
                    "{rev.comentario_texto}"
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

