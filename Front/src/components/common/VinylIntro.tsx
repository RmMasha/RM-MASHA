'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppearance } from '@/context/AppearanceContext';

interface VinylIntroProps {
  children?: React.ReactNode;
}

export default function VinylIntro({ children }: VinylIntroProps) {
  const { settings, loading } = useAppearance();
  const [showVisual, setShowVisual] = useState(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioSrcRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTimerStartedRef = useRef(false);

  // Configuración de la intro desde Supabase / AppearanceContext
  const isIntroEnabled = settings.intro_activo !== false;
  // URL de audio configurada en el panel admin
  const audioSrc = settings.intro_audio_url || '/intro.mp3';
  const vinylSrc = settings.intro_imagen_url || '/RM&MASHA VINIL.jpg';
  const durationSec = Math.max(1, Math.min(30, Number(settings.intro_duracion_segundos) || 12));

  // =========================================================================
  // FUNCIÓN PARA INICIAR LA EXPERIENCIA: MÚSICA + TEMPORIZADOR EN SINCRONÍA
  // =========================================================================
  const startIntroExperience = useCallback(() => {
    if (typeof window === 'undefined') return;

    // 1. Iniciar reproducción de audio
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsAudioPlaying(true);
          setIsAutoplayBlocked(false);
        })
        .catch((err) => {
          console.warn('Autoplay bloqueado esperando interacción del usuario:', err);
          setIsAutoplayBlocked(true);
        });
    }

    // 2. Iniciar el temporizador de la intro en el momento exacto en que arranca la experiencia
    if (!hasTimerStartedRef.current) {
      hasTimerStartedRef.current = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowVisual(false);
      }, durationSec * 1000);
    }
  }, [durationSec]);

  // =========================================================================
  // BOTÓN SALTAR INTRO
  // =========================================================================
  const handleSkip = useCallback(() => {
    // Si la música aún no estaba sonando, intentar arrancarla con este clic para que continúe
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => {
          setIsAudioPlaying(true);
          setIsAutoplayBlocked(false);
        })
        .catch(() => {});
    }

    setShowVisual(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // CRÍTICO: NO pausar ni destruir audioRef.current.
    // La música continúa sonando en segundo plano hasta que termine naturalmente.
  }, []);

  // =========================================================================
  // 1. INSTANCIACIÓN Y CARGA DE LA PISTA DE AUDIO DEL PANEL ADMIN
  // =========================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isIntroEnabled) return;

    const currentAudio = audioRef.current;
    const needsNewAudio = !currentAudio || currentAudioSrcRef.current !== audioSrc;

    if (needsNewAudio) {
      currentAudioSrcRef.current = audioSrc;

      if (currentAudio) {
        try {
          currentAudio.pause();
        } catch (_) {}
      }

      const newAudio = new Audio(audioSrc);
      newAudio.preload = 'auto';
      newAudio.crossOrigin = 'anonymous';
      newAudio.volume = 1.0;
      audioRef.current = newAudio;

      newAudio.onplay = () => {
        setIsAudioPlaying(true);
        setIsAutoplayBlocked(false);
      };

      newAudio.onpause = () => {
        setIsAudioPlaying(false);
      };

      newAudio.onended = () => {
        setIsAudioPlaying(false);
      };

      newAudio.onerror = (e) => {
        console.warn('Error al cargar pista de audio de la intro:', audioSrc, e);
      };

      // Si la intro visual está activa, intentar reproducir inmediatamente al montar la página
      if (showVisual) {
        newAudio
          .play()
          .then(() => {
            setIsAudioPlaying(true);
            setIsAutoplayBlocked(false);
            // Si el navegador permitió autoplay, iniciar temporizador sincronizado
            if (!hasTimerStartedRef.current) {
              hasTimerStartedRef.current = true;
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => {
                setShowVisual(false);
              }, durationSec * 1000);
            }
          })
          .catch((err) => {
            // El navegador bloqueó el autoplay sin interacción previa del usuario
            console.warn('Autoplay con sonido restringido por el navegador. Esperando primer clic:', err);
            setIsAutoplayBlocked(true);
          });
      }
    }
  }, [audioSrc, isIntroEnabled, showVisual, durationSec]);

  // =========================================================================
  // 2. DETECTOR GLOBAL DE INTERACCIÓN: ACTIVO ÚNICAMENTE MIENTRAS LA INTRO ESTÉ VISIBLE
  // =========================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Si la intro ya no está en pantalla, ¡NO escuchar eventos de interacción!
    // Esto garantiza que la música NO arranque de la nada cuando ya estás viendo la tienda.
    if (!showVisual || !isIntroEnabled) return;

    const handleUserGesture = () => {
      startIntroExperience();
    };

    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('pointerdown', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('pointerdown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
    };
  }, [showVisual, isIntroEnabled, startIntroExperience]);

  // 3. Si la intro está desactivada en admin, desmontar visual de inmediato
  useEffect(() => {
    if (!loading && !isIntroEnabled) {
      setShowVisual(false);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (_) {}
      }
    }
  }, [loading, isIntroEnabled]);

  // 4. Atajo de teclado: Tecla Escape para saltar
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
            cursor: 'pointer',
          }}
          onClick={startIntroExperience}
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
          {/* CONTROL / INDICADOR DE ESTADO DE AUDIO (SUPERIOR IZQUIERDA)               */}
          {/* ========================================================================= */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              zIndex: 1000001,
            }}
          >
            {isAudioPlaying ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(6, 9, 19, 0.85)',
                  border: '1.5px solid rgba(0, 210, 255, 0.5)',
                  boxShadow: '0 0 15px rgba(0, 210, 255, 0.3)',
                  color: '#7DD3FC',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                <span style={{ fontSize: '13px' }}>🎵</span>
                <span>Música de la Intro</span>
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '9999px',
                    backgroundColor: '#00F0FF',
                    boxShadow: '0 0 8px #00F0FF',
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  startIntroExperience();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 0, 127, 0.22)',
                  border: '1.5px solid #FF007F',
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.5), inset 0 0 10px rgba(255, 0, 128, 0.2)',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 0, 127, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 0, 127, 0.22)';
                }}
              >
                <span style={{ fontSize: '15px' }}>🔊</span>
                <span>Toca para Activar Música</span>
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* BOTÓN SALTAR INTRO DESTACADO EN LA ESQUINA SUPERIOR DERECHA               */}
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
              onClick={(e) => {
                e.stopPropagation();
                startIntroExperience();
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

            {/* Aviso visual pulsante si el navegador bloqueó el autoplay */}
            {isAutoplayBlocked && !isAudioPlaying ? (
              <div
                style={{
                  marginTop: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 0, 127, 0.2)',
                  border: '1.5px solid #FF007F',
                  color: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  boxShadow: '0 0 20px rgba(255, 0, 128, 0.45)',
                  animation: 'pulse 2s infinite',
                }}
              >
                <span>🔊</span>
                <span>HAZ UN CLIC EN LA PANTALLA PARA INICIAR CON MÚSICA</span>
                <span>🎵</span>
              </div>
            ) : (
              /* Insignia de carga con pulso cian */
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
            )}

            {/* Botón secundario rápido para entrar de inmediato */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSkip();
              }}
              style={{
                marginTop: '12px',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.65)',
                fontFamily: 'monospace',
                fontSize: '11px',
                cursor: 'pointer',
                textDecoration: 'underline',
                letterSpacing: '0.5px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00F0FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
              }}
            >
              Entrar inmediatamente sin esperar ⚡
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MINI CONTROLADOR FLOTANTE DE AUDIO MIENTRAS NAVEGAS POR LA TIENDA         */}
      {/* ========================================================================= */}
      {!showVisual && isIntroEnabled && audioRef.current && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 16px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(5, 8, 17, 0.92)',
            border: '1px solid rgba(0, 210, 255, 0.4)',
            boxShadow: '0 0 20px rgba(0, 210, 255, 0.25)',
            backdropFilter: 'blur(10px)',
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#FFFFFF',
            userSelect: 'none',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                if (isAudioPlaying) {
                  audioRef.current.pause();
                  setIsAudioPlaying(false);
                } else {
                  audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(() => {});
                }
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#7DD3FC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 700,
            }}
            title={isAudioPlaying ? 'Pausar música' : 'Reanudar música'}
          >
            <span>{isAudioPlaying ? '🔊' : '🔇'}</span>
            <span>{isAudioPlaying ? 'Música RM & MASHA' : 'Música en Pausa'}</span>
          </button>
        </div>
      )}

      {/* Contenido principal de la tienda (siempre activo y disponible debajo de la intro) */}
      {children}
    </>
  );
}
