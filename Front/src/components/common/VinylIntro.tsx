'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppearance } from '@/context/AppearanceContext';

interface VinylIntroProps {
  children: React.ReactNode;
}

export default function VinylIntro({ children }: VinylIntroProps) {
  const { settings, loading } = useAppearance();
  const [showVisual, setShowVisual] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAudioStartedRef = useRef(false);

  // Comprobar si la intro está habilitada en la configuración
  const isIntroEnabled = settings.intro_activo !== false;
  const audioSrc = settings.intro_audio_url || '/intro.mp3';
  const vinylSrc = settings.intro_imagen_url || '/RM&MASHA VINIL.jpg';

  useEffect(() => {
    // Si la configuración cargó y la intro está desactivada por el admin, desmontar visual
    if (!loading && !isIntroEnabled) {
      setShowVisual(false);
      return;
    }

    // Instanciar el objeto Audio leyendo el archivo de audio e intentar reproducirlo
    // Se utiliza useRef para evitar que se reproduzca dos veces debido a React Strict Mode
    if (!hasAudioStartedRef.current && typeof window !== 'undefined') {
      hasAudioStartedRef.current = true;
      try {
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        audio.play().catch((error) => {
          console.warn('Autoplay bloqueado por políticas del navegador o archivo no disponible:', error);
        });
      } catch (error) {
        console.warn('Error al instanciar el audio de la intro:', error);
      }
    }

    // Iniciar temporizador de exactamente 5 segundos (5000 ms)
    const timer = setTimeout(() => {
      // Pasados los 5 segundos, el estado se actualiza para desmontar la interfaz visual del vinilo
      // y renderizar en su lugar el {children} del componente.
      setShowVisual(false);
      // CRÍTICO: Cuando se desmonta la interfaz visual a los 5 segundos,
      // NO pausamos ni destruimos la instancia del audio (audioRef.current).
      // La música continúa sonando en segundo plano hasta que finalice naturalmente.
    }, 5000);

    return () => {
      // Limpiar únicamente el temporizador en la función de limpieza
      clearTimeout(timer);
    };
  }, [loading, isIntroEnabled, audioSrc]);

  // Si la intro visual está activa y no está deshabilitada, renderizar la pantalla del vinilo con el fondo de la tienda
  if (showVisual && isIntroEnabled) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-[#050811] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer"
        onClick={() => {
          // Permite activar el audio con clic de usuario si el navegador bloqueó el autoplay
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        }}
      >
        {/* Fondo oficial por defecto de la página: atmósfera azul marino profundo con resplandores neón */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,210,255,0.14)_0%,rgba(7,11,25,0.96)_65%,#050811_100%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-magenta/10 rounded-full blur-[110px] pointer-events-none" />

        {/* Contenedor Principal del Vinilo Mejorado para PC y Móvil (Tamaño compacto y centrado) */}
        <div className="relative z-10 flex flex-col items-center justify-center p-4">
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-72 lg:h-72 max-w-[75vw] max-h-[36vh] aspect-square rounded-full overflow-hidden shadow-[0_0_45px_rgba(255,0,128,0.4),0_0_75px_rgba(0,210,255,0.2)] border-2 border-magenta/40 flex items-center justify-center bg-[#060913] shrink-0">
            <img
              src={vinylSrc}
              alt="RM & MASHA Vinilo"
              className="w-full h-full object-cover rounded-full pointer-events-none select-none scale-[1.14] animate-vinyl-spin"
              style={{ clipPath: 'circle(50% at 50% 50%)' }}
              onError={(e) => {
                // Fallback en caso de caracteres especiales de URL
                const target = e.currentTarget;
                if (target.src !== encodeURI(vinylSrc)) {
                  target.src = encodeURI(vinylSrc);
                }
              }}
            />
          </div>

          {/* Sutil insignia de bienvenida */}
          <div className="mt-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-pitch-panel/90 border border-neon-blue/30 backdrop-blur-md shadow-neon-border text-xs font-mono text-ice/90 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-ping" />
            <span className="tracking-widest uppercase text-[11px] font-bold">RM & MASHA • INICIANDO</span>
          </div>
        </div>
      </div>
    );
  }

  // Pasados los 5 segundos o si está desactivada, renderizar en su lugar el {children}
  return <>{children}</>;
}

