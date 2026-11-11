'use client';

import React, { useEffect, useState } from 'react';

interface SnowflakeItem {
  id: number;
  left: string;
  size: number;
  duration: string;
  delay: string;
  opacity: number;
}

interface SnowfallProps {
  count?: number;
}

export function Snowfall({ count = 35 }: SnowfallProps = {}) {
  const [snowflakes, setSnowflakes] = useState<SnowflakeItem[]>([]);

  useEffect(() => {
    // Generar copos ligeros distribuidos
    const items: SnowflakeItem[] = [];

    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        left: `${(i * (100 / count) + Math.random() * 3).toFixed(1)}%`,
        size: Math.floor(Math.random() * 6) + 4, // 4px a 10px
        duration: `${(Math.random() * 8 + 7).toFixed(1)}s`, // 7s a 15s
        delay: `${(Math.random() * 8).toFixed(1)}s`,
        opacity: Math.random() * 0.6 + 0.3,
      });
    }

    setSnowflakes(items);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <span
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            fontSize: `${flake.size}px`,
            animationDuration: flake.duration,
            animationDelay: flake.delay,
            opacity: flake.opacity,
            textShadow: '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(125, 211, 252, 0.6)',
          }}
        >
          ❄
        </span>
      ))}
    </div>
  );
}

export default Snowfall;

