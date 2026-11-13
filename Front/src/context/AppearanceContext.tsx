'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AppearanceSettings } from '@/types/database.types';

interface AppearanceContextType {
  settings: AppearanceSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<AppearanceSettings>) => Promise<void>;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  id: 'global',
  logo_url: null,
  favicon_url: null,
  site_name: 'RM & MASHA',
  site_subtitle: 'Free Fire • Recargas Oficiales',
  hero_title: 'FREE FIRE',
  hero_subtitle: 'Recargas al Instante con Entrega Inmediata',
  hero_description: 'Diamantes oficiales garantizados, Pases Booyah y Membresías por tu ID de Jugador. Compra segura con acreditación automatizada en < 2 minutos o paga al instante con tu Saldo Wallet.',
  color_neon_principal: '#00D2FF',
  color_neon_secundario: '#0070F3',
  color_magenta: '#FF007F',
  color_ice: '#7DD3FC',
  color_gold: '#FBBF24',
};

const AppearanceContext = createContext<AppearanceContextType>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  refreshSettings: async () => {},
  updateSettings: async () => {},
});

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Aplicar variables CSS dinámicas en el DOM
  const applyCssVariables = useCallback((current: AppearanceSettings) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--neon-blue', current.color_neon_principal || '#00D2FF');
    root.style.setProperty('--neon-secondary', current.color_neon_secundario || '#0070F3');
    root.style.setProperty('--magenta', current.color_magenta || '#FF007F');
    root.style.setProperty('--ice-blue', current.color_ice || '#7DD3FC');
    root.style.setProperty('--gold', current.color_gold || '#FBBF24');

    // Actualizar Favicon en el navegador si está configurado
    if (current.favicon_url) {
      const selectors = ["link[rel~='icon']", "link[rel='shortcut icon']", "link[rel='icon']"];
      const existing = document.querySelectorAll<HTMLLinkElement>(selectors.join(','));
      if (existing.length === 0) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = current.favicon_url;
        document.head.appendChild(link);
      } else {
        existing.forEach((link) => {
          link.href = current.favicon_url!;
        });
      }
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('appearance_settings')
        .select('*')
        .eq('id', 'global')
        .single();

      if (!error && data) {
        setSettings(data as AppearanceSettings);
        applyCssVariables(data as AppearanceSettings);
      }
    } catch (err) {
      console.warn('Error fetching appearance settings:', err);
    } finally {
      setLoading(false);
    }
  }, [applyCssVariables]);

  useEffect(() => {
    fetchSettings();

    // Suscripción Realtime para actualizar la apariencia en toda la web al instante
    const channelName = `appearance-global-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appearance_settings' },
        (payload) => {
          if (payload.new) {
            setSettings(payload.new as AppearanceSettings);
            applyCssVariables(payload.new as AppearanceSettings);
          }
        }
      );

    try {
      channel.subscribe();
    } catch (e) {
      // Ignorar
    }

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {}
    };
  }, [fetchSettings, applyCssVariables]);

  const updateSettings = async (newSettings: Partial<AppearanceSettings>) => {
    const merged = { ...settings, ...newSettings, updated_at: new Date().toISOString() };
    setSettings(merged);
    applyCssVariables(merged);

    const { error } = await supabase
      .from('appearance_settings')
      .upsert({ ...merged, id: 'global' });

    if (error) {
      throw error;
    }
  };

  return (
    <AppearanceContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}

