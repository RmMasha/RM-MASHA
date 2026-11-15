'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAppearance } from '@/context/AppearanceContext';
import {
  Disc,
  Music,
  Upload,
  Play,
  Pause,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Power,
  RotateCcw,
  Clock,
  Timer,
  FastForward,
} from 'lucide-react';

export default function AdminIntroPage() {
  const { settings, refreshSettings, updateSettings } = useAppearance();

  const [introActivo, setIntroActivo] = useState(true);
  const [introAudioUrl, setIntroAudioUrl] = useState('/intro.mp3');
  const [introImagenUrl, setIntroImagenUrl] = useState('/RM&MASHA VINIL.jpg');
  const [introDuracion, setIntroDuracion] = useState(5);

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Audio preview en el panel admin
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Modal de prueba en vivo
  const [showLivePreview, setShowLivePreview] = useState(false);
  const livePreviewAudioRef = useRef<HTMLAudioElement | null>(null);
  const livePreviewTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar estado inicial desde AppearanceContext
  useEffect(() => {
    if (settings) {
      setIntroActivo(settings.intro_activo !== false);
      setIntroAudioUrl(settings.intro_audio_url || '/intro.mp3');
      setIntroImagenUrl(settings.intro_imagen_url || '/RM&MASHA VINIL.jpg');
      setIntroDuracion(settings.intro_duracion_segundos ? Number(settings.intro_duracion_segundos) : 5);
    }
  }, [settings]);

  // Limpiar reproductor al desmontar
  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      if (livePreviewAudioRef.current) {
        livePreviewAudioRef.current.pause();
        livePreviewAudioRef.current = null;
      }
      if (livePreviewTimerRef.current) {
        clearTimeout(livePreviewTimerRef.current);
      }
    };
  }, []);

  // Subir archivo de audio a Supabase Storage
  const handleUploadAudio = async (file: File) => {
    try {
      setUploadingAudio(true);
      const ext = file.name.split('.').pop() || 'mp3';
      const cleanName = `branding/intro_audio_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(cleanName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('catalogo')
        .getPublicUrl(cleanName);

      setIntroAudioUrl(publicUrl);

      // Guardar inmediatamente
      await updateSettings({ intro_audio_url: publicUrl });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert('¡Pista de audio para la intro subida y asignada con éxito!');
    } catch (err: any) {
      console.error('Error subiendo audio:', err);
      alert('Error al subir archivo de audio: ' + (err.message || err));
    } finally {
      setUploadingAudio(false);
    }
  };

  // Subir imagen para el vinilo a Supabase Storage
  const handleUploadVinylImage = async (file: File) => {
    try {
      setUploadingImage(true);
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanName = `branding/intro_vinilo_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(cleanName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('catalogo')
        .getPublicUrl(cleanName);

      setIntroImagenUrl(publicUrl);

      // Guardar inmediatamente
      await updateSettings({ intro_imagen_url: publicUrl });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert('¡Nueva imagen para el vinilo subida y asignada con éxito!');
    } catch (err: any) {
      console.error('Error subiendo imagen de vinilo:', err);
      alert('Error al subir imagen: ' + (err.message || err));
    } finally {
      setUploadingImage(false);
    }
  };

  // Probar reproducción del audio en el panel
  const togglePlayAudioPreview = () => {
    if (isPlayingAudio) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingAudio(false);
    } else {
      if (!previewAudioRef.current || previewAudioRef.current.src !== introAudioUrl) {
        previewAudioRef.current = new Audio(introAudioUrl);
        previewAudioRef.current.onended = () => setIsPlayingAudio(false);
      }
      previewAudioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch((err) => {
          alert('No se pudo reproducir el archivo de audio. Verifica que la URL sea válida.');
          console.warn('Error reproduciendo audio:', err);
          setIsPlayingAudio(false);
        });
    }
  };

  // Guardar configuración completa en Supabase
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await updateSettings({
        intro_activo: introActivo,
        intro_audio_url: introAudioUrl,
        intro_imagen_url: introImagenUrl,
        intro_duracion_segundos: Number(introDuracion) || 5,
      });
      await refreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error('Error guardando configuración de intro:', err);
      alert('Error al guardar: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Disparar prueba de pantalla completa en vivo durante la duración exacta configurada
  const handleStartLivePreview = () => {
    setShowLivePreview(true);
    try {
      if (!livePreviewAudioRef.current || livePreviewAudioRef.current.src !== introAudioUrl) {
        livePreviewAudioRef.current = new Audio(introAudioUrl);
      }
      livePreviewAudioRef.current.currentTime = 0;
      livePreviewAudioRef.current.play().catch((err) => console.warn('Preview audio blocked:', err));
    } catch (err) {
      console.warn('Error iniciando audio en prueba:', err);
    }

    if (livePreviewTimerRef.current) {
      clearTimeout(livePreviewTimerRef.current);
    }

    livePreviewTimerRef.current = setTimeout(() => {
      setShowLivePreview(false);
    }, (Number(introDuracion) || 5) * 1000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 font-mono">
      {/* ========================================================================= */}
      {/* CABECERA PRINCIPAL                                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neon/20">
        <div>
          <div className="flex items-center gap-2 text-neon text-xs uppercase tracking-widest mb-1">
            <Disc className="w-4 h-4 animate-spin" />
            <span>Módulo 6.8: Pantalla de Bienvenida & Experiencia Audiovisual</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-pure tracking-tight uppercase">
            Intro & Vinilo Temporal
          </h1>
          <p className="text-xs text-ice/70 mt-1 max-w-2xl font-sans">
            Configura la animación del vinilo giratorio, la duración en segundos y la música de fondo que experimentan los visitantes al entrar a la tienda.
          </p>
        </div>

        {/* Botones de acción principales */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleStartLivePreview}
            className="px-4 py-2 rounded-xl bg-magenta/20 hover:bg-magenta/30 border border-magenta/40 text-magenta text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(255,0,128,0.2)]"
          >
            <Eye className="w-4 h-4" />
            <span>Probar Intro ({introDuracion}s)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-neon hover:bg-neon-cyan text-navy font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-neon-glow"
          >
            {saving ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuración de la intro aplicada y sincronizada en tiempo real para todos los visitantes.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONMUTADOR MAESTRO: ACTIVAR O DESACTIVAR INTRO                            */}
      {/* ========================================================================= */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Power className={`w-5 h-5 ${introActivo ? 'text-neon-cyan' : 'text-slate-500'}`} />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Estado de la Intro
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${introActivo
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}
            >
              {introActivo ? 'ACTIVADA' : 'DESACTIVADA'}
            </span>
          </div>
          <p className="text-xs text-ice/70 font-sans">
            {introActivo
              ? 'La pantalla con el vinilo giratorio y la música de fondo se mostrará a los visitantes al cargar la web.'
              : 'La intro está desactivada. Los usuarios entrarán directamente a la página sin ninguna pantalla de espera ni audio.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIntroActivo(!introActivo)}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all flex items-center gap-2 ${introActivo
              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
            }`}
        >
          <Power className="w-4 h-4" />
          <span>{introActivo ? 'Desactivar Intro' : 'Activar Intro'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECCIÓN NUEVA: CONFIGURACIÓN DE DURACIÓN DEL VINILO                       */}
      {/* ========================================================================= */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-neon/20">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-neon" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-pure">
              Duración de la Intro
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-ice/70 uppercase">Duración Actual:</span>
            <span className="px-3 py-1 rounded-lg bg-neon/20 border border-neon/40 text-neon font-black text-xs font-mono shadow-[0_0_10px_rgba(0,210,255,0.25)]">
              {introDuracion} Segundos
            </span>
          </div>
        </div>

        <p className="text-xs text-ice/80 leading-relaxed font-sans">
          Establece cuántos segundos se mostrará la pantalla del vinilo giratorio a los visitantes antes de ingresar automáticamente al catálogo principal. Los usuarios disponen además del botón <strong className="text-neon">"Saltar Intro ⏭"</strong> para acceder de inmediato sin tener que esperar.
        </p>

        {/* Control deslizante (Slider) y Campo Numérico */}
        <div className="p-4 rounded-xl bg-pitch border border-neon/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs text-ice/70 font-mono">
                <span>Rápida (1s)</span>
                <span className="text-pure font-bold">{introDuracion} s</span>
                <span>Larga (15s)</span>
              </div>
              <input
                type="range"
                min={1}
                max={15}
                step={1}
                value={introDuracion}
                onChange={(e) => setIntroDuracion(Number(e.target.value))}
                className="w-full h-2 bg-navy rounded-lg appearance-none cursor-pointer accent-neon"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <label className="text-xs text-ice/70 font-mono uppercase">Segundos:</label>
              <input
                type="number"
                min={1}
                max={30}
                value={introDuracion}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(30, Number(e.target.value) || 1));
                  setIntroDuracion(val);
                }}
                className="w-20 px-3 py-1.5 rounded-xl bg-navy border border-neon/40 text-white font-mono text-center text-sm font-bold focus:outline-none focus:border-neon"
              />
            </div>
          </div>

          {/* Botones de Selección Rápida (Presets) */}
          <div className="space-y-1.5 pt-2 border-t border-neon/10">
            <span className="text-[10px] text-ice/60 uppercase font-mono tracking-wider block">
              Preajustes Rápidos Recomendados:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { sec: 2, label: '2 seg (Ultra rápida)' },
                { sec: 3, label: '3 seg (Dinámica)' },
                { sec: 5, label: '5 seg (Recomendada)' },
                { sec: 8, label: '8 seg (Giro completo)' },
                { sec: 10, label: '10 seg (Cinemática)' },
              ].map((preset) => (
                <button
                  key={preset.sec}
                  type="button"
                  onClick={() => setIntroDuracion(preset.sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all border ${
                    introDuracion === preset.sec
                      ? 'bg-neon/20 border-neon text-neon shadow-[0_0_12px_rgba(0,210,255,0.3)]'
                      : 'bg-navy/60 hover:bg-navy border-neon/20 text-slate-300 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-navy/60 border border-neon/20 text-ice/80 text-[11px] font-sans flex items-start gap-2">
          <FastForward className="w-4 h-4 text-magenta shrink-0 mt-0.5" />
          <span>
            <strong>Audio continuo:</strong> Cuando se cumpla el tiempo o el usuario presione <em>"Saltar Intro"</em>, la música continuará sonando en segundo plano de manera ininterrumpida mientras navega por los productos.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================================= */}
        {/* SECCIÓN 1: CONFIGURACIÓN DE AUDIO                                         */}
        {/* ========================================================================= */}
        <div className="cyber-panel rounded-2xl p-6 border-neon/30 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neon/20">
            <h2 className="text-sm font-bold uppercase tracking-wider text-pure flex items-center gap-2">
              <Music className="w-4 h-4 text-neon-cyan" />
              <span>Pista de Audio de la Intro</span>
            </h2>
            <span className="text-[10px] font-mono text-ice/60">MP3 / WAV</span>
          </div>

          <p className="text-xs text-ice/80 leading-relaxed font-sans">
            El audio comienza a reproducirse al ingresar y <strong className="text-neon-cyan">continúa sonando en segundo plano</strong> aun después de que el vinilo se oculte a los {introDuracion} segundos.
          </p>

          {/* Reproductor de Prueba y Estado */}
          <div className="p-4 rounded-xl bg-pitch border border-neon/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-ice/70 uppercase">Audio Actual:</span>
              <button
                type="button"
                onClick={togglePlayAudioPreview}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${isPlayingAudio
                    ? 'bg-magenta/20 text-magenta border-magenta/40 animate-pulse'
                    : 'bg-neon-blue/20 text-neon-cyan border-neon-blue/40 hover:bg-neon-blue/30'
                  }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Escuchar Audio</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-[11px] text-white break-all font-mono bg-navy/60 p-2 rounded-lg border border-neon/10">
              {introAudioUrl}
            </div>
          </div>

          {/* Subir archivo de audio */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase text-ice/70">
              Subir Nueva Pista de Audio (.mp3, .wav, .ogg):
            </label>
            <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-navy/80 hover:bg-navy border border-dashed border-neon/40 hover:border-neon-cyan text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-neon-cyan" />
              <span>{uploadingAudio ? 'Subiendo archivo a la nube...' : 'Seleccionar Archivo de Audio'}</span>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.ogg,.m4a"
                disabled={uploadingAudio}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadAudio(file);
                }}
              />
            </label>
          </div>

          {/* Entrada de URL directa de audio */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase text-ice/70">
              O ingresa la URL directa del archivo de audio:
            </label>
            <input
              type="text"
              value={introAudioUrl}
              onChange={(e) => setIntroAudioUrl(e.target.value)}
              placeholder="/intro.mp3 o https://..."
              className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: VISTA PREVIA Y CONFIGURACIÓN DEL VINILO                        */}
        {/* ========================================================================= */}
        <div className="cyber-panel rounded-2xl p-6 border-neon/30 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neon/20">
            <h2 className="text-sm font-bold uppercase tracking-wider text-pure flex items-center gap-2">
              <Disc className="w-4 h-4 text-magenta" />
              <span>Imagen del Vinilo & Simulación</span>
            </h2>
            <span className="text-[10px] font-mono text-magenta">Sombra Neón Fucsia</span>
          </div>

          {/* Simulación visual en tiempo real */}
          <div className="p-6 rounded-2xl bg-[#050811] border border-magenta/30 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,210,255,0.1)_0%,rgba(7,11,25,0.95)_70%,#050811_100%)] pointer-events-none" />
            <div className="relative z-10 w-44 h-44 rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,0,128,0.35),0_0_60px_rgba(0,210,255,0.2)] border-2 border-magenta/40 bg-[#060913] flex items-center justify-center">
              <img
                src={introImagenUrl}
                alt="Vinilo Preview"
                className="w-full h-full object-cover rounded-full animate-vinyl-spin select-none"
                style={{ clipPath: 'circle(48.5% at 50% 50%)' }}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== encodeURI(introImagenUrl)) {
                    target.src = encodeURI(introImagenUrl);
                  }
                }}
              />
            </div>
            <span className="relative z-10 text-[10px] text-ice/70 font-mono">
              Giro fluido y pausado • Fondo oficial • Sombra Neón Fucsia y Cyan
            </span>
          </div>

          {/* Subir archivo de imagen para el vinilo */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase text-ice/70">
              Subir Nueva Imagen de Vinilo (PNG o JPG redondo):
            </label>
            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy/80 hover:bg-navy border border-dashed border-magenta/40 hover:border-magenta text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-magenta" />
              <span>{uploadingImage ? 'Subiendo imagen...' : 'Seleccionar Imagen de Vinilo'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={uploadingImage}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadVinylImage(file);
                }}
              />
            </label>
          </div>

          {/* Entrada de URL de imagen */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase text-ice/70">
              Ruta o URL de la imagen del vinilo:
            </label>
            <input
              type="text"
              value={introImagenUrl}
              onChange={(e) => setIntroImagenUrl(e.target.value)}
              placeholder="/RM&MASHA VINIL.jpg"
              className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL / OVERLAY DE PRUEBA EN VIVO A PANTALLA COMPLETA                     */}
      {/* ========================================================================= */}
      {showLivePreview && (
        <div
          className="fixed inset-0 z-[100000] bg-[#050811] flex flex-col items-center justify-center select-none overflow-hidden cursor-pointer"
          onClick={() => {
            setShowLivePreview(false);
            if (livePreviewTimerRef.current) clearTimeout(livePreviewTimerRef.current);
          }}
        >
          {/* Fondo oficial de la tienda */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,210,255,0.15)_0%,rgba(7,11,25,0.96)_65%,#050811_100%)] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-magenta/10 rounded-full blur-[110px] pointer-events-none" />

          {/* Botón Saltar Intro en preview */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowLivePreview(false);
              if (livePreviewTimerRef.current) clearTimeout(livePreviewTimerRef.current);
            }}
            className="absolute top-6 right-6 z-20 flex items-center gap-2 px-5 py-2.5 rounded-full bg-pitch/90 border border-neon/60 text-white text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(0,210,255,0.4)] hover:border-magenta hover:shadow-[0_0_25px_rgba(255,0,128,0.5)] transition-all"
          >
            <span>Saltar Intro</span>
            <span className="text-neon text-sm">⏭</span>
          </button>

          <div className="relative z-10 flex flex-col items-center justify-center p-4">
            <div className="relative w-56 h-56 sm:w-60 sm:h-60 md:w-64 md:h-64 aspect-square rounded-full overflow-hidden shadow-[0_0_45px_rgba(255,0,128,0.45),0_0_75px_rgba(0,210,255,0.25)] border-2 border-magenta/40 flex items-center justify-center bg-[#060913] shrink-0">
              <img
                src={introImagenUrl}
                alt="RM & MASHA Vinilo Live Preview"
                className="w-full h-full object-cover rounded-full pointer-events-none select-none animate-vinyl-spin"
                style={{ clipPath: 'circle(48.5% at 50% 50%)' }}
                onError={(e) => {
                  const target = e.currentTarget;
                  target.src = encodeURI(introImagenUrl);
                }}
              />
            </div>

            <div className="mt-7 px-5 py-2 rounded-full bg-pitch-panel/90 border border-neon-blue/30 text-[11px] text-ice font-mono flex items-center gap-2 shadow-neon-border animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta animate-ping" />
              <span>Prueba de Intro ({introDuracion}s) • Haz clic para cerrar</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
