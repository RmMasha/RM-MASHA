'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Gem, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { refreshProfile } = useAuth();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        await refreshProfile();
        router.push(redirect);
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setErrorMsg('Correo o contraseña incorrectos.');
      } else {
        setErrorMsg(err.message || 'No fue posible iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full rounded-3xl bg-surface-card border border-surface-border p-8 shadow-2xl glow-border">
      {/* LOGO */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white mx-auto shadow-glow-red">
          <Gem className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white">Iniciar Sesión</h1>
        <p className="text-xs text-slate-400">
          Ingresa a tu cuenta para recargar con saldo y ver tus pedidos
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm placeholder-slate-500 focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 shadow-glow-red transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            'Ingresar a mi Cuenta'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-surface-border text-center text-xs text-slate-400">
        ¿No tienes una cuenta aún?{' '}
        <Link
          href={`/registro?redirect=${encodeURIComponent(redirect)}`}
          className="font-bold text-brand-primary hover:text-brand-accent transition-colors"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
