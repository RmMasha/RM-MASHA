'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppearance } from '@/context/AppearanceContext';

interface VinylIntroProps {
  children?: React.ReactNode;
}

export default function VinylIntro({ children }: VinylIntroProps) {
  const { settings, loading } = useAppearance();
  const [showVisual, setShowVisual] = useState(true);
  const [hasAudioStarted, setHasAudioStarted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedPlaybackRef = useRef(false);
  const listenersCleanedRef = useRef(false);

  // Configuración de la intro desde Supabase / AppearanceContext
  const isIntroEnabled = settings.intro_activo !== false;

  // Fuente de audio:
  // Si la pista configurada en Supabase es la pista predeterminada de 157 KB o está vacía,
  // se utiliza la copia local /intro.mp3 (idéntica) que carga con 0 ms de latencia instantánea.
  // Si en el panel admin se configuró una URL externa distinta, se usa esa URL con fallback a /intro.mp3.
  const configuredAudio = settings.intro_audio_url;
  const isDefaultOrLocal =
    !configuredAudio ||
    configuredAudio.includes('intro_audio_1794764578008.mp3') ||
    configuredAudio === '/intro.mp3';

  const audioSrc = isDefaultOrLocal ? '/intro.mp3' : configuredAudio;
  const vinylSrc = settings.intro_imagen_url || '/RM&MASHA VINIL.jpg';
  const durationSec = Math.max(1, Math.min(30, Number(settings.intro_duracion_segundos) || 12));

  // =========================================================================
  // LIMPIEZA DE EVENT LISTENERS DE GESTO
  // =========================================================================
  const detachListeners = useCallback(() => {
    if (listenersCleanedRef.current) return;
    listenersCleanedRef.current = true;
    window.removeEventListener('pointerdown', handleUserInteraction, true);
    window.removeEventListener('touchstart', handleUserInteraction, true);
    window.removeEventListener('click', handleUserInteraction, true);
    window.removeEventListener('keydown', handleUserInteraction, true);
  }, []);

  // Gestor de interacción: cualquier toque, clic o pulsación arranca el audio al instante
  const handleUserInteraction = useCallback(() => {
    if (hasStartedPlaybackRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasStartedPlaybackRef.current = true;
          setHasAudioStarted(true);
          detachListeners();
        })
        .catch(() => {});
    }
  }, [detachListeners]);

  // =========================================================================
  // BOTÓN SALTAR INTRO (ÚNICO BOTÓN VISIBLE EN LA ESQUINA)
  // =========================================================================
  const handleSkip = useCallback(() => {
    // Si aún no arrancó la música, este clic garantiza que inicie
    if (!hasStartedPlaybackRef.current && audioRef.current) {
      hasStartedPlaybackRef.current = true;
      setHasAudioStarted(true);
      audioRef.current.play().catch(() => {});
    }

    detachListeners();
    setShowVisual(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // La música continúa sonando en segundo plano hasta finalizar (1 sola vez, loop = false)
  }, [detachListeners]);

  // =========================================================================
  // 1. REPRODUCCIÓN AUTOMÁTICA EN FRAME 0 (INTENTO DIRECTO EN EL NAVEGADOR)
  // =========================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isIntroEnabled) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 1.0;
    audio.loop = false; // Solo 1 vez

    // Si ya está reproduciendo gracias a autoPlay nativo del navegador
    if (!audio.paused) {
      hasStartedPlaybackRef.current = true;
      setHasAudioStarted(true);
      detachListeners();
      return;
    }

    // Intentar forzar la reproducción automática inmediata por script
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          hasStartedPlaybackRef.current = true;
          setHasAudioStarted(true);
          detachListeners();
        })
        .catch(() => {
          // Bloqueo normal de autoplay en dispositivos móviles hasta el primer toque del usuario
        });
    }

    // Listeners globales en fase de captura para arrancar con el primer toque en pantalla
    window.addEventListener('pointerdown', handleUserInteraction, { capture: true, passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { capture: true, passive: true });
    window.addEventListener('click', handleUserInteraction, { capture: true, passive: true });
    window.addEventListener('keydown', handleUserInteraction, { capture: true, passive: true });

    return () => {
      detachListeners();
    };
  }, [audioSrc, isIntroEnabled, detachListeners, handleUserInteraction]);

  // =========================================================================
  // 2. TEMPORIZADOR DE LA INTRO (DURACIÓN CONFIGURADA EN ADMIN)
  // =========================================================================
  useEffect(() => {
    if (!loading && !isIntroEnabled) {
      setShowVisual(false);
      detachListeners();
      return;
    }

    if (!showVisual) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowVisual(false);

      // Si la intro visual terminó y la música nunca arrancó (por ejemplo, usuario ausente),
      // desarmar listeners para que la música NO arranque inesperadamente más tarde en la tienda.
      if (!hasStartedPlaybackRef.current) {
        detachListeners();
      }
    }, durationSec * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loading, isIntroEnabled, durationSec, showVisual, detachListeners]);

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
      {/* ========================================================================= */}
      {/* ELEMENTO DE AUDIO NATIVO Y PERSISTENTE:                                   */}
      {/* Vive fuera de showVisual para que al ocultarse la intro siga sonando.     */}
      {/* Cuenta con autoPlay nativo del navegador y detección onPlay automática.   */}
      {/* ========================================================================= */}
      <audio
        ref={audioRef}
        src={audioSrc}
        autoPlay
        playsInline
        preload="auto"
        onPlay={() => {
          hasStartedPlaybackRef.current = true;
          setHasAudioStarted(true);
          detachListeners();
        }}
        onError={() => {
          if (audioRef.current && audioRef.current.src !== window.location.origin + '/intro.mp3') {
            audioRef.current.src = '/intro.mp3';
            audioRef.current.play().catch(() => {});
          }
        }}
      />

      {/* ========================================================================= */}
      {/* PANTALLA DE INTRODUCCIÓN VISUAL TEMPORAL: FIJA, CENTRADA Y CON BOTÓN SALTAR */}
      {/* ========================================================================= */}
      {showVisual && isIntroEnabled && (
        <div
          onPointerDown={handleUserInteraction}
          onClick={handleUserInteraction}
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
            cursor: 'default',
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
          {/* ÚNICO BOTÓN: SALTAR INTRO EN LA ESQUINA SUPERIOR DERECHA                   */}
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
                cursor: 'pointer',
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

            {/* ========================================================================= */}
            {/* INSIGNIA INTERACTIVA CENTRAL: "TOCAR PARA INICIAR"                        */}
            {/* ========================================================================= */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleUserInteraction();
              }}
              style={{
                marginTop: '22px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 22px',
                borderRadius: '9999px',
                backgroundColor: hasAudioStarted ? 'rgba(6, 9, 19, 0.9)' : 'rgba(12, 18, 38, 0.95)',
                border: hasAudioStarted ? '1px solid rgba(0, 210, 255, 0.35)' : '1.5px solid rgba(0, 210, 255, 0.7)',
                color: hasAudioStarted ? '#7DD3FC' : '#FFFFFF',
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '1.2px',
                boxShadow: hasAudioStarted
                  ? '0 0 15px rgba(0, 210, 255, 0.2)'
                  : '0 0 25px rgba(0, 210, 255, 0.45), inset 0 0 10px rgba(0, 210, 255, 0.15)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                userSelect: 'none',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '9999px',
                  backgroundColor: hasAudioStarted ? '#00F0FF' : '#FF007F',
                  boxShadow: hasAudioStarted ? '0 0 10px #00F0FF' : '0 0 10px #FF007F',
                }}
              />
              <span>{hasAudioStarted ? 'RM & MASHA • REPRODUCIENDO' : 'TOCAR PARA INICIAR'}</span>
              {!hasAudioStarted && (
                <span style={{ color: '#00F0FF', fontSize: '12px', lineHeight: 1 }}>▶</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal de la tienda (siempre activo y disponible debajo de la intro) */}
      {children}
    </>
  );
}
