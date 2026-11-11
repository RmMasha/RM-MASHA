'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BalanceRecharge, RechargeStatus } from '@/types/database.types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  AlertTriangle,
  Wallet,
} from 'lucide-react';

export default function AdminRecargasPage() {
  const supabase = createClient();

  const [filterStatus, setFilterStatus] = useState<RechargeStatus>('pendiente');
  const [recharges, setRecharges] = useState<BalanceRecharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Visor de Comprobante
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // Modal Rechazo
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRecharges = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('balance_recharges')
        .select('*, users(nombre, email, whatsapp, saldo_actual), payment_methods(*)')
        .eq('estado', filterStatus)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setRecharges(data as BalanceRecharge[]);
      }
    } catch (err) {
      console.error('Error al cargar recargas:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, filterStatus]);

  useEffect(() => {
    loadRecharges();
  }, [loadRecharges]);

  // APROBAR RECARGA (Llama al RPC de Postgres para suma atómica y notificación)
  const handleApproveRecharge = async (recargaId: string) => {
    if (!confirm('¿Confirmas que recibiste los fondos y deseas acreditar el saldo a este usuario?')) {
      return;
    }

    setActionLoading(recargaId);
    try {
      const { data, error } = await supabase.rpc('aprobar_recarga_saldo', {
        p_recarga_id: recargaId,
      });

      if (error) throw error;

      alert(`¡Saldo acreditado con éxito! Nuevo saldo del usuario: ${formatCurrency(data.nuevo_saldo)}.`);
      loadRecharges();
    } catch (err: any) {
      alert('Error al aprobar recarga: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // RECHAZAR RECARGA (Llama al RPC con motivo)
  const handleRejectRecharge = async () => {
    if (!rejectingId) return;
    setActionLoading(rejectingId);

    try {
      const { error } = await supabase.rpc('rechazar_recarga_saldo', {
        p_recarga_id: rejectingId,
        p_motivo: rejectReason.trim() || 'Comprobante bancario no válido o fondos no recibidos.',
      });

      if (error) throw error;

      setRejectingId(null);
      setRejectReason('');
      loadRecharges();
    } catch (err: any) {
      alert('Error al rechazar recarga: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Gestión de Recargas de Saldo</h2>
        <p className="text-xs text-slate-400">
          Revisa y valida los comprobantes de depósito para acreditar saldo en las billeteras de los usuarios.
        </p>
      </div>

      {/* FILTROS */}
      <div className="flex border-b border-surface-border gap-4">
        <button
          onClick={() => setFilterStatus('pendiente')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
            filterStatus === 'pendiente'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pendientes de Aprobación
        </button>

        <button
          onClick={() => setFilterStatus('aprobada')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
            filterStatus === 'aprobada'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Aprobadas
        </button>

        <button
          onClick={() => setFilterStatus('rechazada')}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
            filterStatus === 'rechazada'
              ? 'text-rose-400 border-b-2 border-rose-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Rechazadas
        </button>
      </div>

      {/* TABLA DE RECARGAS */}
      <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            Cargando solicitudes de recarga...
          </div>
        ) : recharges.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No hay recargas con este estado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 font-semibold">Usuario</th>
                  <th className="px-5 py-3 font-semibold">Método / Ref</th>
                  <th className="px-5 py-3 font-semibold">Monto Solicitado</th>
                  <th className="px-5 py-3 font-semibold">Saldo Actual</th>
                  <th className="px-5 py-3 font-semibold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {recharges.map((rec) => {
                  const isActioning = actionLoading === rec.id;
                  return (
                    <tr key={rec.id} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap text-slate-400">
                        {formatDate(rec.created_at)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-white block">
                          {rec.users?.nombre || 'Usuario'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {rec.users?.whatsapp || rec.users?.email}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-200 block">
                          {rec.payment_methods?.nombre_metodo || 'Método Directo'}
                        </span>
                        <span className="font-mono text-[10px] text-brand-gold select-all block">
                          Ref: {rec.referencia_pago || 'S/R'}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            const { data } = await supabase.storage
                              .from('comprobantes')
                              .createSignedUrl(rec.comprobante_url, 300);
                            if (data?.signedUrl) setViewReceiptUrl(data.signedUrl);
                          }}
                          className="text-[10px] text-brand-primary underline flex items-center gap-1 mt-0.5 hover:text-white"
                        >
                          <Eye className="w-3 h-3" />
                          Ver Captura
                        </button>
                      </td>

                      <td className="px-5 py-4 font-black text-brand-gold whitespace-nowrap text-sm">
                        +{formatCurrency(rec.monto)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-300 whitespace-nowrap">
                        {formatCurrency(rec.users?.saldo_actual ?? 0)}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {rec.estado === 'pendiente' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              disabled={isActioning}
                              onClick={() => handleApproveRecharge(rec.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-bold text-xs flex items-center gap-1 shadow-glow-gold/10"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Aprobar y Sumar Saldo
                            </button>
                            <button
                              disabled={isActioning}
                              onClick={() => {
                                setRejectingId(rec.id);
                                setRejectReason('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-bold text-xs flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Rechazar
                            </button>
                          </div>
                        ) : rec.estado === 'aprobada' ? (
                          <span className="text-xs text-emerald-400 font-bold">
                            ✓ Saldo Acreditado
                          </span>
                        ) : (
                          <span className="text-xs text-rose-400 font-bold" title={rec.motivo_rechazo || ''}>
                            Rechazada
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL VER COMPROBANTE */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-surface-card border border-surface-border rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Comprobante de Depósito</h3>
              <button
                onClick={() => setViewReceiptUrl(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2">
              <img
                src={viewReceiptUrl}
                alt="Comprobante"
                className="max-w-full max-h-[60vh] object-contain rounded-xl"
              />
            </div>
            <button
              onClick={() => setViewReceiptUrl(null)}
              className="w-full py-2.5 rounded-xl bg-surface-hover hover:bg-surface-border text-white text-xs font-bold transition-colors"
            >
              Cerrar Visor
            </button>
          </div>
        </div>
      )}

      {/* MODAL RECHAZAR RECARGA */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-rose-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Rechazar Solicitud de Recarga</h3>
            </div>
            <p className="text-xs text-slate-400">
              Indica la razón por la que no se aprueba esta recarga. El cliente recibirá este aviso en su cuenta.
            </p>
            <textarea
              rows={3}
              required
              placeholder="Ej: El dinero no ha caído en la cuenta receptora o la captura es ilegible."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRejectRecharge}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
