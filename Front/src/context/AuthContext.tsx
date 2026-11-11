'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, Notification } from '@/types/database.types';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  notifications: Notification[];
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchProfileAndNotifications = useCallback(async (userId: string) => {
    try {
      const { data: prof, error: profError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (prof && !profError) {
        setProfile(prof as UserProfile);
      }

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (notifs) {
        setNotifications(notifs as Notification[]);
      }
    } catch (err) {
      console.error('Error al cargar perfil o notificaciones:', err);
    }
  }, [supabase]);

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
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setNotifications([]);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfileAndNotifications(currentUser.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfileAndNotifications(currentUser.id);
      } else {
        setProfile(null);
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, fetchProfileAndNotifications]);

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
          setProfile(payload.new as UserProfile);
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
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user?.id, supabase]);

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
