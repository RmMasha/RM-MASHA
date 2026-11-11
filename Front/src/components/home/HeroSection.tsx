import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  Star,
  Users,
  ArrowRight,
  Sparkles,
  Flame,
} from 'lucide-react';
import { Review } from '@/types/database.types';

interface HeroProps {
  featuredReviews?: Review[];
}

export function HeroSection({ featuredReviews = [] }: HeroProps) {
  // Reseñas de respaldo si no hay en la base de datos aún
  const defaultReviews = [
    {
      id: '1',
      nickname: 'Kevin_FF',
      texto: '¡Llegaron los 1060 diamantes en menos de 2 minutos! Súper recomendado.',
      estrellas: 5,
      avatar: 'K',
    },
    {
      id: '2',
      nickname: 'ValenGamer',
      texto: 'Pagué con saldo directo de mi billetera y la entrega fue automática. Excelente servicio.',
      estrellas: 5,
      avatar: 'V',
    },
    {
      id: '3',
      nickname: 'Dark_Sniper',
      texto: 'Los mejores precios para revendedores de toda Latinoamérica. 10/10.',
      estrellas: 5,
      avatar: 'D',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-hero-pattern">
      {/* Luces de fondo ambientales */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* TEXT CONTENT (7 COLS) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs sm:text-sm font-bold shadow-glow-red/30">
              <Flame className="w-4 h-4 fill-brand-primary animate-pulse" />
              <span>TEMPORADA FREE FIRE ACTIVA • PRECIOS ESPECIALES</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Recargas de Diamantes{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-accent to-brand-gold">
                al Instante
              </span>{' '}
              y 100% Seguras
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Consigue tus diamantes, pases Booyah y membresías oficiales para Free Fire directamente con tu ID. Disfruta de compras automatizadas descontando de tu billetera sin esperas.
            </p>

            {/* CTAS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/catalogo/free-fire"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 shadow-glow-red hover:scale-105 transition-all text-base"
              >
                <Zap className="w-5 h-5 fill-white" />
                Recargar Free Fire Ahora
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/billetera"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-surface-card hover:bg-surface-hover border border-surface-border hover:border-brand-gold/40 transition-all text-base"
              >
                <Sparkles className="w-5 h-5 text-brand-gold" />
                Recargar Saldo Wallet
              </Link>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-surface-border/60 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-brand-gold">
                  <Star className="w-4 h-4 fill-brand-gold" />
                  <span className="font-extrabold text-white text-base">4.9 / 5</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Calificación Clientes</p>
              </div>

              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-emerald-400">
                  <Zap className="w-4 h-4" />
                  <span className="font-extrabold text-white text-base">&lt; 3 Min</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Tiempo de Entrega</p>
              </div>

              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-brand-cyan">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-extrabold text-white text-base">100% Legal</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Vía ID Oficial Garena</p>
              </div>
            </div>
          </div>

          {/* VISUAL GAMING DISPLAY WITH FLOATING REVIEW BUBBLES (5 COLS) */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[380px]">
            {/* Tarjeta Central Gaming */}
            <div className="w-full max-w-sm rounded-3xl bg-surface-card/90 backdrop-blur-xl border border-surface-border p-6 shadow-2xl relative glow-border">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-gold flex items-center justify-center text-white font-black text-sm">
                    FF
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm">Free Fire Oficial</h3>
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Servidores Activos
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/20">
                  TOP 1
                </span>
              </div>

              <div className="py-5 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface/70 border border-surface-border hover:border-brand-primary/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">💎</span>
                    <div>
                      <p className="text-xs font-bold text-white">100 + 10 Diamantes</p>
                      <p className="text-[10px] text-slate-400">Entrega directa al ID</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-brand-gold">$1.15</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface/70 border border-surface-border hover:border-brand-primary/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">💎</span>
                    <div>
                      <p className="text-xs font-bold text-white">520 + 52 Diamantes</p>
                      <p className="text-[10px] text-slate-400">Bono promocional 10%</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-brand-gold">$5.40</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface/70 border border-surface-border hover:border-brand-primary/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🎟️</span>
                    <div>
                      <p className="text-xs font-bold text-white">Pase Booyah / Membresía</p>
                      <p className="text-[10px] text-slate-400">Recompensas diarias</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-brand-cyan">$2.10</span>
                </div>
              </div>

              <Link
                href="/catalogo/free-fire"
                className="w-full block py-2.5 rounded-xl bg-surface-hover hover:bg-brand-primary text-center font-bold text-xs text-white transition-all border border-slate-700"
              >
                Ver todos los paquetes disponibles
              </Link>
            </div>

            {/* BURBUJAS CIRCULARES FLOTANTES DE RESEÑAS (SPEC 5.3) */}
            <div className="absolute -top-6 -left-4 sm:-left-8 max-w-[210px] p-2.5 rounded-2xl bg-surface/95 border border-brand-gold/40 shadow-glow-gold/20 backdrop-blur-md animate-float">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-gold to-brand-accent text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  {defaultReviews[0].avatar}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">
                    {defaultReviews[0].nickname}
                  </p>
                  <div className="flex text-brand-gold text-[9px] mt-0.5">
                    {'★'.repeat(defaultReviews[0].estrellas)}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 italic line-clamp-2 leading-tight">
                "{defaultReviews[0].texto}"
              </p>
            </div>

            <div className="absolute -bottom-6 -right-2 sm:-right-6 max-w-[220px] p-2.5 rounded-2xl bg-surface/95 border border-brand-cyan/40 shadow-glow-cyan/20 backdrop-blur-md animate-float-delayed">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-cyan to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  {defaultReviews[1].avatar}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">
                    {defaultReviews[1].nickname}
                  </p>
                  <div className="flex text-brand-gold text-[9px] mt-0.5">
                    {'★'.repeat(defaultReviews[1].estrellas)}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 italic line-clamp-2 leading-tight">
                "{defaultReviews[1].texto}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
