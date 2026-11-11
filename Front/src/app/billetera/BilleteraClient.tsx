'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { PaymentMethod, BalanceRecharge, Transaction } from '@/types/database.types';
import { formatCurrency, formatDate, getOrderStatusBadge } from '@/lib/utils';

export default function BilleteraClient() {
  const router = useRouter();
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();

  // Estados de carga y listas
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [recharges, setRecharges] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Formulario de recarga
  const [monto, setMonto] = useState<string>('5.00');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [referencia, setReferencia] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tab activo: 'recargar' | 'transacciones' | 'historial_recargas'
  const [activeTab, setActiveTab] = useState<'recargar' | 'transacciones' | 'historial_recargas'>('recargar');

  // Redirigir si no está logueado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/billetera');
    }
  }, [user, authLoading, router]);

  // Cargar métodos, recargas y transacciones
  const loadData = async () => {
    if (!user) return;
    try {
      setLoadingData(true);

      // 1. Métodos de pago activos
      const { data: methods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('activo', true)
        .order('nombre_metodo', { ascending: true });

      if (methods) {
        setPaymentMethods(methods);
        if (methods.length > 0 && !selectedMethodId) {
          const firstMethodId = methods[0].id || methods[0].metodo_id || '';
          setSelectedMethodId(firstMethodId);
        }
      }

      // 2. Historial de solicitudes de recarga de saldo
      const { data: recs } = await supabase
        .from('balance_recharges')
        .select('*, payment_methods(nombre_metodo)')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
      if (recs) setRecharges(recs);

      // 3. Historial de transacciones
      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha', { ascending: false });
      if (txs) setTransactions(txs);
    } catch (err) {
      console.error('Error cargando datos de billetera:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Enviar formulario de recarga
  const handleRechargeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const numMonto = parseFloat(monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setMessage({ type: 'error', text: 'Ingresa un monto válido para recargar.' });
      return;
    }

    if (!selectedMethodId) {
      setMessage({ type: 'error', text: 'Selecciona un método de pago.' });
      return;
    }

    if (!referencia.trim()) {
      setMessage({ type: 'error', text: 'Ingresa el número de comprobante o referencia de pago.' });
      return;
    }

    if (!comprobanteFile) {
      setMessage({ type: 'error', text: 'Por favor sube la imagen del comprobante de transferencia.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      // 1. Subir comprobante al bucket 'comprobantes'
      const fileExt = comprobanteFile.name.split('.').pop();
      const filePath = `recargas/${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(filePath, comprobanteFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Error al subir comprobante: ${uploadError.message}`);
      }

      const method = paymentMethods.find((m) => (m.id || m.metodo_id) === selectedMethodId);
      const methodId = method?.id || method?.metodo_id || null;

      // 2. Insertar en balance_recharges respetando el esquema PostgreSQL
      const { error: insertError } = await supabase.from('balance_recharges').insert({
        usuario_id: user.id,
        monto: numMonto,
        metodo_pago_id: methodId,
        referencia_pago: referencia.trim(),
        comprobante_url: filePath,
        estado: 'pendiente',
      });

      if (insertError) throw insertError;

      setMessage({
        type: 'success',
        text: '¡Solicitud de recarga enviada con éxito! La administración validará el comprobante y acreditará tu saldo en minutos.',
      });

      setComprobanteFile(null);
      setReferencia('');
      await loadData();
      await refreshProfile();
    } catch (err: any) {
      console.error('Error al solicitar recarga:', err);
      setMessage({ type: 'error', text: err.message || 'Error al procesar la solicitud.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (!user && loadingData)) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-ice font-mono">
        Cargando Billetera Ciber-Navideña...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-5xl">
      {/* Miga de Pan */}
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6">
        <Link href="/" className="hover:text-neon transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-pure font-bold">Mi Billetera & Saldo</span>
      </nav>

      {/* TARJETA PRINCIPAL DE SALDO DISPONIBLE */}
      <div className="cyber-panel rounded-3xl p-6 md:p-10 mb-8 border-gold/40 shadow-[0_0_25px_rgba(251,191,36,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-mono uppercase tracking-wider mb-3">
              <span>❄</span> Monedero Interno de Compras
            </div>
            <h1 className="text-sm uppercase tracking-widest text-ice/70 font-mono">
              Saldo Disponible para Pedidos Instantáneos
            </h1>
            <div className="text-4xl md:text-5xl font-black text-gold tracking-tight font-mono mt-1 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">
              {formatCurrency(profile?.saldo_actual || 0)}
            </div>
            <p className="text-xs text-ice/70 font-mono mt-2">
              Usuario: <span className="text-pure font-bold">{profile?.nombre}</span> • Rol:{' '}
              <span className="text-neon uppercase">{profile?.rol?.replace('_', ' ')}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('recargar')}
              className="btn-neon-pill px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <span>+</span>
              <span>Recargar Saldo</span>
            </button>
            <Link
              href="/catalogo"
              className="btn-ice-pill px-6 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center"
            >
              Comprar Diamantes
            </Link>
          </div>
        </div>
      </div>

      {/* MENSAJES DE ESTADO */}
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

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex gap-2 mb-8 border-b border-neon/20 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recargar')}
          className={`px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'recargar'
              ? 'btn-neon-pill font-bold'
              : 'text-ice/70 hover:text-white hover:bg-navy/60'
          }`}
        >
          Recargar Saldo
        </button>
        <button
          onClick={() => setActiveTab('transacciones')}
          className={`px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'transacciones'
              ? 'btn-neon-pill font-bold'
              : 'text-ice/70 hover:text-white hover:bg-navy/60'
          }`}
        >
          Historial de Gastos & Movimientos ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('historial_recargas')}
          className={`px-5 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
            activeTab === 'historial_recargas'
              ? 'btn-neon-pill font-bold'
              : 'text-ice/70 hover:text-white hover:bg-navy/60'
          }`}
        >
          Depósitos Enviados ({recharges.length})
        </button>
      </div>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      {activeTab === 'recargar' && (
        <div className="cyber-panel rounded-2xl p-6 md:p-8 border-neon/30">
          <h2 className="text-lg font-bold uppercase tracking-wider text-pure mb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
            Formulario de Depósito para Saldo
          </h2>
          <p className="text-xs font-mono text-ice/70 mb-6">
            Transfiere el monto deseado mediante cualquiera de nuestros canales oficiales, sube la foto del comprobante y tu saldo se acreditará tras la verificación.
          </p>

          <form onSubmit={handleRechargeSubmit} className="space-y-6 max-w-2xl">
            {/* Monto a recargar */}
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-2">
                Monto a Recargar (USD) <span className="text-magenta">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gold font-mono font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-navy/90 border border-neon/30 text-pure font-mono text-sm focus:outline-none focus:border-neon"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {['5.00', '10.00', '20.00', '50.00', '100.00'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMonto(preset)}
                    className="px-3 py-1 rounded-lg bg-navy/60 border border-neon/20 text-xs font-mono text-ice hover:border-neon hover:text-white"
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-2">
                Canal de Transferencia <span className="text-magenta">*</span>
              </label>
              <select
                value={selectedMethodId}
                onChange={(e) => setSelectedMethodId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy/90 border border-neon/30 text-pure font-mono text-sm focus:outline-none focus:border-neon"
              >
                {paymentMethods.map((m) => {
                  const mId = m.id || m.metodo_id || '';
                  return (
                    <option key={mId} value={mId}>
                      {m.nombre_metodo}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Número o código de referencia */}
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-2">
                Número de Referencia / ID de Transacción <span className="text-magenta">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: 9812470129"
                required
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-navy/90 border border-neon/30 text-pure font-mono text-sm focus:outline-none focus:border-neon"
              />
            </div>

            {/* Subir comprobante */}
            <div>
              <label className="block text-xs font-mono uppercase text-ice mb-2">
                Comprobante / Captura de Pantalla <span className="text-magenta">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                className="w-full text-xs font-mono text-ice/80 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-neon/20 file:text-neon hover:file:bg-neon/30 cursor-pointer"
              />
              <p className="text-[11px] font-mono text-ice/50 mt-1">
                Formatos permitidos: JPG, PNG, WEBP. Tamaño máximo 5MB.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-neon-pill px-8 py-3 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Enviando Comprobante...' : 'Enviar Solicitud de Recarga'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'transacciones' && (
        <div className="cyber-panel rounded-2xl p-6 md:p-8 border-neon/30">
          <h2 className="text-lg font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
            Movimientos y Gastos de Saldo
          </h2>

          {transactions.length === 0 ? (
            <p className="text-xs font-mono text-ice/60 py-6 text-center">
              No se registran movimientos en tu cuenta aún.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-neon/20 text-ice/70">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Detalle</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neon/10">
                  {transactions.map((tx) => {
                    const txId = tx.id || tx.transaccion_id;
                    return (
                      <tr key={txId} className="hover:bg-navy/40">
                        <td className="py-3 px-4 text-ice/80">{formatDate(tx.fecha)}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                              tx.tipo === 'ingreso'
                                ? 'bg-neon/15 text-neon border border-neon/30'
                                : tx.tipo === 'descuento_compra'
                                ? 'bg-magenta/15 text-magenta border border-magenta/30'
                                : 'bg-gold/15 text-gold border border-gold/30'
                            }`}
                          >
                            {tx.tipo.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-pure">{tx.descripcion || 'Transacción de billetera'}</td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            tx.tipo === 'ingreso' ? 'text-neon' : 'text-magenta'
                          }`}
                        >
                          {tx.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(tx.monto)}
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

      {activeTab === 'historial_recargas' && (
        <div className="cyber-panel rounded-2xl p-6 md:p-8 border-neon/30">
          <h2 className="text-lg font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_#FBBF24]" />
            Solicitudes de Recarga Enviadas
          </h2>

          {recharges.length === 0 ? (
            <p className="text-xs font-mono text-ice/60 py-6 text-center">
              No tienes solicitudes de recarga enviadas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-neon/20 text-ice/70">
                    <th className="py-3 px-4">Fecha</th>
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neon/10">
                  {recharges.map((rec) => {
                    const recId = rec.id || rec.recarga_id;
                    const recFecha = rec.created_at || rec.fecha;
                    const channelName = rec.payment_methods?.nombre_metodo || (rec.referencia_pago ? `Ref: ${rec.referencia_pago}` : 'Transferencia');

                    return (
                      <tr key={recId} className="hover:bg-navy/40">
                        <td className="py-3 px-4 text-ice/80">{formatDate(recFecha)}</td>
                        <td className="py-3 px-4 text-pure">{channelName}</td>
                        <td className="py-3 px-4 text-gold font-bold">{formatCurrency(rec.monto)}</td>
                        <td className="py-3 px-4">
                          <span className={getOrderStatusBadge(rec.estado)}>
                            {rec.estado}
                          </span>
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
