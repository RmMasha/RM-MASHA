'use client';

import React, { useEffect, useState } from 'react';

interface Snowflake {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
  drift: number;
  opacity: number;
}

interface HeroBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  snowCount?: number;
}

export function HeroBackground({
  children,
  className = '',
  snowCount = 38,
}: HeroBackgroundProps) {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  // Inicialización de partículas en cliente para evitar mismatch de hidratación SSR
  useEffect(() => {
    const items: Snowflake[] = [];
    for (let i = 0; i < snowCount; i++) {
      items.push({
        id: i,
        left: `${(i * (100 / snowCount) + (Math.random() * 4 - 2)).toFixed(2)}%`,
        size: Math.floor(Math.random() * 4) + 2, // 2px a 5px
        duration: `${(Math.random() * 7 + 8).toFixed(1)}s`, // 8s a 15s (caída suave y constante)
        delay: `${(Math.random() * 8).toFixed(1)}s`,
        drift: Math.floor(Math.random() * 36) - 18, // -18px a +18px de deriva
        opacity: Number((Math.random() * 0.55 + 0.35).toFixed(2)), // 0.35 a 0.90
      });
    }
    setSnowflakes(items);
  }, [snowCount]);

  return (
    <section
      className={`relative w-full min-h-screen overflow-hidden bg-slate-950 flex flex-col justify-between ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. IMAGEN DE FONDO CINEMÁTICA 16:9 (SIN PERSONAJES / SIN CUADRÍCULAS) */}
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
      {/* 2. RELÁMPAGOS Y RAYOS DE LUZ AZUL ELÉCTRICO (#00f0ff)     */}
      {/* ========================================================= */}

      {/* Resplandor ambiental de tormenta eléctrica esporádica (Blur masivo) */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full pointer-events-none z-0 bg-[#00f0ff]/15 blur-[120px] animate-ambient-flash"
        aria-hidden="true"
      />

      {/* Rayo 1: Haz cortante diagonal (Top-Left hacia Bottom-Right) */}
      <div
        className="absolute top-1/4 -left-1/4 w-[150%] h-[2.5px] pointer-events-none z-0 animate-lightning-1"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.2) 20%, #00f0ff 50%, rgba(0, 240, 255, 0.2) 80%, transparent 100%)',
          filter: 'blur(3px) drop-shadow(0 0 14px #00f0ff)',
        }}
        aria-hidden="true"
      />

      {/* Rayo 1 (Capa Difusa con Blur pronunciado) */}
      <div
        className="absolute top-1/4 -left-1/4 w-[150%] h-[18px] pointer-events-none z-0 animate-lightning-1"
        style={{
          background:
            'linear-gradient(90deg, transparent 5%, rgba(0, 240, 255, 0.4) 40%, #00f0ff 50%, rgba(0, 240, 255, 0.4) 60%, transparent 95%)',
          filter: 'blur(22px)',
        }}
        aria-hidden="true"
      />

      {/* Rayo 2: Haz cruzado secundario esporádico (Top-Right hacia Bottom-Left) */}
      <div
        className="absolute top-1/3 -right-1/4 w-[140%] h-[2px] pointer-events-none z-0 animate-lightning-2"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.3) 30%, #00f0ff 50%, rgba(0, 240, 255, 0.3) 70%, transparent 100%)',
          filter: 'blur(4px) drop-shadow(0 0 12px #00f0ff)',
        }}
        aria-hidden="true"
      />

      {/* Rayo 2 (Capa de resplandor suave con Blur) */}
      <div
        className="absolute top-1/3 -right-1/4 w-[140%] h-[14px] pointer-events-none z-0 animate-lightning-2"
        style={{
          background:
            'linear-gradient(90deg, transparent 10%, rgba(0, 240, 255, 0.25) 50%, transparent 90%)',
          filter: 'blur(28px)',
        }}
        aria-hidden="true"
      />

      {/* ========================================================= */}
      {/* 3. SISTEMA DE PARTÍCULAS: COPOS DE NIEVE CAYENDO SUAVEMENTE */}
      {/* ========================================================= */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {snowflakes.map((flake) => (
          <span
            key={flake.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: flake.left,
              top: '-15px',
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 6px 1px rgba(255, 255, 255, 0.95), 0 0 12px 2px rgba(0, 240, 255, 0.7)',
              opacity: flake.opacity,
              animation: `snowfallMotion ${flake.duration} linear infinite`,
              animationDelay: flake.delay,
              transform: `translateX(${flake.drift}px)`,
            }}
          />
        ))}
      </div>

      {/* ========================================================= */}
      {/* 4. CONTENIDO WRAPPER (UI DE RECARGAS / HIJOS)            */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full flex-1 flex flex-col">
        {children}
      </div>

      {/* ========================================================= */}
      {/* 5. PARTE INFERIOR: DUNAS DE NIEVE SUPERPUESTAS (SVG)     */}
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

      {/* Animación suave de caída y deriva de nieve */}
      <style jsx>{`
        @keyframes snowfallMotion {
          0% {
            transform: translateY(-10px) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(105vh) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroBackground;
