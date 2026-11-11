'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PaymentMethod, PaymentFormatRule } from '@/types/database.types';
import { CreditCard, Plus, Check, X, Loader2, Save } from 'lucide-react';

export default function AdminMetodosPagoPage() {
  const supabase = createClient();

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario nuevo método
  const [nombre, setNombre] = useState('');
  const [titular, setTitular] = useState('');
  const [datosCuenta, setDatosCuenta] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [formato, setFormato] = useState<PaymentFormatRule>('alfanumerico');
  const [regex, setRegex] = useState('');
  const [creating, setCreating] = useState(false);

  const loadMethods = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: true });

      if (data) setMethods(data as PaymentMethod[]);
    } catch (err) {
      console.error('Error cargando métodos de pago:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await supabase
        .from('payment_methods')
        .update({ activo: !currentActive })
        .eq('id', id);

      setMethods((prev) =>
        prev.map((m) => (m.id === id ? { ...m, activo: !currentActive } : m))
      );
    } catch (err: any) {
      alert('Error al actualizar método: ' + err.message);
    }
  };

  const handleCreateMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const { error } = await supabase.from('payment_methods').insert({
        nombre_metodo: nombre.trim(),
        titular: titular.trim() || null,
        numero_cuenta_o_dato: datosCuenta.trim() || null,
        instrucciones: instrucciones.trim() || null,
        formato_requerido: formato,
        regex_validacion: regex.trim() || null,
        activo: true,
      });

      if (error) throw error;

      setNombre('');
      setTitular('');
      setDatosCuenta('');
      setInstrucciones('');
      setRegex('');
      loadMethods();
    } catch (err: any) {
      alert('Error al crear método de pago: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Configuración de Métodos de Pago</h2>
        <p className="text-xs text-slate-400">
          Gestiona las opciones de depósito y pago directo para recargas de saldo y compras.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LISTADO DE MÉTODOS EXISTENTES (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface-card border border-surface-border rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm">Métodos de Pago Configurados</h3>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Cargando métodos...</div>
            ) : methods.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No hay métodos registrados.</div>
            ) : (
              <div className="space-y-3">
                {methods.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-surface border border-surface-border flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{m.nombre_metodo}</strong>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.activo
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {m.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      {m.titular && <p className="text-slate-400">Titular: {m.titular}</p>}
                      {m.numero_cuenta_o_dato && (
                        <p className="font-mono text-brand-gold select-all font-semibold">
                          {m.numero_cuenta_o_dato}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        Formato de referencia: <span className="text-white font-mono">{m.formato_requerido}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(m.id, m.activo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        m.activo
                          ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                    >
                      {m.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CREAR NUEVO MÉTODO (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface-card border border-surface-border rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-brand-primary" />
              Nuevo Método de Pago
            </h3>

            <form onSubmit={handleCreateMethod} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Método</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Binance Pay / Pago Móvil"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Titular de la Cuenta</label>
                <input
                  type="text"
                  placeholder="Ej: RM & Masha C.A."
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Número de Cuenta / Correo / PayID</label>
                <input
                  type="text"
                  placeholder="Ej: 0134-1234-5678... o PayID"
                  value={datosCuenta}
                  onChange={(e) => setDatosCuenta(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Regla de Formato Requerida</label>
                <select
                  value={formato}
                  onChange={(e) => setFormato(e.target.value as PaymentFormatRule)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                >
                  <option value="alfanumerico">Alfanumérico (Letras y números)</option>
                  <option value="solo_numeros">Solo Números</option>
                  <option value="solo_letras">Solo Letras</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Instrucciones al Cliente</label>
                <textarea
                  rows={2}
                  placeholder="Ej: Enviar USDT mediante red BSC o PayID. Enviar captura."
                  value={instrucciones}
                  onChange={(e) => setInstrucciones(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-glow-red transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar Método de Pago'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
