'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency, getRoleBadge } from '@/lib/utils';

export default function PerfilPage() {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();

  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nickname, setNickname] = useState('');
  const [edad, setEdad] = useState('');
  const [pais, setPais] = useState('');

  // Código de referidos
  const [codigoReferido, setCodigoReferido] = useState('');
  const [referredCount, setReferredCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/perfil');
    }
    if (profile) {
      setNombre(profile.nombre || '');
      setWhatsapp(profile.whatsapp || '');
      setNickname(profile.nickname || '');
      setEdad(profile.edad ? String(profile.edad) : '');
      setPais(profile.pais || '');

      // Manejo de código de referido
      initReferral(profile);
    }
  }, [user, profile, loading, router]);

  const initReferral = async (userProfile: any) => {
    let code = userProfile.codigo_referido;
    if (!code && userProfile.id) {
      // Auto-generar código de referido único basado en su ID
      code = `RM-${userProfile.id.slice(0, 6).toUpperCase()}`;
      try {
        await supabase
          .from('users')
          .update({ codigo_referido: code })
          .eq('id', userProfile.id);
      } catch (e) {
        console.warn('Could not auto-generate referral code:', e);
      }
    }

    setCodigoReferido(code || '');

    if (code) {
      try {
        const { count } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('codigo_referido', code);
        if (typeof count === 'number') {
          setReferredCount(count);
        }
      } catch (err) {
        console.error('Error fetching referred count:', err);
      }
    }
  };

  const handleCopyInviteLink = () => {
    if (!codigoReferido) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rmmasha.com';
    const inviteLink = `${origin}/registro?ref=${codigoReferido}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          nombre: nombre.trim(),
          whatsapp: whatsapp.trim(),
          nickname: nickname.trim() || null,
          edad: edad ? parseInt(edad) : null,
          pais: pais.trim() || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: '¡Perfil actualizado con éxito!' });
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      setMessage({ type: 'error', text: err.message || 'Error al actualizar perfil.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    try {
      setSaving(true);
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatares')
        .getPublicUrl(path);

      await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      await refreshProfile();
      setMessage({ type: 'success', text: '¡Foto de perfil actualizada!' });
    } catch (err: any) {
      console.error('Error avatar:', err);
      setMessage({ type: 'error', text: 'No se pudo subir la foto de perfil.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-ice font-mono">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-4xl">
      {/* Miga de Pan */}
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6">
        <Link href="/" className="hover:text-neon transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-pure font-bold">Mi Perfil</span>
      </nav>

      <div className="cyber-panel rounded-3xl p-6 md:p-10 mb-8 border-neon/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar con botón de carga */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-navy border-2 border-neon p-1 relative overflow-hidden shadow-[0_0_20px_rgba(0,210,255,0.4)]">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.nombre}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-neon via-ice to-magenta flex items-center justify-center text-3xl font-black text-white">
                  {profile?.nombre?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <label className="mt-2 text-[11px] font-mono text-neon hover:text-white cursor-pointer underline">
              Cambiar Foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
            </label>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
                {profile?.nombre}
              </h1>
              <span className={getRoleBadge(profile?.rol || 'cliente')}>
                {profile?.rol?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs font-mono text-ice/80 mb-3">{profile?.email}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono">
              <div className="px-3 py-1 rounded-xl bg-navy/80 border border-gold/30 text-gold flex items-center gap-1.5">
                <span>Saldo Actual:</span>
                <span className="font-bold">{formatCurrency(profile?.saldo_actual || 0)}</span>
              </div>
              <Link
                href="/billetera"
                className="text-neon hover:text-white underline underline-offset-2"
              >
                Ir a Billetera →
              </Link>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="btn-ice-pill px-5 py-2 text-xs font-bold uppercase tracking-wider text-magenta border-magenta/40 hover:border-magenta"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl mb-6 text-xs md:text-sm font-mono flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-neon/15 border border-neon text-pure shadow-[0_0_15px_rgba(0,210,255,0.3)]'
              : 'bg-magenta/15 border border-magenta text-pure shadow-[0_0_15px_rgba(255,0,127,0.3)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{message.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="font-bold text-white ml-4">
            ✕
          </button>
        </div>
      )}

      {/* PROGRAMA DE REFERIDOS */}
      <div className="cyber-panel rounded-2xl p-6 md:p-8 mb-8 border-neon/40 shadow-neon relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-magenta/15 border border-magenta/40 text-magenta text-[11px] font-mono uppercase mb-2">
              <span>🎁</span> Programa de Invitaciones
            </div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-pure">
              Invita a tus Amigos & Clientes
            </h2>
            <p className="text-xs text-ice/80 font-mono mt-1 max-w-xl">
              Comparte tu enlace exclusivo. Cada nuevo usuario que se registre con tu código quedará vinculado a tu cuenta.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="cyber-panel px-4 py-2 rounded-xl border-neon/30 text-center">
              <span className="text-2xl font-black text-neon">{referredCount}</span>
              <div className="text-[10px] font-mono text-ice/70 uppercase">
                {referredCount === 1 ? 'Amigo Invitado' : 'Amigos Invitados'}
              </div>
            </div>
          </div>
        </div>

        {/* Input con Enlace y Botón de Copiar */}
        <div className="mt-6 pt-5 border-t border-neon/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 flex items-center bg-navy/90 border border-neon/40 rounded-xl px-4 py-2.5">
            <span className="text-xs font-mono text-ice/60 mr-2 shrink-0">Código:</span>
            <span className="text-sm font-mono font-bold text-neon tracking-wider mr-4">
              {codigoReferido || 'CARGANDO...'}
            </span>
            <div className="hidden md:block w-px h-4 bg-neon/20 mr-4" />
            <input
              type="text"
              readOnly
              value={
                typeof window !== 'undefined' && codigoReferido
                  ? `${window.location.origin}/registro?ref=${codigoReferido}`
                  : `https://rmmasha.com/registro?ref=${codigoReferido}`
              }
              className="bg-transparent text-xs text-ice/80 font-mono w-full focus:outline-none select-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyInviteLink}
              disabled={!codigoReferido}
              className="btn-neon-pill px-6 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0"
            >
              {copied ? (
                <>
                  <span>✓</span> ¡Copiado!
                </>
              ) : (
                <>
                  <span>📋</span> Copiar Enlace
                </>
              )}
            </button>

            {codigoReferido && (
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `¡Hola! Únete a RM & Masha para recargar diamantes y servicios gamer al mejor precio. Regístrate con mi enlace: ${
                    typeof window !== 'undefined'
                      ? window.location.origin
                      : 'https://rmmasha.com'
                  }/registro?ref=${codigoReferido}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ice-pill px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0 text-emerald-400 border-emerald-500/40 hover:border-emerald-400"
                title="Compartir por WhatsApp"
              >
                <span>💬</span> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* FORMULARIO DE EDICIÓN */}
      <div className="cyber-panel rounded-2xl p-6 md:p-8 border-neon/30">
        <h2 className="text-lg font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
          Datos Personales & Preferencias
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Nombre y Apellido
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Nickname de Jugador
              </label>
              <input
                type="text"
                placeholder="Ej: GhostFF"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Edad
              </label>
              <input
                type="number"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                País
              </label>
              <input
                type="text"
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-navy/90 border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-neon-pill px-8 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Guardando Cambios...' : 'Actualizar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

