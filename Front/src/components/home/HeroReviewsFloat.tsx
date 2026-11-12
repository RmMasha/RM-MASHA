'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroReviewItem {
  id: string;
  nombre: string;
  nickname?: string | null;
  avatar_url?: string | null;
}

interface HeroReviewsFloatProps {
  position?: 'top-left' | 'bottom-right' | 'top-right' | 'bottom-left';
  className?: string;
  defaultIndexOffset?: number;
  intervalMs?: number;
  variant?: 'cyan' | 'magenta';
}

const FALLBACK_REVIEWS: HeroReviewItem[] = [
  {
    id: 'f1',
    nombre: 'Kevin Salazar',
    nickname: 'Kevin_FF',
    avatar_url: null,
  },
  {
    id: 'f2',
    nombre: 'Valentina Rojas',
    nickname: 'ValenGamer',
    avatar_url: null,
  },
  {
    id: 'f3',
    nombre: 'Carlos Méndez',
    nickname: 'Carlitos_Booyah',
    avatar_url: null,
  },
  {
    id: 'f4',
    nombre: 'Alejandro Díaz',
    nickname: 'AlejoPro_99',
    avatar_url: null,
  },
  {
    id: 'f5',
    nombre: 'Daniela Torres',
    nickname: 'Dani_Xmas',
    avatar_url: null,
  },
];

export function HeroReviewsFloat({
  position = 'top-left',
  className = '',
  defaultIndexOffset = 0,
  intervalMs = 4000,
  variant = 'cyan',
}: HeroReviewsFloatProps) {
  const [reviewsList, setReviewsList] = useState<HeroReviewItem[]>(FALLBACK_REVIEWS);
  const [currentIndex, setCurrentIndex] = useState(defaultIndexOffset % FALLBACK_REVIEWS.length);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. CARGA DE RESEÑAS CONEXIÓN SUPABASE EN TIEMPO REAL
  const fetchHeroReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, destacado_hero, activo, users(id, nombre, nickname, avatar_url)')
        .eq('destacado_hero', true)
        .eq('activo', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: HeroReviewItem[] = data
          .filter((item: any) => item.users)
          .map((item: any) => ({
            id: item.id,
            nombre: item.users.nombre || 'Comprador Verificado',
            nickname: item.users.nickname || null,
            avatar_url: item.users.avatar_url || null,
          }));

        if (formatted.length > 0) {
          setReviewsList(formatted);
        }
      }
    } catch (err) {
      console.warn('Error fetching hero reviews:', err);
    }
  };

  useEffect(() => {
    fetchHeroReviews();

    // Identificador único por instancia para evitar colisiones si se montan múltiples componentes simultáneos
    const channelName = `hero-reviews-${position}-${Math.random().toString(36).substring(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reviews' },
        () => {
          fetchHeroReviews();
        }
      );

    try {
      channel.subscribe();
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        // Silenciar error en desmontaje
      }
    };
  }, [position]);

  // 2. ROTACIÓN INFINITA CADA 4 SEGUNDOS CON TRANSICIÓN SUAVE (FADE IN / FADE OUT)
  useEffect(() => {
    if (reviewsList.length === 0) return;

    timerRef.current = setInterval(() => {
      // Paso 1: Iniciar fade out (desvanecer)
      setFadeState('out');

      // Paso 2: Cambiar de usuario a mitad de transición (300ms)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % reviewsList.length);
        // Paso 3: Disparar fade in (reaparecer suave)
        setFadeState('in');
      }, 350);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [reviewsList, intervalMs]);

  const currentItem = reviewsList[currentIndex] || reviewsList[0];
  if (!currentItem) return null;

  // Letra inicial para avatar cuando no hay foto subida
  const initial = (currentItem.nickname || currentItem.nombre || 'U')
    .replace('@', '')
    .charAt(0)
    .toUpperCase();

  const isCyan = variant === 'cyan';

  // Posicionamiento
  const positionClasses = {
    'top-left': 'absolute -top-4 -left-4 sm:-left-8',
    'bottom-right': 'absolute -bottom-4 -right-2 sm:-right-6',
    'top-right': 'absolute -top-4 -right-4 sm:-right-8',
    'bottom-left': 'absolute -bottom-4 -left-2 sm:-left-6',
  }[position];

  return (
    <div
      className={`z-20 pointer-events-none select-none ${positionClasses} ${className}`}
      aria-live="polite"
    >
      <div
        className={`transition-all duration-350 ease-in-out transform ${
          fadeState === 'in'
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 -translate-y-1.5 scale-95'
        }`}
      >
        <div
          className={`flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-pitch-panel/95 backdrop-blur-xl border ${
            isCyan
              ? 'border-neon-cyan/50 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'border-magenta/50 shadow-[0_0_20px_rgba(255,0,127,0.3)]'
          }`}
        >
          {/* FOTO DE PERFIL / AVATAR CON EFECTO NEÓN */}
          <div className="relative shrink-0">
            {currentItem.avatar_url ? (
              <img
                src={currentItem.avatar_url}
                alt={currentItem.nombre}
                className={`w-8 h-8 rounded-full object-cover border-2 ${
                  isCyan ? 'border-neon-cyan' : 'border-magenta'
                }`}
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white border-2 shadow-inner ${
                  isCyan
                    ? 'bg-gradient-to-br from-neon-blue via-sky-500 to-blue-700 border-neon-cyan'
                    : 'bg-gradient-to-br from-magenta via-pink-600 to-rose-700 border-magenta'
                }`}
              >
                {initial}
              </div>
            )}
            {/* Indicador de estado en línea */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-pitch-black ${
                isCyan ? 'bg-neon-cyan shadow-[0_0_6px_#00f0ff]' : 'bg-magenta shadow-[0_0_6px_#ff007f]'
              }`}
            />
          </div>

          {/* NOMBRE DEL USUARIO Y SELLO DE VERIFICACIÓN (SIN ESTRELLAS NI TEXTO DE RESEÑA) */}
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-pure-white truncate max-w-[130px] sm:max-w-[160px] tracking-tight">
                {currentItem.nickname ? `@${currentItem.nickname}` : currentItem.nombre}
              </span>
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${
                  isCyan ? 'text-neon-cyan' : 'text-magenta'
                }`}
              />
            </div>
            <div className="flex items-center gap-1 text-[9px] text-ice-light/80 font-mono">
              <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse" />
              <span>Cliente Verificado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroReviewsFloat;

