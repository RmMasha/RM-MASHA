'use client';

import React, { useEffect, useState } from 'react';

interface ParticleItem {
  id: number;
  type: 'snowflake' | 'dot';
  char?: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  opacity: number;
}

const SNOWFLAKE_CHARS = ['❄', '❅', '✻', '✦'];

export function Snowfall({ count = 52 }: { count?: number } = {}) {
  const [particles, setParticles] = useState<ParticleItem[]>([]);

  useEffect(() => {
    const items: ParticleItem[] = [];
    for (let i = 0; i < count; i++) {
      // Alternar entre copos de nieve cristalinos y puntos blancos luminosos
      const isSnowflake = i % 2 === 0 || i % 3 === 0;
      const size = isSnowflake
        ? Math.floor(Math.random() * 9) + 11 // 11px a 19px para copos nítidos
        : Math.floor(Math.random() * 3) + 2.5; // 2.5px a 5px para puntos blancos

      items.push({
        id: i,
        type: isSnowflake ? 'snowflake' : 'dot',
        char: isSnowflake ? SNOWFLAKE_CHARS[i % SNOWFLAKE_CHARS.length] : undefined,
        left: `${(i * (100 / count) + (Math.random() * 2.4 - 1.2)).toFixed(2)}%`,
        size,
        duration: `${(Math.random() * 7 + 8).toFixed(1)}s`, // 8s a 15s de caída continua
        delay: `${(Math.random() * 9).toFixed(1)}s`,
        opacity: Number((Math.random() * 0.45 + 0.45).toFixed(2)), // 0.45 a 0.90
      });
    }
    setParticles(items);
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none"
      aria-hidden="true"
    >
      {particles.map((p) => {
        if (p.type === 'snowflake') {
          return (
            <span
              key={p.id}
              className="absolute pointer-events-none text-white select-none will-change-transform"
              style={{
                left: p.left,
                top: '-35px',
                fontSize: `${p.size}px`,
                opacity: p.opacity,
                textShadow:
                  '0 0 6px rgba(255, 255, 255, 0.95), 0 0 14px rgba(0, 210, 255, 0.8), 0 0 25px rgba(125, 211, 252, 0.5)',
                animation: `globalSnowfallMotion ${p.duration} linear infinite`,
                animationDelay: p.delay,
              }}
            >
              {p.char}
            </span>
          );
        }

        // Punto blanco brillante / partícula de escarcha luminosa
        return (
          <span
            key={p.id}
            className="absolute rounded-full pointer-events-none will-change-transform"
            style={{
              left: p.left,
              top: '-20px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#FFFFFF',
              boxShadow:
                '0 0 6px 1px rgba(255, 255, 255, 0.95), 0 0 12px 2px rgba(0, 210, 255, 0.85), 0 0 20px 4px rgba(125, 211, 252, 0.5)',
              opacity: p.opacity,
              animation: `globalSnowfallMotion ${p.duration} linear infinite`,
              animationDelay: p.delay,
            }}
          />
        );
      })}

      <style jsx>{`
        @keyframes globalSnowfallMotion {
          0% {
            transform: translate3d(0, -35px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          90% {
            opacity: 0.85;
          }
          100% {
            transform: translate3d(30px, 105vh, 0) rotate(260deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Snowfall;
