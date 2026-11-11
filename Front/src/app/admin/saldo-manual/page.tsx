'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getRoleBadge } from '@/lib/utils';

export default function AdminSaldoManualPage() {
  const { user, profile } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Formulario de ajuste
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [monto, setMonto] = useState<string>('5.00');
  const [tipo, setTipo] = useState<'ingreso' | 'descuento_compra' | 'reembolso'>('ingreso');
  const [motivo, setMotivo] = useState<string>('Promoción Navideña');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar usuarios
  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('users')
        .select('id, nombre, email, whatsapp, rol, saldo_actual')
        .order('nombre', { ascending: true });

      // Si el rol es admin, Supabase RLS o un filtro explícito oculta estrictamente al programador
      if (profile?.rol === 'admin') {
        query = query.neq('rol', 'programador');
      }

      const { data, error } = await query;
      if (error) throw error;

      setUsersList(data || []);
      if (data && data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [profile]);

  // Ejecutar ajuste manual
  const handleAjusteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUserId) return;

    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setFeedback({ type: 'error', text: 'Ingresa un monto válido mayor a 0.' });
      return;
    }

    if (!motivo.trim()) {
      setFeedback({ type: 'error', text: 'Indica el motivo del ajuste para el historial de auditoría.' });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      // Llamar al Stored Procedure atómico: ajuste_manual_saldo
      const { data, error } = await supabase.rpc('ajuste_manual_saldo', {
        p_usuario_id: selectedUserId,
        p_monto: numMonto,
        p_es_aumento: tipo !== 'descuento_compra',
        p_descripcion: `${tipo === 'reembolso' ? '[Reembolso] ' : tipo === 'ingreso' ? '[Bonificación] ' : '[Débito] '}${motivo.trim()}`,
      });

      if (error) throw error;

      setFeedback({
        type: 'success',
        text: `¡Ajuste de saldo ejecutado con éxito! Nuevo saldo acreditado en la cuenta del cliente.`,
      });

      await fetchUsers();
    } catch (err: any) {
      console.error('Error al realizar ajuste:', err);
      setFeedback({ type: 'error', text: err.message || 'Error al procesar el ajuste.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.whatsapp && u.whatsapp.includes(search))
  );

  const targetUser = usersList.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
          <span>❄</span> Módulo 6.2: Ajuste Manual de Saldo (Acreditaciones & Reembolsos)
        </div>
        <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
          Ajuste Directo de Billetera
        </h1>
        <p className="text-xs text-ice/70 font-mono mt-1">
          Acredita saldo promocional, bonificaciones a revendedores o genera reembolsos con registro atómico.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-mono flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-neon/15 border border-neon text-pure shadow-[0_0_15px_rgba(0,210,255,0.3)]'
              : 'bg-magenta/15 border border-magenta text-pure shadow-[0_0_15px_rgba(255,0,127,0.3)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{feedback.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-white ml-4">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario de Ajuste (5 COLS) */}
        <div className="lg:col-span-5 cyber-panel rounded-2xl p-6 border-neon/30">
          <h2 className="text-base font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_#FBBF24]" />
            Configurar Operación
          </h2>

          <form onSubmit={handleAjusteSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Usuario Seleccionado:
              </label>
              {targetUser ? (
                <div className="p-3 rounded-xl bg-navy/80 border border-gold/30 text-xs font-mono">
                  <div className="font-bold text-pure">{targetUser.nombre}</div>
                  <div className="text-ice/70">{targetUser.email}</div>
                  <div className="text-gold font-bold mt-1">
                    Saldo Actual: {formatCurrency(targetUser.saldo_actual || 0)}
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-magenta">
                  Selecciona un usuario de la lista de la derecha.
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Tipo de Operación:
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              >
                <option value="ingreso">Regalo / Bonificación (+ Ingreso)</option>
                <option value="reembolso">Reembolso de Pedido (+ Ingreso)</option>
                <option value="descuento_compra">Descuento Administrativo (- Débito)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Monto (USD):
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-1">
                Motivo / Justificación:
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Bonificación navideña por revendedor top"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedUserId}
              className="w-full btn-neon-pill py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50 mt-4"
            >
              {submitting ? 'Procesando Ajuste...' : 'Aplicar Ajuste de Saldo'}
            </button>
          </form>
        </div>

        {/* Buscador y Lista de Usuarios (7 COLS) */}
        <div className="lg:col-span-7 cyber-panel rounded-2xl p-6 border-neon/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-pure flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
              Directorio de Usuarios ({filteredUsers.length})
            </h2>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nombre, correo o WhatsApp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-pitch border border-neon/30 text-pure text-xs font-mono placeholder-ice/40 focus:outline-none focus:border-neon"
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="text-center py-8 text-xs font-mono text-ice">Cargando directorio...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-ice/60">No se encontraron usuarios.</div>
            ) : (
              filteredUsers.map((u) => {
                const isSelected = u.id === selectedUserId;
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    className={`p-3.5 rounded-xl border text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-gold bg-gold/15 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                        : 'border-neon/15 bg-navy/50 hover:border-ice/40 hover:bg-navy/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-pure">{u.nombre}</span>
                        <span className={getRoleBadge(u.rol)}>{u.rol}</span>
                      </div>
                      <div className="text-ice/70 text-[11px]">{u.email}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-ice/50">Saldo</div>
                      <div className="font-bold text-gold text-sm">
                        {formatCurrency(u.saldo_actual || 0)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

