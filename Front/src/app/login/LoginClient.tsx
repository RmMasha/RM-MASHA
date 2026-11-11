'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const { error } = await signIn(email, password);
    if (error) {
      setErrorMsg(error.message || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
      setLoading(false);
    } else {
      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="cyber-panel rounded-3xl p-8 md:p-10 max-w-md w-full border-neon/40 shadow-neon relative overflow-hidden">
        {/* Adorno de fondo */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-neon/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-[11px] font-mono uppercase tracking-wider mb-2">
            <span>❄</span> Autenticación de Jugador
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Iniciar <span className="text-neon">Sesión</span>
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Accede a tu billetera interna y precios según tu rol
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-magenta/15 border border-magenta text-xs font-mono text-pure flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-mono uppercase text-ice mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="tu_correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-sm font-mono focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ice mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-sm font-mono focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neon-pill py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? 'Validando Credenciales...' : 'Ingresar a la Plataforma'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neon/15 text-center text-xs font-mono text-ice/70 relative z-10">
          ¿No tienes una cuenta aún?{' '}
          <Link
            href={`/registro?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-neon hover:text-white underline font-bold transition-colors"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

