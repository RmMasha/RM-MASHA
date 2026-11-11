'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency, getRoleBadgeColor, formatDate } from '@/lib/utils';
import { User, Phone, Globe, Calendar, Wallet, Shield, Save, CheckCircle, Loader2 } from 'lucide-react';

export default function PerfilPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nickname, setNickname] = useState('');
  const [edad, setEdad] = useState('');
  const [pais, setPais] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || '');
      setWhatsapp(profile.whatsapp || '');
      setNickname(profile.nickname || '');
      setEdad(profile.edad ? profile.edad.toString() : '');
      setPais(profile.pais || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/perfil');
    }
  }, [user, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          nombre: nombre.trim(),
          whatsapp: whatsapp.trim(),
          nickname: nickname.trim() || null,
          edad: edad ? parseInt(edad, 10) : null,
          pais: pais.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert('Error al actualizar perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <span className="text-xs uppercase font-extrabold tracking-widest text-brand-gold">
          Mi Cuenta
        </span>
        <h1 className="text-3xl font-black text-white">Configuración del Perfil</h1>
        <p className="text-xs text-slate-400 mt-1">
          Administra tus datos personales y revisa tu nivel de usuario y saldo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RESUMEN DE USUARIO (1 COL) */}
        <div className="p-6 rounded-3xl bg-surface-card border border-surface-border text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-3xl font-black text-white mx-auto shadow-xl">
            {profile.nombre.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{profile.nombre}</h2>
            <p className="text-xs text-slate-400">{profile.email}</p>
            <div className="mt-2">
              <span
                className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full border ${getRoleBadgeColor(
                  profile.rol
                )}`}
              >
                {profile.rol.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-border space-y-2 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Saldo Disponible:</span>
              <strong className="text-brand-gold font-bold">
                {formatCurrency(profile.saldo_actual)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Miembro desde:</span>
              <span className="text-slate-300">{formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>

        {/* FORMULARIO EDITAR DATOS (2 COLS) */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-surface-card border border-surface-border shadow-xl">
          <h3 className="font-bold text-white text-base mb-4">Editar Datos Personales</h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">WhatsApp de Contacto</label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nickname de Jugador</label>
                <input
                  type="text"
                  placeholder="Ej: Carlos_Pro"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">País</label>
                <input
                  type="text"
                  placeholder="Ej: Venezuela"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Edad</label>
              <input
                type="number"
                min="10"
                max="99"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                className="w-32 px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
              />
            </div>

            {savedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Perfil actualizado exitosamente.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-glow-red transition-all flex items-center gap-2 disabled:opacity-50 mt-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
