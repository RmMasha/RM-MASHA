'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile } from '@/types/database.types';
import { formatCurrency, getRoleBadgeColor } from '@/lib/utils';
import { DollarSign, Search, CheckCircle, AlertTriangle, Loader2, User } from 'lucide-react';

export default function AdminSaldoManualPage() {
  const supabase = createClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Formulario de Ajuste
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('5');
  const [isIncrease, setIsIncrease] = useState<boolean>(true); // true = sumar, false = descontar
  const [reason, setReason] = useState<string>('Bonificación promocional');
  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const searchUsers = async (term: string) => {
    setLoadingUsers(true);
    try {
      let query = supabase.from('users').select('*').limit(10);
      if (term.trim()) {
        query = query.or(`email.ilike.%${term}%,nombre.ilike.%${term}%,whatsapp.ilike.%${term}%`);
      }
      const { data, error } = await query;
      if (data && !error) {
        setUsers(data as UserProfile[]);
      }
    } catch (err) {
      console.error('Error buscando usuarios:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    searchUsers('');
  }, []);

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setResultMsg(null);

    const amountNum = parseFloat(adjustmentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setResultMsg({ type: 'error', text: 'El monto debe ser un valor positivo mayor a 0.' });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('ajuste_manual_saldo', {
        p_usuario_id: selectedUser.id,
        p_monto: amountNum,
        p_es_aumento: isIncrease,
        p_descripcion: reason.trim() || 'Ajuste manual de saldo administrativo',
      });

      if (error) throw error;

      setResultMsg({
        type: 'success',
        text: `¡Ajuste aplicado exitosamente! Nuevo saldo de ${selectedUser.nombre}: ${formatCurrency(
          data.nuevo_saldo
        )}.`,
      });

      // Actualizar usuario seleccionado
      setSelectedUser({
        ...selectedUser,
        saldo_actual: data.nuevo_saldo,
      });

      searchUsers(searchTerm);
    } catch (err: any) {
      setResultMsg({ type: 'error', text: err.message || 'Error al aplicar el ajuste de saldo.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Ajuste Manual de Saldo</h2>
        <p className="text-xs text-slate-400">
          Acredita saldo promocional o descuenta por reembolsos directamente en la billetera de cualquier cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* BUSCADOR DE USUARIOS (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-brand-primary" />
              1. Seleccionar Usuario
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por nombre, correo o WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchUsers(searchTerm)}
                className="w-full px-4 py-2 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
              />
              <button
                type="button"
                onClick={() => searchUsers(searchTerm)}
                className="px-4 py-2 rounded-xl bg-surface-hover hover:bg-surface-border text-white text-xs font-bold transition-colors"
              >
                Buscar
              </button>
            </div>

            <div className="divide-y divide-surface-border max-h-96 overflow-y-auto">
              {loadingUsers ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Buscando usuarios...
                </div>
              ) : users.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No se encontraron usuarios.
                </div>
              ) : (
                users.map((u) => {
                  const isSelected = selectedUser?.id === u.id;
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setResultMsg(null);
                      }}
                      className={`w-full p-3 text-left transition-all flex items-center justify-between rounded-xl my-1 ${
                        isSelected
                          ? 'bg-brand-primary/10 border border-brand-primary'
                          : 'hover:bg-surface-hover/50'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{u.nombre}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                        <span
                          className={`inline-block text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border mt-1 ${getRoleBadgeColor(
                            u.rol
                          )}`}
                        >
                          {u.rol}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Saldo Actual:</span>
                        <span className="text-xs font-black text-brand-gold">
                          {formatCurrency(u.saldo_actual)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* FORMULARIO DE ACCIÓN (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-gold" />
              2. Aplicar Ajuste Financiero
            </h3>

            {!selectedUser ? (
              <div className="p-12 text-center text-slate-400 text-xs border border-dashed border-surface-border rounded-2xl">
                Selecciona primero un usuario del listado para modificar su saldo.
              </div>
            ) : (
              <form onSubmit={handleApplyAdjustment} className="space-y-4">
                <div className="p-3 rounded-xl bg-surface border border-surface-border text-xs flex justify-between items-center">
                  <div>
                    <span className="text-slate-400 block">Usuario seleccionado:</span>
                    <strong className="text-white">{selectedUser.nombre}</strong> ({selectedUser.email})
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">Saldo disponible:</span>
                    <strong className="text-brand-gold text-sm">{formatCurrency(selectedUser.saldo_actual)}</strong>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tipo de Operación
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsIncrease(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        isIncrease
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-glow-gold/10'
                          : 'bg-surface border-surface-border text-slate-400 hover:text-white'
                      }`}
                    >
                      + Sumar Saldo (Regalo / Bono)
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsIncrease(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        !isIncrease
                          ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-glow-red/10'
                          : 'bg-surface border-surface-border text-slate-400 hover:text-white'
                      }`}
                    >
                      - Descontar Saldo (Reembolso)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Monto (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Motivo / Descripción de la Transacción
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Bonificación por torneo / Ajuste de soporte"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {resultMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      resultMsg.type === 'success'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {resultMsg.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{resultMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-glow-red transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando Ajuste...
                    </>
                  ) : (
                    'Confirmar y Aplicar Ajuste'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
