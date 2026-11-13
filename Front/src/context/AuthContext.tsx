'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { UserProfile, Notification as DBNotification } from '@/types/database.types';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  notifications: DBNotification[];
  unreadCount: number;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata: Record<string, any>) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  notifications: [],
  unreadCount: 0,
  loading: true,
  refreshProfile: async () => {},
  markNotificationAsRead: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndNotifications = useCallback(async (userId: string) => {
    try {
      const { data: prof, error: profError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (prof && !profError) {
        setProfile(prof as UserProfile);
        try {
          localStorage.setItem('rm_masha_cached_profile', JSON.stringify(prof));
        } catch (e) {}
      }

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })
        .limit(15);

      if (notifs) {
        setNotifications(notifs as DBNotification[]);
      }
    } catch (err) {
      console.error('Error al cargar perfil o notificaciones:', err);
    }
  }, []);

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfileAndNotifications(user.id);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await supabase.from('notifications').update({ leido: true }).eq('id', id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
      );
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data.user) {
      setUser(data.user);
      await fetchProfileAndNotifications(data.user.id);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, metadata: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (data.user) {
      setUser(data.user);
      await fetchProfileAndNotifications(data.user.id);
    }
    return { error };
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('rm_masha_cached_profile');
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error en signOut:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setNotifications([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Cargar perfil desde caché para evitar pantallas en blanco o deslogueos al recargar
    try {
      const cached = localStorage.getItem('rm_masha_cached_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) {
          setProfile(parsed);
        }
      }
    } catch (e) {}

    // 2. Cargar sesión inicial de Supabase persistente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfileAndNotifications(currentUser.id);
      } else {
        setProfile(null);
        setNotifications([]);
        try {
          localStorage.removeItem('rm_masha_cached_profile');
        } catch (e) {}
      }

      if (isMounted) setLoading(false);
    });

    // 3. Suscripción a cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (event === 'SIGNED_OUT' || !currentUser) {
        setProfile(null);
        setNotifications([]);
        try {
          localStorage.removeItem('rm_masha_cached_profile');
        } catch (e) {}
        if (isMounted) setLoading(false);
      } else if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED' ||
        event === 'INITIAL_SESSION'
      ) {
        await fetchProfileAndNotifications(currentUser.id);
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfileAndNotifications]);

  // Suscripción Realtime para Notificaciones y Cambios de Saldo/Rol
  useEffect(() => {
    if (!user?.id) return;

    const profileChannel = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as UserProfile;
          setProfile(updated);
          try {
            localStorage.setItem('rm_masha_cached_profile', JSON.stringify(updated));
          } catch (e) {}
        }
      )
      .subscribe();

    const notifChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `usuario_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as DBNotification;
          setNotifications((prev) => [newNotif, ...prev]);

          // Notificación nativa si el navegador está en segundo plano y tiene permiso
          try {
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification('RM & Masha', {
                body: newNotif.mensaje,
                icon: '/images/cyber-winter-hero.jpg',
              });
            }
          } catch (e) {}
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.leido).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        notifications,
        unreadCount,
        loading,
        refreshProfile,
        markNotificationAsRead,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
