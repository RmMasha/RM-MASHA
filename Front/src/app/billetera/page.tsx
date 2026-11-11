'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  BalanceRecharge,
  Transaction,
  PaymentMethod,
} from '@/types/database.types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  AlertTriangle,
  History,
  CreditCard,
  PlusCircle,
} from 'lucide-react';

function BilleteraContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'recargar' | 'solicitudes' | 'transacciones'>(
    searchParams.get('accion') === 'recargar' ? 'recargar' : 'recargar'
  );

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [recharges, setRecharges] = useState<BalanceRecharge[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Formulario de recarga
  const [rechargeAmount, setRechargeAmount] = useState<string>('10');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submittingRecharge, setSubmittingRecharge] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadWalletData = useCallback(async (userId: string) => {
    try {
      setLoadingData(true);
      const [methodsRes, rechargesRes, txRes] = await Promise.all([
        supabase.from('payment_methods').select('*').eq('activo', true),
        supabase
          .from('balance_recharges')
          .select('*, payment_methods(*)')
          .eq('usuario_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('transactions')
          .select('*')
          .eq('usuario_id', userId)
          .order('fecha', { ascending: false }),
      ]);

      if (methodsRes.data) {
        setPaymentMethods(methodsRes.data as PaymentMethod[]);
        if (methodsRes.data.length > 0 && !selectedMethodId) {
          setSelectedMethodId(methodsRes.data[0].id);
        }
      }
      if (rechargesRes.data) setRecharges(rechargesRes.data as BalanceRecharge[]);
      if (txRes.data) setTransactions(txRes.data as Transaction[]);
    } catch (err) {
      console.error('Error al cargar datos de billetera:', err);
    } finally {
      setLoadingData(false);
    }
  }, [supabase, selectedMethodId]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/billetera');
      return;
    }
    loadWalletData(user.id);
  }, [user, router, loadWalletData]);

  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    const amountNum = parseFloat(rechargeAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormMsg({ type: 'error', text: 'El monto a recargar debe ser mayor a 0.' });
      return;
    }

    if (!selectedMethodId) {
      setFormMsg({ type: 'error', text: 'Selecciona un método de pago.' });
      return;
    }

    if (!paymentRef.trim()) {
      setFormMsg({ type: 'error', text: 'Ingresa la referencia bancaria o ID de transacción.' });
      return;
    }

    if (!receiptFile) {
      setFormMsg({ type: 'error', text: 'Adjunta la captura del comprobante de transferencia.' });
      return;
    }

    setSubmittingRecharge(true);

    try {
      const fileExt = receiptFile.name.split('.').pop();
      const filePath = `${user!.id}/recarga_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(filePath, receiptFile);

      if (uploadError) {
        throw new Error('Error al subir el comprobante: ' + uploadError.message);
      }

      const { error: insertError } = await supabase.from('balance_recharges').insert({
        usuario_id: user!.id,
        monto: amountNum,
        comprobante_url: filePath,
        metodo_pago_id: selectedMethodId,
        referencia_pago: paymentRef.trim(),
        estado: 'pendiente',
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setFormMsg({
        type: 'success',
        text: '¡Solicitud de recarga enviada con éxito! La acreditaremos apenas verifiquemos tu pago.',
      });
      setReceiptFile(null);
      setPaymentRef('');
      loadWalletData(user!.id);
      refreshProfile();
    } catch (err: any) {
      setFormMsg({ type: 'error', text: err.message || 'Error al procesar la recarga.' });
    } finally {
      setSubmittingRecharge(false);
    }
  };

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* HEADER & BALANCE CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-surface-card to-surface border border-surface-border flex flex-col justify-between glow-border">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-gold">
              Billetera RM & Masha
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Mi Saldo Disponible</h1>
            <p className="text-sm text-slate-400">
              Usa tu saldo para comprar cualquier paquete de diamantes o pases de forma inmediata sin esperar confirmaciones manuales.
            </p>
          </div>

          <div className="pt-6 mt-6 border-t border-surface-border/60 flex items-baseline gap-3">
            <span className="text-4xl sm:text-5xl font-black text-brand-gold tracking-tight">
              {formatCurrency(profile?.saldo_actual ?? 0)}
            </span>
            <span className="text-xs text-slate-400 font-semibold uppercase">USD</span>
          </div>
        </div>

        {/* RECARGA RÁPIDA CTA */}
        <div className="p-8 rounded-3xl bg-surface-card border border-brand-primary/30 flex flex-col justify-between shadow-glow-red/20">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">¿Necesitas saldo?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recarga mediante Binance Pay, Pago Móvil (Bs), Zinli o Zelle. Acreditación rápida y segura.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('recargar')}
            className="w-full mt-6 py-3 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-glow-red transition-all text-sm"
          >
            Nueva Solicitud de Recarga
          </button>
        </div>
      </div>

      {/* TABS DE CONTROL */}
      <div className="flex border-b border-surface-border gap-4 sm:gap-8 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recargar')}
          className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'recargar'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Formulario de Recarga
        </button>

        <button
          onClick={() => setActiveTab('solicitudes')}
          className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'solicitudes'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Mis Solicitudes ({recharges.length})
        </button>

        <button
          onClick={() => setActiveTab('transacciones')}
          className={`pb-3 text-sm font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'transacciones'
              ? 'text-brand-primary border-b-2 border-brand-primary'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          Historial de Movimientos ({transactions.length})
        </button>
      </div>

      {/* CONTENIDO DE PESTAÑAS */}
      {activeTab === 'recargar' && (
        <div className="max-w-2xl bg-surface-card border border-surface-border p-6 sm:p-8 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-2">Solicitar Recarga de Saldo</h2>
          <p className="text-xs text-slate-400 mb-6">
            Transfiere el monto deseado al método de pago seleccionado, ingresa el número de referencia y sube tu comprobante.
          </p>

          <form onSubmit={handleRechargeSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monto a Recargar (USD)
              </label>
              <div className="flex gap-2">
                {['5', '10', '20', '50'].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setRechargeAmount(val)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                      rechargeAmount === val
                        ? 'bg-brand-primary text-white border-brand-primary'
                        : 'bg-surface border-surface-border text-slate-400 hover:text-white'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="Otro monto"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="w-32 px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Método de Pago
              </label>
              <select
                value={selectedMethodId}
                onChange={(e) => setSelectedMethodId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm focus:outline-none focus:border-brand-primary"
              >
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre_metodo}
                  </option>
                ))}
              </select>
            </div>

            {selectedMethod && (
              <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1.5 text-xs text-slate-300">
                <span className="font-bold text-white block">Datos para transferir:</span>
                {selectedMethod.titular && (
                  <p><span className="text-slate-400">Titular:</span> {selectedMethod.titular}</p>
                )}
                {selectedMethod.numero_cuenta_o_dato && (
                  <p className="font-mono text-brand-gold select-all font-bold text-sm">
                    {selectedMethod.numero_cuenta_o_dato}
                  </p>
                )}
                {selectedMethod.instrucciones && (
                  <p className="text-slate-400 italic text-[11px] pt-1">
                    {selectedMethod.instrucciones}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Número de Referencia o ID de Transacción
              </label>
              <input
                type="text"
                required
                placeholder="Ej: 987654321"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Captura del Comprobante (Imagen)
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-surface-hover file:text-slate-200 hover:file:bg-brand-primary hover:file:text-white file:transition-colors cursor-pointer"
              />
            </div>

            {formMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  formMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {formMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{formMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submittingRecharge}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 disabled:opacity-50 transition-all shadow-glow-red flex items-center justify-center gap-2"
            >
              {submittingRecharge ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando comprobante...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Enviar Solicitud de Recarga
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* PESTAÑA: SOLICITUDES DE RECARGA */}
      {activeTab === 'solicitudes' && (
        <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-surface-border flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Tus Solicitudes de Depósito</h3>
            <span className="text-xs text-slate-400">{recharges.length} solicitudes registradas</span>
          </div>

          {recharges.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No tienes solicitudes de recarga previas.
            </div>
          ) : (
            <div className="divide-y divide-surface-border overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-surface/80 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Fecha</th>
                    <th className="px-6 py-3 font-semibold">Método</th>
                    <th className="px-6 py-3 font-semibold">Referencia</th>
                    <th className="px-6 py-3 font-semibold">Monto</th>
                    <th className="px-6 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {recharges.map((rec) => (
                    <tr key={rec.id} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {formatDate(rec.created_at)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                        {rec.payment_methods?.nombre_metodo || 'Método Directo'}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300 whitespace-nowrap">
                        {rec.referencia_pago || 'S/R'}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-brand-gold whitespace-nowrap">
                        +{formatCurrency(rec.monto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rec.estado === 'pendiente' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            En Revisión
                          </span>
                        )}
                        {rec.estado === 'aprobada' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Aprobada
                          </span>
                        )}
                        {rec.estado === 'rechazada' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30" title={rec.motivo_rechazo || ''}>
                            <XCircle className="w-3 h-3" />
                            Rechazada
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA: HISTORIAL DE TRANSACCIONES */}
      {activeTab === 'transacciones' && (
        <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-surface-border flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Auditoría de Movimientos Financieros</h3>
            <span className="text-xs text-slate-400">{transactions.length} movimientos</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              Aún no tienes movimientos de saldo registrados.
            </div>
          ) : (
            <div className="divide-y divide-surface-border overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-surface/80 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Fecha</th>
                    <th className="px-6 py-3 font-semibold">Descripción</th>
                    <th className="px-6 py-3 font-semibold">Tipo</th>
                    <th className="px-6 py-3 font-semibold">Monto</th>
                    <th className="px-6 py-3 font-semibold">Saldo Resultante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {transactions.map((tx) => {
                    const isIncome = tx.tipo === 'ingreso' || (tx.tipo === 'ajuste_manual' && tx.monto > 0);
                    return (
                      <tr key={tx.id} className="hover:bg-surface-hover/30 transition-colors">
                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                          {formatDate(tx.fecha)}
                        </td>
                        <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                          {tx.descripcion}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface text-slate-300 border border-slate-700 capitalize">
                            {tx.tipo.replace('_', ' ')}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-bold whitespace-nowrap ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.monto)}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-300 whitespace-nowrap">
                          {formatCurrency(tx.saldo_posterior)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BilleteraPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-slate-400 text-sm">Cargando Billetera...</div>}>
      <BilleteraContent />
    </Suspense>
  );
}
