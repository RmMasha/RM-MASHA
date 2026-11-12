'use client';

import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Snowflake,
  Wallet,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Review } from '@/types/database.types';
import HeroBackground from './HeroBackground';
import HeroReviewsFloat from './HeroReviewsFloat';

interface HeroProps {
  featuredReviews?: Review[];
}

export function HeroChristmas({ featuredReviews = [] }: HeroProps) {
  return (
    <HeroBackground className="pt-8 pb-10 lg:pt-14 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: TITULARES Y BOTONES FESTIVOS (7 COLS) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* BADGE FESTIVO NEÓN / MAGENTA */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pitch-panel border border-neon-blue/50 text-neon-cyan text-xs font-bold shadow-neon-border backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-magenta animate-pulse" />
              <span>TEMPORADA INVERNAL • RECARGAS OFICIALES FREE FIRE</span>
              <Snowflake className="w-3.5 h-3.5 text-ice animate-spin-slow" />
            </div>

            {/* TÍTULO 3D CON ESCARCHA Y NIEVE ACUMULADA EN LA PARTE SUPERIOR */}
            <div className="space-y-1">
              <div className="inline-block relative snow-cap">
                <span className="text-4xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pure-white via-ice-light to-neon-blue tracking-tight drop-shadow-[0_4px_16px_rgba(0,210,255,0.5)] block">
                  FREE FIRE
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Recargas al Instante con{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-ice to-magenta">
                  Temática Navideña
                </span>
              </h1>
            </div>

            {/* TEXTO DESCRIPTIVO EN BLANCO PURO Y CELESTE */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Diamantes oficiales garantizados, Pases Booyah y Membresías por tu{' '}
              <strong className="text-pure-white">ID de Jugador</strong>. Compra segura con acreditación{' '}
              <span className="text-neon-cyan font-bold">automatizada en &lt; 2 minutos</span>{' '}
              o paga al instante con tu <strong className="text-gold font-bold">Saldo Wallet</strong>.
            </p>

            {/* BOTONES EN FORMA DE PÍLDORA CON RESPLANDOR AZUL ELÉCTRICO */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/catalogo"
                className="btn-neon-pill w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-extrabold px-8 py-3.5"
              >
                <span>Ver Catálogo Navideño</span>
                <ArrowRight className="w-4 h-4 text-ice group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/billetera"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-pitch-panel/90 text-ice-light hover:text-white border border-ice/40 hover:border-neon-blue transition-all duration-300 font-bold text-sm shadow-ice-glow backdrop-blur-md"
              >
                <Wallet className="w-4 h-4 text-neon-cyan" />
                <span>Recargar Saldo Wallet</span>
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: PANEL DE REFERENCIAS DEL HERO (5 COLS)   */}
          {/* (SE BORRÓ TODO EL FORMULARIO DE RECARGA DIRECTA)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[380px]">
            
            {/* PANEL CIBERNÉTICO DE REFERENCIAS DEL HERO EN TIEMPO REAL */}
            <div className="w-full max-w-md rounded-3xl cyber-panel p-6 sm:p-8 relative overflow-hidden backdrop-blur-xl border border-neon-blue/40 shadow-[0_0_35px_rgba(0,210,255,0.25)] space-y-6">
              
              {/* ESCARCHA SUPERIOR DEL PANEL */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              {/* ENCABEZADO DEL PANEL DE REFERENCIAS */}
              <div className="flex items-center justify-between pb-4 border-b border-neon-blue/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-pitch-black border border-neon-blue/50 flex items-center justify-center text-neon-cyan shadow-neon-border">
                    <Users className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm uppercase tracking-wider">
                      Referencias del Hero
                    </h3>
                    <p className="text-[10px] text-ice-light flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
                      <span>Comunidad en Tiempo Real</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-magenta/15 text-magenta-light font-bold border border-magenta/30 font-mono">
                  Rotación 4s
                </span>
              </div>

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
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* SEGUNDA CÁPSULA FLOTANTE EN ESQUINA INFERIOR DERECHA */}
            <HeroReviewsFloat
              position="bottom-right"
              variant="magenta"
              defaultIndexOffset={2}
              intervalMs={4000}
            />

          </div>
        </div>
      </div>
    </HeroBackground>
  );
}

export default HeroChristmas;
