'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { Review } from '@/types/database.types';
import { useAppearance } from '@/context/AppearanceContext';
import HeroBackground from './HeroBackground';
import HeroReviewsFloat from './HeroReviewsFloat';

interface HeroProps {
  featuredReviews?: Review[];
}

export function HeroChristmas({ featuredReviews = [] }: HeroProps) {
  const { settings } = useAppearance();

  const heroTitle = settings.hero_title ?? 'FREE FIRE';
  const heroSubtitle = settings.hero_subtitle ?? 'Recargas al Instante con Entrega Inmediata';
  const heroDescription = settings.hero_description ?? 'Diamantes oficiales garantizados, Pases Booyah y Membresías por tu ID de Jugador. Compra segura con acreditación automatizada en < 2 minutos o paga al instante con tu Saldo Wallet.';

  return (
    <HeroBackground className="pt-8 pb-10 lg:pt-14 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: TITULARES Y BOTONES DE ACCIÓN (7 COLS) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">

            {/* TÍTULO HERO EDITABLE */}
            <div className="space-y-1">
              {heroTitle.trim() && (
                <div className="inline-block relative">
                  <span className="text-4xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pure-white via-ice-light to-neon-blue tracking-tight drop-shadow-[0_4px_16px_rgba(0,210,255,0.5)] block">
                    {heroTitle}
                  </span>
                </div>
              )}
              {heroSubtitle.trim() && (
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-ice to-magenta">
                    {heroSubtitle}
                  </span>
                </h1>
              )}
            </div>

            {/* TEXTO DESCRIPTIVO EDITABLE */}
            {heroDescription.trim() && (
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {heroDescription}
              </p>
            )}

            {/* BOTONES RÁPIDOS: CATÁLOGO Y REFERENCIAS */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/catalogo"
                className="btn-neon-pill w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-extrabold px-8 py-3.5"
              >
                <span>Catálogo</span>
                <ArrowRight className="w-4 h-4 text-ice group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#comentarios"
                className="btn-ice-pill w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-extrabold px-8 py-3.5"
              >
                <Sparkles className="w-4 h-4 text-magenta" />
                <span>Referencias</span>
              </a>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: PANEL DE TESTIMONIOS REALES EN VIVO (5 COLS) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[340px]">

            <div className="w-full max-w-md rounded-3xl cyber-panel p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl border border-neon-blue/40 shadow-[0_0_35px_rgba(0,210,255,0.25)] space-y-6">

              {/* ESCARCHA SUPERIOR DEL PANEL */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              {/* CONTENEDOR CENTRAL: TARJETA DE REFERENCIA ROTANDO DINÁMICAMENTE */}
              <div className="py-6 px-4 rounded-2xl bg-pitch-black/80 border border-neon-blue/30 relative flex flex-col items-center justify-center min-h-[140px] shadow-inner text-center">
                <p className="text-[11px] font-mono text-ice/60 mb-4 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold" />
                  <span>Testimonios & Acreditaciones en Vivo</span>
                </p>

                {/* COMPONENTE DE REFERENCIAS ROTANDO CADA 4 SEGUNDOS */}
                <HeroReviewsFloat
                  position="top-left"
                  className="!relative !top-auto !left-auto !right-auto !bottom-auto mx-auto"
                  intervalMs={4000}
                  variant="cyan"
                />
              </div>

              {/* INDICADORES DE CONFIANZA */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-pitch-black/70 border border-neon-blue/20 text-center">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Acreditación</p>
                  <p className="text-xs font-black text-neon-cyan flex items-center justify-center gap-1 mt-0.5">
                    <Zap className="w-3.5 h-3.5 fill-neon-cyan" /> &lt; 2 Minutos
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-pitch-black/70 border border-magenta/20 text-center">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Seguridad</p>
                  <p className="text-xs font-black text-magenta-light flex items-center justify-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% ID Garena
                  </p>
                </div>
              </div>

              {/* BOTÓN PÍLDORA NEÓN PARA IR AL CATÁLOGO */}
              <Link
                href="/catalogo"
                className="btn-neon-pill w-full py-3.5 text-center font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)]"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </HeroBackground>
  );
}

export default HeroChristmas;
