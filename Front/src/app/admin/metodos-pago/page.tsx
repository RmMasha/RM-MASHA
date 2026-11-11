'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { PaymentMethod } from '@/types/database.types';

export default function AdminMetodosPagoPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario de creación
  const [nombre, setNombre] = useState('');
  const [formato, setFormato] = useState<'solo_numeros' | 'solo_letras' | 'alfanumerico'>('solo_numeros');
  const [submitting, setSubmitting] = useState(false);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('nombre_metodo', { ascending: true });
      if (error) throw error;
      setMethods(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  // Alternar estado activo/inactivo
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ activo: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await fetchMethods();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  // Crear nuevo método
  const handleCreateMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      setSubmitting(true);
      const { error } = await supabase.from('payment_methods').insert({
        nombre_metodo: nombre.trim(),
        formato_requerido: formato,
        activo: true,
      });

      if (error) throw error;
      setNombre('');
      await fetchMethods();
    } catch (err: any) {
      alert('Error creando método: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
          <span>❄</span> Módulo 6.4: Canales de Pago & Validación de Referencias
        </div>
        <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
          Métodos de Pago y Depósito
        </h1>
        <p className="text-xs text-ice/70 font-mono mt-1">
          Habilita o deshabilita pasarelas (Binance, Pago Móvil, etc.) y especifica reglas de validación para la referencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario de Alta (5 COLS) */}
        <div className="lg:col-span-5 cyber-panel rounded-2xl p-6 border-neon/30">
          <h2 className="text-base font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
            Nuevo Canal de Pago
          </h2>

          <form onSubmit={handleCreateMethod} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Nombre del Canal / Banco:
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Binance Pay (USDT)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Formato de Referencia Requerido:
              </label>
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              >
                <option value="solo_numeros">Solo Números (Ej: Pago Móvil / Depósito)</option>
                <option value="alfanumerico">Alfanumérico (Ej: Binance TxID / Hash)</option>
                <option value="solo_letras">Solo Letras</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-neon-pill py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 mt-2"
            >
              {submitting ? 'Guardando...' : '+ Agregar Método de Pago'}
            </button>
          </form>
        </div>

        {/* Lista de Métodos (7 COLS) */}
        <div className="lg:col-span-7 cyber-panel rounded-2xl p-6 border-neon/30">
          <h2 className="text-base font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_#FBBF24]" />
            Canales Configurados ({methods.length})
          </h2>

          {loading ? (
            <div className="text-center py-8 text-xs font-mono text-ice">Cargando métodos...</div>
          ) : methods.length === 0 ? (
            <div className="text-center py-8 text-xs font-mono text-ice/60">No hay métodos registrados.</div>
          ) : (
            <div className="space-y-3">
              {methods.map((m) => {
                const methodId = m.id || m.metodo_id || '';
                return (
                  <div
                    key={methodId}
                    className="p-4 rounded-xl bg-navy/60 border border-neon/20 flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-pure text-sm">{m.nombre_metodo}</h3>
                      <div className="text-[11px] font-mono text-ice/70 flex items-center gap-2 mt-0.5">
                        <span>Validación:</span>
                        <span className="text-neon">{m.formato_requerido}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold ${
                          m.activo
                            ? 'bg-neon/15 text-neon border border-neon/30'
                            : 'bg-magenta/15 text-magenta border border-magenta/30'
                        }`}
                      >
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        onClick={() => handleToggleActive(methodId, m.activo)}
                        className="btn-ice-pill px-3 py-1 text-[11px] font-mono uppercase"
                      >
                        {m.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

