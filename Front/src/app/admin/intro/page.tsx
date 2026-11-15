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
        intro_duracion_segundos: introDuracion,
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

  // Disparar prueba de pantalla completa en vivo durante 5 segundos
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

    setTimeout(() => {
      setShowLivePreview(false);
      // Mantener audio sonando o detener según preferencia de previsualización
    }, 5000);
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
            Configura la animación del vinilo giratorio y la música de fondo que experimentan los visitantes durante los primeros 5 segundos al entrar a la tienda.
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
            <span>Probar Intro (5s)</span>
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
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                introActivo
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
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all flex items-center gap-2 ${
            introActivo
              ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{introActivo ? 'Desactivar Intro' : 'Activar Intro'}</span>
        </button>
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
            El audio comienza a reproducirse al ingresar y <strong className="text-neon-cyan">continúa sonando en segundo plano</strong> aun después de que el vinilo se oculte a los 5 segundos.
          </p>

          {/* Reproductor de Prueba y Estado */}
          <div className="p-4 rounded-xl bg-pitch border border-neon/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-ice/70 uppercase">Audio Actual:</span>
              <button
                type="button"
                onClick={togglePlayAudioPreview}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
                  isPlayingAudio
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
          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-magenta/30 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
            <div className="relative">
              <img
                src={introImagenUrl}
                alt="Vinilo Preview"
                className="w-36 h-36 object-cover rounded-full shadow-[0_0_40px_rgba(255,0,128,0.3)] animate-[spin_2s_linear_infinite]"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== encodeURI(introImagenUrl)) {
                    target.src = encodeURI(introImagenUrl);
                  }
                }}
              />
            </div>
            <span className="text-[10px] text-ice/60 font-mono">
              Simulación: rounded-full • shadow-[0_0_40px_rgba(255,0,128,0.3)] • animate-[spin_2s_linear_infinite]
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
          className="fixed inset-0 z-[10000] bg-[#0a0a0a] flex flex-col items-center justify-center select-none overflow-hidden"
          onClick={() => setShowLivePreview(false)}
        >
          <img
            src={introImagenUrl}
            alt="RM & MASHA Vinilo Live Preview"
            className="w-56 h-56 sm:w-72 sm:h-72 object-cover rounded-full shadow-[0_0_40px_rgba(255,0,128,0.3)] animate-[spin_2s_linear_infinite] pointer-events-none"
            onError={(e) => {
              const target = e.currentTarget;
              target.src = encodeURI(introImagenUrl);
            }}
          />
          <div className="absolute bottom-10 px-4 py-1.5 rounded-full bg-pitch-panel/90 border border-neon/30 text-[11px] text-ice font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-magenta animate-ping" />
            <span>Previsualización en vivo (se cerrará automáticamente en 5s o haz clic para cerrar)</span>
          </div>
        </div>
      )}
    </div>
  );
}
