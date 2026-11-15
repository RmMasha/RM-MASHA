'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppearance } from '@/context/AppearanceContext';

interface VinylIntroProps {
  children?: React.ReactNode;
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
          console.warn('Autoplay de audio restringido por el navegador:', error);
        });
      } catch (error) {
        console.warn('Error al instanciar el audio de la intro:', error);
      }
    }

    // Iniciar temporizador de exactamente 5 segundos (5000 ms)
    const timer = setTimeout(() => {
      // Pasados los 5 segundos, desmontar la interfaz visual del vinilo
      setShowVisual(false);
      // CRÍTICO: NO pausar ni destruir audioRef.current.
      // La música continúa sonando en segundo plano hasta que termine.
    }, 5000);

    return () => {
      // Limpiar únicamente el temporizador
      clearTimeout(timer);
    };
  }, [loading, isIntroEnabled, audioSrc]);

  return (
    <>
      {/* Pantalla de introducción visual temporal: fija, compacta y centrada */}
      {showVisual && isIntroEnabled && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            backgroundColor: '#050811',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            userSelect: 'none',
            cursor: 'pointer',
          }}
          onClick={() => {
            // Activar audio si el navegador bloqueó el autoplay
            if (audioRef.current && audioRef.current.paused) {
              audioRef.current.play().catch(() => {});
            }
          }}
        >
          {/* Fondo oficial de la tienda: radial degradado ciber-neón */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(0, 210, 255, 0.12) 0%, rgba(7, 11, 25, 0.96) 65%, #050811 100%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '450px',
              height: '450px',
              backgroundColor: 'rgba(255, 0, 127, 0.08)',
              borderRadius: '9999px',
              filter: 'blur(100px)',
              pointerEvents: 'none',
            }}
          />

          {/* Contenedor del Vinilo: Tamaño compacto (230px), centrado y sin bordes blancos */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
          >
            <div
              style={{
                width: '230px',
                height: '230px',
                maxWidth: '65vw',
                maxHeight: '34vh',
                aspectRatio: '1 / 1',
                borderRadius: '9999px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 0, 127, 0.45)',
                boxShadow: '0 0 45px rgba(255, 0, 128, 0.4), 0 0 70px rgba(0, 210, 255, 0.2)',
                backgroundColor: '#060913',
                flexShrink: 0,
                margin: '0 auto',
              }}
            >
              <img
                src={vinylSrc}
                alt="RM & MASHA Vinilo"
                width={230}
                height={230}
                className="animate-vinyl-spin"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '9999px',
                  transform: 'scale(1.15)',
                  clipPath: 'circle(48% at 50% 50%)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== encodeURI(vinylSrc)) {
                    target.src = encodeURI(vinylSrc);
                  }
                }}
              />
            </div>

            {/* Insignia compacta de carga */}
            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(6, 9, 19, 0.85)',
                border: '1px solid rgba(0, 210, 255, 0.3)',
                color: '#7DD3FC',
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: '#00F0FF',
                  boxShadow: '0 0 8px #00F0FF',
                }}
              />
              <span>RM & MASHA • INICIANDO</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido normal de la aplicación (se renderiza debajo y queda visible al culminar los 5s) */}
      {children}
    </>
  );
}
