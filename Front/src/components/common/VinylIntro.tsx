'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppearance } from '@/context/AppearanceContext';

interface VinylIntroProps {
  children?: React.ReactNode;
}

export default function VinylIntro({ children }: VinylIntroProps) {
  const { settings, loading } = useAppearance();
  const [showVisual, setShowVisual] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedPlaybackRef = useRef(false);

  // Configuración de la intro desde Supabase / AppearanceContext
  const isIntroEnabled = settings.intro_activo !== false;
  const audioSrc = settings.intro_audio_url || '/intro.mp3';
  const vinylSrc = settings.intro_imagen_url || '/RM&MASHA VINIL.jpg';
  const durationSec = Math.max(1, Math.min(30, Number(settings.intro_duracion_segundos) || 12));

  // =========================================================================
  // BOTÓN SALTAR INTRO
  // =========================================================================
  const handleSkip = useCallback(() => {
    // Si aún no arrancó la música, este clic garantiza que inicie
    if (audioRef.current && audioRef.current.paused && !hasStartedPlaybackRef.current) {
      hasStartedPlaybackRef.current = true;
      audioRef.current.play().catch(() => {});
    }

    setShowVisual(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // La música continúa sonando en segundo plano hasta finalizar (1 sola vez, loop = false)
  }, []);

  // =========================================================================
  // 1. REPRODUCCIÓN AUTOMÁTICA (1 SOLA VEZ, SIN BOTONES MANUALES)
  // =========================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isIntroEnabled) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1.0;
    audio.loop = false; // Solo reproducirse 1 vez

    // Intentar reproducir automáticamente de inmediato
    const attemptAutoPlay = () => {
      if (hasStartedPlaybackRef.current) return;

      const promise = audio.play();
      if (promise !== undefined) {
        promise
          .then(() => {
            hasStartedPlaybackRef.current = true;
          })
          .catch(() => {
            // Si las políticas de seguridad del navegador restringen el sonido en el frame 0,
            // se desbloquea de forma 100% invisible y automática con el primer movimiento
            // del ratón, toque en pantalla o pulsación de tecla, sin requerir ningún botón.
            const autoUnlock = () => {
              if (!hasStartedPlaybackRef.current && audioRef.current) {
                audioRef.current.play().then(() => {
                  hasStartedPlaybackRef.current = true;
                }).catch(() => {});
              }
              window.removeEventListener('mousemove', autoUnlock);
              window.removeEventListener('pointerdown', autoUnlock);
              window.removeEventListener('touchstart', autoUnlock);
              window.removeEventListener('keydown', autoUnlock);
              window.removeEventListener('scroll', autoUnlock);
            };

            window.addEventListener('mousemove', autoUnlock, { once: true });
            window.addEventListener('pointerdown', autoUnlock, { once: true });
            window.addEventListener('touchstart', autoUnlock, { once: true });
            window.addEventListener('keydown', autoUnlock, { once: true });
            window.addEventListener('scroll', autoUnlock, { once: true });
          });
      }
    };

    attemptAutoPlay();
  }, [audioSrc, isIntroEnabled]);

  // =========================================================================
  // 2. TEMPORIZADOR DE LA INTRO (DURACIÓN CONFIGURADA EN ADMIN)
  // =========================================================================
  useEffect(() => {
    if (!loading && !isIntroEnabled) {
      setShowVisual(false);
      return;
    }

    if (!showVisual) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowVisual(false);
    }, durationSec * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading, isIntroEnabled, durationSec, showVisual]);

  // 3. Atajo de teclado: Tecla Escape para saltar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  return (
    <>
      {/* Elemento de audio nativo configurado para reproducción automática única */}
      <audio
        ref={audioRef}
        src={audioSrc}
        autoPlay
        playsInline
        preload="auto"
      />

      {/* ========================================================================= */}
      {/* PANTALLA DE INTRODUCCIÓN VISUAL TEMPORAL: FIJA, CENTRADA Y CON BOTÓN SALTAR */}
      {/* ========================================================================= */}
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
          }}
        >
          {/* Fondo oficial de la tienda: gradiente radial atmosférico azul noche y neón */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at 50% 40%, rgba(0, 210, 255, 0.15) 0%, rgba(7, 11, 25, 0.96) 65%, #050811 100%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '460px',
              height: '460px',
              backgroundColor: 'rgba(255, 0, 127, 0.1)',
              borderRadius: '9999px',
              filter: 'blur(100px)',
              pointerEvents: 'none',
            }}
          />

          {/* ========================================================================= */}
          {/* BOTÓN SALTAR INTRO EN LA ESQUINA SUPERIOR DERECHA                         */}
          {/* ========================================================================= */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSkip();
            }}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              zIndex: 1000001,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(6, 9, 19, 0.88)',
              border: '1.5px solid rgba(0, 210, 255, 0.6)',
              boxShadow: '0 0 20px rgba(0, 210, 255, 0.35), inset 0 0 10px rgba(0, 210, 255, 0.1)',
              color: '#FFFFFF',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FF007F';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 0, 128, 0.6), inset 0 0 12px rgba(255, 0, 128, 0.2)';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.6)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 210, 255, 0.35), inset 0 0 10px rgba(0, 210, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>Saltar Intro</span>
            <span style={{ color: '#00F0FF', fontSize: '14px', lineHeight: 1 }}>⏭</span>
          </button>

          {/* ========================================================================= */}
          {/* CONTENEDOR CENTRAL: VINILO COMPACTO Y GIRATORIO                           */}
          {/* ========================================================================= */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              maxWidth: '90vw',
              textAlign: 'center',
            }}
          >
            {/* Vinilo perfectamente circular con resplandor neón magenta y cyan */}
            <div
              style={{
                width: '240px',
                height: '240px',
                maxWidth: '65vw',
                maxHeight: '35vh',
                aspectRatio: '1 / 1',
                borderRadius: '9999px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(255, 0, 127, 0.55)',
                boxShadow: '0 0 45px rgba(255, 0, 128, 0.45), 0 0 75px rgba(0, 210, 255, 0.25)',
                backgroundColor: '#060913',
                flexShrink: 0,
                margin: '0 auto',
              }}
            >
              <img
                src={vinylSrc}
                alt="RM & MASHA Vinilo"
                width={240}
                height={240}
                className="animate-vinyl-spin"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '9999px',
                  clipPath: 'circle(48.5% at 50% 50%)',
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

            {/* Insignia de bienvenida */}
            <div
              style={{
                marginTop: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 18px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(6, 9, 19, 0.9)',
                border: '1px solid rgba(0, 210, 255, 0.35)',
                color: '#7DD3FC',
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                boxShadow: '0 0 15px rgba(0, 210, 255, 0.2)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: '#00F0FF',
                  boxShadow: '0 0 10px #00F0FF',
                }}
              />
              <span>RM & MASHA • INICIANDO</span>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal de la tienda (siempre activo y disponible debajo de la intro) */}
      {children}
    </>
  );
}
