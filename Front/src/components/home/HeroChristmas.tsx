import React from 'react';
import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  Star,
  ArrowRight,
  Gift,
  Flame,
  Sparkles,
  Snowflake,
} from 'lucide-react';
import { Review } from '@/types/database.types';

interface HeroProps {
  featuredReviews?: Review[];
}

export function HeroChristmas({ featuredReviews = [] }: HeroProps) {
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
      texto: 'Pagué con saldo directo de mi billetera y la entrega fue automática. Excelente.',
      estrellas: 5,
      avatar: 'V',
    },
  ];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-festive-hero bg-cyber-grid-pattern">
      {/* RAYOS DE NEÓN Y LUZ AMBIENTAL */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-neon-blue/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-magenta/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 left-10 w-64 h-64 bg-ice/15 rounded-full blur-[90px] pointer-events-none" />

      {/* RAYO DE NEÓN CRUZANDO */}
      <div className="absolute top-12 left-0 w-full h-[1px] neon-lightning pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* COLUMNA IZQUIERDA: TEXTOS, ESCARCHA Y BOTONES EN FORMA DE PÍLDORA (7 COLS) */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* BADGE FESTIVO NEÓN / MAGENTA */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pitch-panel border border-neon-blue/50 text-neon-cyan text-xs font-bold shadow-neon-border">
              <Sparkles className="w-4 h-4 text-magenta animate-pulse" />
              <span>TEMPORADA INVERNAL • RECARGAS OFICIALES FREE FIRE</span>
              <Snowflake className="w-3.5 h-3.5 text-ice animate-spin-slow" />
            </div>

            {/* TÍTULO 3D CON ESCARCHA Y NIEVE ACUMULADA EN LA PARTE SUPERIOR */}
            <div className="space-y-1">
              <div className="inline-block relative snow-cap">
                <span className="text-4xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pure-white via-ice-light to-neon-blue tracking-tight drop-shadow-[0_4px_12px_rgba(0,210,255,0.4)] block">
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

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Consigue tus diamantes, pases Booyah y membresías oficiales entregados en segundos vía ID. Disfruta de la mejor tasa para revendedores y compras automáticas con tu billetera interna.
            </p>

            {/* BOTONES EN FORMA DE PÍLDORA CON RESPLANDOR AZUL ELÉCTRICO (SPEC) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link
                href="/catalogo"
                className="btn-neon-pill inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-extrabold uppercase tracking-wider"
              >
                <Zap className="w-4 h-4 fill-white" />
                Ver Catálogo
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/billetera?accion=recargar"
                className="btn-ice-pill inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold tracking-wide"
              >
                <Gift className="w-4 h-4 text-ice" />
                Recargar Saldo Wallet
              </Link>
            </div>

            {/* BADGES DE CONFIANZA EN CAJAS RECTANGULARES NEGRAS CON BORDE NEÓN */}
            <div className="grid grid-cols-3 gap-3 pt-6 max-w-lg mx-auto lg:mx-0">
              <div className="cyber-panel p-3 rounded-2xl text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-gold">
                  <Star className="w-3.5 h-3.5 fill-gold" />
                  <span className="font-black text-white text-sm">4.9 / 5</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Opiniones Verificadas</p>
              </div>

              <div className="cyber-panel p-3 rounded-2xl text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-neon-cyan">
                  <Zap className="w-3.5 h-3.5 fill-neon-cyan" />
                  <span className="font-black text-white text-sm">&lt; 2 Min</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Entrega Inmediata</p>
              </div>

              <div className="cyber-panel p-3 rounded-2xl text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-magenta-light">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="font-black text-white text-sm">100% Legal</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Vía ID Oficial Garena</p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: COMPOSICIÓN VISUAL CON LOS 2 AVATARES Y REGALOS AZUL HIELO (5 COLS) */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[440px]">
            
            {/* PANEL PRINCIPAL CIBERNÉTICO OPACADO */}
            <div className="w-full max-w-md rounded-3xl cyber-panel p-6 relative overflow-hidden">
              
              {/* ESCARCHA SUPERIOR DEL PANEL */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              {/* ENCABEZADO DE PANEL */}
              <div className="flex items-center justify-between pb-4 border-b border-neon-blue/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-pitch-black border border-neon-blue/40 flex items-center justify-center text-neon-cyan font-black text-xs shadow-neon-border">
                    FF
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xs sm:text-sm">RM & Masha Gaming</h3>
                    <p className="text-[10px] text-ice-light flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
                      Servidor Navideño En Línea
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-magenta/15 text-magenta-light font-bold border border-magenta/30">
                  Edición Invierno
                </span>
              </div>

              {/* ILUSTRACIÓN TEMÁTICA DE LOS DOS AVATARES */}
              <div className="my-5 p-4 rounded-2xl bg-pitch-black/80 border border-neon-blue/30 relative overflow-hidden">
                <div className="flex items-center justify-between gap-3">
                  
                  {/* AVATAR MASCULINO TÁCTICO OSCURO (IZQUIERDA) */}
                  <div className="flex flex-col items-center text-center space-y-1.5 w-1/2 border-r border-neon-blue/20 pr-2">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-900 to-black border-2 border-slate-700 p-1 flex items-center justify-center shadow-lg">
                      <span className="text-3xl">🥷</span>
                      {/* GORRA CON LOGO "F" DORADO */}
                      <span className="absolute -top-1.5 -right-1 px-1 rounded bg-gold text-slate-950 font-black text-[9px] border border-white">
                        F
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white">Táctico Urbano</p>
                      <p className="text-[9px] text-slate-400">Bandana • Armas tácticas</p>
                    </div>
                  </div>

                  {/* AVATAR FEMENINA CAPERUCITA FUCSIA (DERECHA) */}
                  <div className="flex flex-col items-center text-center space-y-1.5 w-1/2 pl-2">
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-b from-magenta/20 to-pitch-black border-2 border-magenta p-1 flex items-center justify-center shadow-[0_0_15px_rgba(255,0,127,0.4)]">
                      <span className="text-3xl">👸</span>
                      {/* CAPUCHA FUCSIA & TRENZAS */}
                      <span className="absolute -top-1.5 -right-1 px-1 rounded bg-magenta text-white font-black text-[9px]">
                        XMAS
                      </span>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-magenta-light">Caperucita Neón</p>
                      <p className="text-[9px] text-ice-light">Trenzas • Capucha Fucsia</p>
                    </div>
                  </div>
                </div>

                {/* CAJAS DE REGALOS NAVIDEÑAS APILADAS EN AZUL HIELO CON LAZOS PLATEADOS */}
                <div className="mt-4 pt-3 border-t border-neon-blue/20 flex items-center justify-between text-xs bg-navy-deepest/60 p-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-ice/20 border border-ice flex items-center justify-center text-ice font-black shadow-ice-glow">
                      🎁
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-white block">Caja Navideña Azul Hielo</span>
                      <span className="text-[9px] text-ice">Lazos plateados con bonos de diamantes</span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gold-bright">+10% Bonus</span>
                </div>
              </div>

              {/* LISTA RÁPIDA DE OFERTAS NAVIDEÑAS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-pitch-black/70 border border-neon-blue/20 hover:border-neon-blue/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💎</span>
                    <div>
                      <p className="text-xs font-bold text-white">100 + 10 Diamantes</p>
                      <p className="text-[9px] text-slate-400">Directo a tu ID de Free Fire</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-gold-bright">$1.15</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-pitch-black/70 border border-magenta/30 hover:border-magenta transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎟️</span>
                    <div>
                      <p className="text-xs font-bold text-white">Pase Booyah / Membresía</p>
                      <p className="text-[9px] text-magenta-light">Recompensas e items exclusivos</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-magenta-light">$2.10</span>
                </div>
              </div>

              <Link
                href="/catalogo/free-fire"
                className="btn-neon-pill w-full block py-2.5 mt-4 text-center font-bold text-xs uppercase tracking-wider"
              >
                Comprar Ahora
              </Link>
            </div>

            {/* BURBUJAS CIRCULARES FLOTANTES DE RESEÑAS CON CONTORNOS DE HIELO (SPEC 5.3) */}
            <div className="absolute -top-6 -left-4 sm:-left-8 max-w-[210px] p-2.5 rounded-2xl bg-pitch-panel/95 border border-ice shadow-ice-glow backdrop-blur-md animate-float">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ice to-neon-blue text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                  {defaultReviews[0].avatar}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">
                    {defaultReviews[0].nickname}
                  </p>
                  <div className="flex text-gold text-[9px] mt-0.5">
                    {'★'.repeat(defaultReviews[0].estrellas)}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-300 italic line-clamp-2 leading-tight">
                "{defaultReviews[0].texto}"
              </p>
            </div>

            <div className="absolute -bottom-6 -right-2 sm:-right-6 max-w-[220px] p-2.5 rounded-2xl bg-pitch-panel/95 border border-magenta shadow-neon-magenta backdrop-blur-md animate-float-delayed">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-magenta to-pink-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {defaultReviews[1].avatar}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">
                    {defaultReviews[1].nickname}
                  </p>
                  <div className="flex text-gold text-[9px] mt-0.5">
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

      {/* BASE INVERNAL CON SIMULACIÓN DE DUNAS DE NIEVE SUAVE (SPEC 2) */}
      <div className="relative w-full h-8 mt-10 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-8 text-navy-deepest fill-current"
        >
          <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,-20 1200,30 L1200,120 L0,120 Z" />
        </svg>
      </div>
    </section>
  );
}

export default HeroChristmas;

