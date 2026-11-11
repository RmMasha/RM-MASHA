'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Gem, Mail, Lock, User, Phone, Globe, Loader2, AlertCircle } from 'lucide-react';

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { refreshProfile } = useAuth();
  const supabase = createClient();

  // Campos Obligatorios
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Campos Secundarios
  const [nickname, setNickname] = useState('');
  const [edad, setEdad] = useState('');
  const [pais, setPais] = useState('Venezuela');
  const [referido, setReferido] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombre: nombre.trim(),
            whatsapp: whatsapp.trim(),
            nickname: nickname.trim() || null,
            edad: edad ? parseInt(edad, 10) : null,
            pais: pais.trim() || null,
            codigo_referido: referido.trim() || null,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.user) {
        await refreshProfile();
        router.push(redirect);
      }
    } catch (err: any) {
      console.error('Error al registrar usuario:', err);
      setErrorMsg(err.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg w-full rounded-3xl bg-surface-card border border-surface-border p-8 shadow-2xl glow-border">
      {/* LOGO */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-gold flex items-center justify-center text-white mx-auto shadow-glow-red">
          <Gem className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-white">Crear Cuenta</h1>
        <p className="text-xs text-slate-400">
          Regístrate para acceder a recargas automatizadas y precios especiales
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* CAMPOS OBLIGATORIOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre y Apellido <span className="text-brand-primary">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Carlos La Rosa"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              WhatsApp <span className="text-brand-primary">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                placeholder="+58 412 1234567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Correo Electrónico <span className="text-brand-primary">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Contraseña <span className="text-brand-primary">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>

        {/* CAMPOS SECUNDARIOS */}
        <div className="pt-2 border-t border-surface-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Datos Opcionales de Jugador
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nickname en Free Fire
              </label>
              <input
                type="text"
                placeholder="Ej: Carlos_Pro"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                País
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Venezuela, Colombia, etc."
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Edad
              </label>
              <input
                type="number"
                min="10"
                max="99"
                placeholder="Ej: 22"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Código de Referido
              </label>
              <input
                type="text"
                placeholder="Opcional"
                value={referido}
                onChange={(e) => setReferido(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
              />
            </div>
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
          className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 shadow-glow-red transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creando tu Cuenta...
            </>
          ) : (
            'Crear Cuenta y Comenzar'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-surface-border text-center text-xs text-slate-400">
        ¿Ya tienes cuenta?{' '}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="font-bold text-brand-primary hover:text-brand-accent transition-colors"
        >
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-sm">Cargando registro...</div>}>
        <RegistroForm />
      </Suspense>
    </div>
  );
}
