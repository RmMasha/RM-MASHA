'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAppearance } from '@/context/AppearanceContext';
import {
  Palette,
  Image as ImageIcon,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Upload,
  Eye,
  Sliders,
  Gem,
  ArrowRight,
  Wallet,
  Shield,
  Trash2,
} from 'lucide-react';

const DEFAULT_FACTORY_COLORS = {
  color_neon_principal: '#00D2FF',
  color_neon_secundario: '#0070F3',
  color_magenta: '#FF007F',
  color_ice: '#7DD3FC',
  color_gold: '#FBBF24',
};

export default function AdminAparienciaPage() {
  const { settings, refreshSettings, updateSettings } = useAppearance();

  // Estados locales para el formulario
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [colorNeonPrincipal, setColorNeonPrincipal] = useState('#00D2FF');
  const [colorNeonSecundario, setColorNeonSecundario] = useState('#0070F3');
  const [colorMagenta, setColorMagenta] = useState('#FF007F');
  const [colorIce, setColorIce] = useState('#7DD3FC');
  const [colorGold, setColorGold] = useState('#FBBF24');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logo_url || '');
      setFaviconUrl(settings.favicon_url || '');
      setColorNeonPrincipal(settings.color_neon_principal || '#00D2FF');
      setColorNeonSecundario(settings.color_neon_secundario || '#0070F3');
      setColorMagenta(settings.color_magenta || '#FF007F');
      setColorIce(settings.color_ice || '#7DD3FC');
      setColorGold(settings.color_gold || '#FBBF24');
    }
  }, [settings]);

  // Subir imagen de Logo a Supabase Storage
  const handleUploadLogo = async (file: File) => {
    try {
      setUploadingLogo(true);
      const ext = file.name.split('.').pop();
      const path = `branding/logo_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('catalogo')
        .getPublicUrl(path);

      setLogoUrl(publicUrl);
    } catch (err: any) {
      console.error('Error subiendo logo:', err);
      alert('Error al subir logo: ' + err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // Subir imagen de Favicon a Supabase Storage
  const handleUploadFavicon = async (file: File) => {
    try {
      setUploadingFavicon(true);
      const ext = file.name.split('.').pop();
      const path = `branding/favicon_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('catalogo')
        .getPublicUrl(path);

      setFaviconUrl(publicUrl);
    } catch (err: any) {
      console.error('Error subiendo favicon:', err);
      alert('Error al subir favicon: ' + err.message);
    } finally {
      setUploadingFavicon(false);
    }
  };

  // Guardar configuración completa
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);

      await updateSettings({
        logo_url: logoUrl.trim() || null,
        favicon_url: faviconUrl.trim() || null,
        color_neon_principal: colorNeonPrincipal,
        color_neon_secundario: colorNeonSecundario,
        color_magenta: colorMagenta,
        color_ice: colorIce,
        color_gold: colorGold,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      alert('¡Apariencia y colores de botones actualizados en toda la plataforma!');
    } catch (err: any) {
      console.error('Error al guardar apariencia:', err);
      alert('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Restablecer a los colores de fábrica
  const handleResetFactory = async () => {
    if (!confirm('¿Deseas restablecer todos los botones y luces a los colores originales de fábrica?')) return;
    setColorNeonPrincipal(DEFAULT_FACTORY_COLORS.color_neon_principal);
    setColorNeonSecundario(DEFAULT_FACTORY_COLORS.color_neon_secundario);
    setColorMagenta(DEFAULT_FACTORY_COLORS.color_magenta);
    setColorIce(DEFAULT_FACTORY_COLORS.color_ice);
    setColorGold(DEFAULT_FACTORY_COLORS.color_gold);
  };

  return (
    <div className="space-y-6">
      {/* CABECERA */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-magenta/15 border border-magenta/30 text-magenta-light text-[11px] font-mono uppercase mb-2">
            <Palette className="w-3.5 h-3.5 text-magenta" />
            <span>Módulo de Personalización & Marca</span>
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Panel de Apariencia & Colores
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Cambia el logotipo oficial de la tienda, el favicon del navegador y personaliza los colores y halos de luz de todos los botones de la web.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetFactory}
          className="btn-ice-pill px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer Fábrica</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ========================================================================= */}
        {/* SECCIÓN 1: GESTIÓN DE MARCA (LOGO & FAVICON)                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* TARJETA DE LOGO */}
          <div className="cyber-panel rounded-2xl p-6 border-neon/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neon/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-pure flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-neon-cyan" />
                <span>Logotipo de la Tienda</span>
              </h2>
              <span className="text-[10px] font-mono text-ice/60">Navbar & Footer</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-pitch-black border-2 border-neon-blue/50 flex items-center justify-center p-2 overflow-hidden shadow-neon-border shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-ice/50 font-mono text-[10px]">
                    <Gem className="w-6 h-6 mx-auto mb-1 text-neon-blue" />
                    <span>Sin Logo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xs text-ice/80 font-mono">
                  Sube tu imagen (PNG transparente recomendado, 200x200px máx) o ingresa un enlace directo.
                </p>

                <div className="flex items-center gap-2">
                  <label className="btn-neon-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingLogo ? 'Subiendo...' : 'Subir Archivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingLogo}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadLogo(file);
                      }}
                    />
                  </label>

                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="p-1.5 rounded-lg text-magenta hover:bg-magenta/20 transition-colors"
                      title="Quitar logo y usar icono predeterminado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-ice/70 mb-1">
                URL Directa del Logo (Opcional):
              </label>
              <input
                type="url"
                placeholder="https://tudominio.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

          {/* TARJETA DE FAVICON */}
          <div className="cyber-panel rounded-2xl p-6 border-neon/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neon/20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-pure flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Favicon del Navegador</span>
              </h2>
              <span className="text-[10px] font-mono text-ice/60">Pestaña Web</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-pitch-black border-2 border-gold/50 flex items-center justify-center p-2 overflow-hidden shadow-[0_0_15px_rgba(251,191,36,0.2)] shrink-0">
                {faviconUrl ? (
                  <img src={faviconUrl} alt="Favicon Preview" className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-xl">💎</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-xs text-ice/80 font-mono">
                  Icono cuadrado pequeño (formato .ico o .png 32x32px) para la pestaña del navegador.
                </p>

                <div className="flex items-center gap-2">
                  <label className="btn-ice-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingFavicon ? 'Subiendo...' : 'Subir Favicon'}</span>
                    <input
                      type="file"
                      accept="image/*,.ico"
                      disabled={uploadingFavicon}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFavicon(file);
                      }}
                    />
                  </label>

                  {faviconUrl && (
                    <button
                      type="button"
                      onClick={() => setFaviconUrl('')}
                      className="p-1.5 rounded-lg text-magenta hover:bg-magenta/20 transition-colors"
                      title="Quitar favicon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-ice/70 mb-1">
                URL Directa del Favicon:
              </label>
              <input
                type="url"
                placeholder="https://tudominio.com/favicon.ico"
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-pitch border border-neon/30 text-white text-xs font-mono focus:outline-none focus:border-neon-cyan"
              />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN 2: PALETA DE COLORES DE BOTONES & ILUMINACIÓN NEÓN                */}
        {/* ========================================================================= */}
        <div className="cyber-panel rounded-2xl p-6 border-neon/30 space-y-6">
          <div className="pb-3 border-b border-neon/20">
            <h2 className="text-base font-bold uppercase tracking-wider text-pure flex items-center gap-2">
              <Sliders className="w-5 h-5 text-neon-cyan" />
              <span>Estilizador de Botones & Colores Neón</span>
            </h2>
            <p className="text-xs text-ice/70 font-mono mt-1">
              Personaliza los códigos de color hexadecimales para los 3 tipos de botones interactivos de toda la web.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Color 1: Neón Principal */}
            <div className="p-3.5 rounded-xl bg-pitch border border-neon/20 space-y-2">
              <label className="block text-[11px] font-mono uppercase text-ice font-bold">
                1. Botón Neón (Inicio)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorNeonPrincipal}
                  onChange={(e) => setColorNeonPrincipal(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={colorNeonPrincipal}
                  onChange={(e) => setColorNeonPrincipal(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded bg-navy text-xs font-mono text-white border border-neon/30 uppercase"
                />
              </div>
              <p className="text-[10px] text-ice/50 font-mono">Color base del gradiente</p>
            </div>

            {/* Color 2: Neón Secundario */}
            <div className="p-3.5 rounded-xl bg-pitch border border-neon/20 space-y-2">
              <label className="block text-[11px] font-mono uppercase text-ice font-bold">
                2. Botón Neón (Fin)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorNeonSecundario}
                  onChange={(e) => setColorNeonSecundario(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={colorNeonSecundario}
                  onChange={(e) => setColorNeonSecundario(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded bg-navy text-xs font-mono text-white border border-neon/30 uppercase"
                />
              </div>
              <p className="text-[10px] text-ice/50 font-mono">Gradiente y profundidad</p>
            </div>

            {/* Color 3: Botón Hielo Secundario */}
            <div className="p-3.5 rounded-xl bg-pitch border border-neon/20 space-y-2">
              <label className="block text-[11px] font-mono uppercase text-ice font-bold">
                3. Botón Hielo / Borde
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorIce}
                  onChange={(e) => setColorIce(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={colorIce}
                  onChange={(e) => setColorIce(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded bg-navy text-xs font-mono text-white border border-neon/30 uppercase"
                />
              </div>
              <p className="text-[10px] text-ice/50 font-mono">Borde de botones secundarios</p>
            </div>

            {/* Color 4: Botón Magenta / Acento */}
            <div className="p-3.5 rounded-xl bg-pitch border border-neon/20 space-y-2">
              <label className="block text-[11px] font-mono uppercase text-ice font-bold">
                4. Botón Magenta
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorMagenta}
                  onChange={(e) => setColorMagenta(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={colorMagenta}
                  onChange={(e) => setColorMagenta(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded bg-navy text-xs font-mono text-white border border-neon/30 uppercase"
                />
              </div>
              <p className="text-[10px] text-ice/50 font-mono">Botones de ofertas y VIP</p>
            </div>

            {/* Color 5: Dorado */}
            <div className="p-3.5 rounded-xl bg-pitch border border-neon/20 space-y-2">
              <label className="block text-[11px] font-mono uppercase text-ice font-bold">
                5. Acentos Dorados
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorGold}
                  onChange={(e) => setColorGold(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={colorGold}
                  onChange={(e) => setColorGold(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded bg-navy text-xs font-mono text-white border border-neon/30 uppercase"
                />
              </div>
              <p className="text-[10px] text-ice/50 font-mono">Insignias y precios de wallet</p>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* SIMULADOR EN VIVO DE BOTONES                                              */}
          {/* ========================================================================= */}
          <div className="mt-6 pt-6 border-t border-neon/20">
            <h3 className="text-xs font-mono font-bold uppercase text-ice mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-neon-cyan" />
              <span>Previsualización en Vivo de Botones con los Colores Seleccionados</span>
            </h3>

            <div className="p-6 rounded-2xl bg-slate-950/80 border border-neon/30 flex flex-wrap items-center justify-center gap-6">
              
              {/* Botón Neón Simulado */}
              <button
                type="button"
                style={{
                  background: `linear-gradient(135deg, ${colorNeonPrincipal} 0%, ${colorNeonSecundario} 100%)`,
                  boxShadow: `0 0 22px 2px ${colorNeonPrincipal}88`,
                }}
                className="px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105"
              >
                <span>Ver Catálogo Completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Botón Hielo Secundario Simulado */}
              <button
                type="button"
                style={{
                  borderColor: colorIce,
                  color: colorIce,
                  boxShadow: `0 0 15px ${colorIce}44`,
                }}
                className="px-6 py-3 rounded-full bg-pitch border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Wallet className="w-4 h-4" />
                <span>Recargar Saldo Wallet</span>
              </button>

              {/* Botón Magenta Simulado */}
              <button
                type="button"
                style={{
                  background: `linear-gradient(135deg, ${colorMagenta} 0%, #A00050 100%)`,
                  boxShadow: `0 0 22px 2px ${colorMagenta}88`,
                }}
                className="px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Shield className="w-4 h-4" />
                <span>Edición Invierno VIP</span>
              </button>

            </div>
          </div>

          {/* BOTÓN GUARDAR */}
          <div className="flex items-center justify-between pt-6 border-t border-neon/20">
            <div>
              {savedSuccess && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Configuración guardada y aplicada en vivo!
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-neon-pill px-8 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-neon"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando Apariencia...' : 'Guardar Cambios de Apariencia'}</span>
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}

