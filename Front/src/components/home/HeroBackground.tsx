'use client';

import React from 'react';

interface HeroBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export function HeroBackground({
  children,
  className = '',
}: HeroBackgroundProps) {
  return (
    <section
      className={`relative w-full min-h-screen overflow-hidden bg-slate-950 flex flex-col justify-between ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. IMAGEN DE FONDO CINEMÁTICA 16:9                        */}
      {/* ========================================================= */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-65 scale-105"
        style={{ backgroundImage: `url('/images/cyber-winter-hero.jpg')` }}
        aria-hidden="true"
      />

      {/* Gradiente radial atmosférico muy oscuro (de blue-950 a slate-950) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_50%_20%,_rgba(23,37,84,0.45)_0%,_rgba(15,23,42,0.78)_50%,_#020617_100%)]"
        aria-hidden="true"
      />

      {/* ========================================================= */}
      {/* 2. RELÁMPAGOS, RAYOS Y TORMENTA ELÉCTRICA (POTENCIADOS EN MÓVIL) */}
      {/* ========================================================= */}

      {/* PANTALLAZO DE ILUMINACIÓN DE TORMENTA AMBIENTAL (THUNDER SKY FLASH) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_50%_18%,_rgba(255,255,255,0.45)_0%,_rgba(0,210,255,0.4)_42%,_transparent_85%)] animate-storm-sky"
        aria-hidden="true"
      />

      {/* RAYO PRINCIPAL DENTADO CON RAMIFICACIONES (CENTRO / IMPACTO DIRECTO EN MÓVIL) */}
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 w-80 sm:w-[520px] h-[390px] pointer-events-none z-0 animate-storm-bolt-main select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 500 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Capa 1: Resplandor difuso cian eléctrico */}
          <path
            d="M 250 0 L 225 90 L 275 125 L 195 230 L 235 255 L 175 365 L 210 390 L 140 480 M 195 230 L 125 285 L 155 300 L 95 380 M 235 255 L 305 310 L 280 340 L 340 410 M 225 90 L 165 145 L 190 160 L 135 220"
            stroke="#00D2FF"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="blur-md opacity-90"
          />

          {/* Capa 2: Haz de luz celeste hielo */}
          <path
            d="M 250 0 L 225 90 L 275 125 L 195 230 L 235 255 L 175 365 L 210 390 L 140 480 M 195 230 L 125 285 L 155 300 L 95 380 M 235 255 L 305 310 L 280 340 L 340 410 M 225 90 L 165 145 L 190 160 L 135 220"
            stroke="#7DD3FC"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="blur-xs opacity-95"
          />

          {/* Capa 3: Núcleo de plasma blanco puro intenso */}
          <path
            d="M 250 0 L 225 90 L 275 125 L 195 230 L 235 255 L 175 365 L 210 390 L 140 480 M 195 230 L 125 285 L 155 300 L 95 380 M 235 255 L 305 310 L 280 340 L 340 410 M 225 90 L 165 145 L 190 160 L 135 220"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* RAYO SECUNDARIO CRUZADO (DESCARGA DIAGONAL DERECHA A IZQUIERDA) */}
      <div
        className="absolute top-0 right-0 w-72 sm:w-[460px] h-[340px] pointer-events-none z-0 animate-storm-bolt-fork select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 460 340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          {/* Resplandor Neón */}
          <path
            d="M 400 0 L 330 85 L 365 110 L 270 200 L 305 220 L 210 310 M 270 200 L 205 250 L 230 265 L 170 330"
            stroke="#00D2FF"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="blur-md opacity-85"
          />
          {/* Núcleo Blanco Puro */}
          <path
            d="M 400 0 L 330 85 L 365 110 L 270 200 L 305 220 L 210 310 M 270 200 L 205 250 L 230 265 L 170 330"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Haces cortantes de energía láser azul eléctrico */}
      <div
        className="absolute top-1/4 -left-1/4 w-[150%] h-[3.5px] pointer-events-none z-0 animate-lightning-1"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.4) 20%, #ffffff 50%, rgba(0, 240, 255, 0.4) 80%, transparent 100%)',
          filter: 'blur(2px) drop-shadow(0 0 16px #00f0ff)',
        }}
        aria-hidden="true"
      />

      <div
        className="absolute top-1/3 -right-1/4 w-[140%] h-[3px] pointer-events-none z-0 animate-lightning-2"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.5) 30%, #ffffff 50%, rgba(0, 240, 255, 0.5) 70%, transparent 100%)',
          filter: 'blur(2.5px) drop-shadow(0 0 14px #00f0ff)',
        }}
        aria-hidden="true"
      />

      {/* ========================================================= */}
      {/* 3. CONTENIDO WRAPPER (UI DE RECARGAS / HIJOS)            */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full flex-1 flex flex-col">
        {children}
      </div>

      {/* ========================================================= */}
      {/* 4. PARTE INFERIOR: DUNAS DE NIEVE SUPERPUESTAS (SVG)     */}
      {/* ========================================================= */}
      <div className="relative w-full z-10 pointer-events-none select-none -mt-12 sm:-mt-16 md:-mt-24">
        <svg
          viewBox="0 0 1440 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-24 sm:h-32 md:h-44 lg:h-52 drop-shadow-[0_-8px_20px_rgba(0,240,255,0.12)]"
        >
          {/* Duna 1 (Posterior - Niebla/Cian helado traslúcido) */}
          <path
            d="M0,130 C280,70 540,165 820,110 C1080,60 1280,140 1440,105 L1440,260 L0,260 Z"
            fill="rgba(14, 165, 233, 0.12)"
          />

          {/* Duna 2 (Intermedia - Escarcha ciber-invernal) */}
          <path
            d="M0,160 C220,110 460,200 740,145 C1000,95 1240,180 1440,150 L1440,260 L0,260 Z"
            fill="rgba(125, 211, 252, 0.22)"
          />

          {/* Duna 3 (Cresta de nieve pura con iluminación suave) */}
          <path
            d="M0,195 C320,140 590,225 900,175 C1160,130 1340,200 1440,185 L1440,260 L0,260 Z"
            fill="rgba(255, 255, 255, 0.15)"
          />

          {/* Duna 4 (Frontal - Base sólida que transiciona limpiamente hacia el fondo del sitio) */}
          <path
            d="M0,215 C260,175 510,235 780,200 C1040,165 1260,220 1440,210 L1440,260 L0,260 Z"
            fill="#050811"
          />
        </svg>
      </div>
    </section>
  );
}

export default HeroBackground;
