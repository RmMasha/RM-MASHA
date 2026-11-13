import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (typeof window === 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'rm_masha_session_auth',
      },
      cookieOptions: {
        name: 'sb-rmmasha-auth',
        maxAge: 60 * 60 * 24 * 365, // 1 año de sesión persistente ininterrumpida
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    });
  }

  return browserClient;
}

// Cliente singleton para componentes del navegador
export const supabase = createClient();
