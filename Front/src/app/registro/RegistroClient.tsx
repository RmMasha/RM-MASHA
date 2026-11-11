'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegistroClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const { signUp } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [edad, setEdad] = useState('');
  const [pais, setPais] = useState('Venezuela');
  const [codigoReferido, setCodigoReferido] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (!nombre.trim() || !email.trim() || !whatsapp.trim() || !password.trim()) {
      setErrorMsg('Nombre, Correo, WhatsApp y Contraseña son obligatorios.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, {
      nombre: nombre.trim(),
      whatsapp: whatsapp.trim(),
      nickname: nickname.trim() || null,
      edad: edad ? parseInt(edad) : null,
      pais: pais.trim() || null,
      codigo_referido: codigoReferido.trim() || null,
    });

    if (error) {
      setErrorMsg(error.message || 'Error al registrar la cuenta. Intenta nuevamente.');
      setLoading(false);
    } else {
      router.push(redirectUrl);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 py-12">
      <div className="cyber-panel rounded-3xl p-8 md:p-10 max-w-lg w-full border-neon/40 shadow-neon relative overflow-hidden">
        {/* Adorno de fondo */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-magenta/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-magenta/10 border border-magenta/30 text-magenta text-[11px] font-mono uppercase tracking-wider mb-2">
            <span>❄</span> Registro de Nuevo Usuario
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Crear <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-ice to-white">Cuenta</span>
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Únete a RM & Masha y accede a precios preferenciales para recargas
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-magenta/15 border border-magenta text-xs font-mono text-pure flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Nombre Completo <span className="text-magenta">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Carlos Pérez"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-xs font-mono focus:outline-none focus:border-neon transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                WhatsApp <span className="text-magenta">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+58 412 1234567"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-xs font-mono focus:outline-none focus:border-neon transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ice mb-1">
              Correo Electrónico <span className="text-magenta">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="tu_correo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-xs font-mono focus:outline-none focus:border-neon transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ice mb-1">
              Contraseña <span className="text-magenta">*</span>
            </label>
            <input
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-xs font-mono focus:outline-none focus:border-neon transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Nickname de Juego
              </label>
              <input
                type="text"
                placeholder="Ej: GhostFF"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-xs font-mono focus:outline-none focus:border-neon transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                País
              </label>
              <input
                type="text"
                placeholder="Venezuela"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-xs font-mono focus:outline-none focus:border-neon transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Edad
              </label>
              <input
                type="number"
                placeholder="Ej: 22"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-xs font-mono focus:outline-none focus:border-neon transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Código de Referido (Opcional)
              </label>
              <input
                type="text"
                placeholder="CÓDIGO"
                value={codigoReferido}
                onChange={(e) => setCodigoReferido(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-xs font-mono focus:outline-none focus:border-neon transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-neon-pill py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {loading ? 'Creando Cuenta...' : 'Registrarme en RM & Masha'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-neon/15 text-center text-xs font-mono text-ice/70 relative z-10">
          ¿Ya tienes cuenta?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-neon hover:text-white underline font-bold transition-colors"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

