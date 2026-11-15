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

  // Si la intro visual está activa y no está deshabilitada, renderizar la pantalla completa del vinilo
  if (showVisual && isIntroEnabled) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center select-none overflow-hidden cursor-pointer"
        onClick={() => {
          // Permite activar el audio con clic de usuario si el navegador bloqueó el autoplay
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        }}
      >
        <img
          src={vinylSrc}
          alt="RM & MASHA Vinilo"
          className="w-56 h-56 sm:w-72 sm:h-72 object-cover rounded-full shadow-[0_0_40px_rgba(255,0,128,0.3)] animate-[spin_2s_linear_infinite] pointer-events-none"
          onError={(e) => {
            // Fallback en caso de caracteres especiales de URL
            const target = e.currentTarget;
            if (target.src !== encodeURI(vinylSrc)) {
              target.src = encodeURI(vinylSrc);
            }
          }}
        />
      </div>
    );
  }

  // Pasados los 5 segundos o si está desactivada, renderizar en su lugar el {children}
  return <>{children}</>;
}
