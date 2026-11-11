'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderStatus } from '@/types/database.types';
import { formatCurrency, formatDate, getOrderStatusBadge } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';

export default function AdminPedidosPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<OrderStatus>('nuevo');
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal para ver comprobante
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // Modal para rechazar pedido
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabase
        .from('orders')
        .select('*, users(nombre, email, whatsapp), variants(*, products(*))', {
          count: 'exact',
        })
        .eq('estado', activeTab)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data && !error) {
        setOrders(data as Order[]);
        setTotalCount(count || 0);
      }
    } catch (err) {
      console.error('Error al cargar pedidos en admin:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, activeTab, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Cambiar estado a 'confirmado' (aprobación de pago directo)
  const handleConfirmOrder = async (orderId: string, usuarioId: string, codigoPedido: string) => {
    setActionLoading(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          estado: 'confirmado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // Disparar notificación push al usuario
      await supabase.from('notifications').insert({
        usuario_id: usuarioId,
        mensaje: `¡Tu comprobante para el pedido ${codigoPedido} fue validado con éxito! Tu servicio está en cola de entrega.`,
        tipo: 'pedido',
        enlace: '/ordenes',
      });

      loadOrders();
    } catch (err: any) {
      alert('Error al confirmar pedido: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Cambiar estado a 'entregado' ("Servicio Entregado")
  const handleMarkDelivered = async (orderId: string, usuarioId: string, codigoPedido: string) => {
    setActionLoading(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          estado: 'entregado',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      // Disparar notificación push al cliente
      await supabase.from('notifications').insert({
        usuario_id: usuarioId,
        mensaje: `🎉 ¡Tus diamantes del pedido ${codigoPedido} han sido entregados con éxito en tu cuenta de juego! Gracias por tu preferencia.`,
        tipo: 'pedido',
        enlace: '/ordenes',
      });

      loadOrders();
    } catch (err: any) {
      alert('Error al marcar pedido como entregado: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Rechazar pedido
  const handleRejectOrder = async () => {
    if (!rejectingOrderId) return;
    setActionLoading(rejectingOrderId);

    try {
      const targetOrder = orders.find((o) => o.id === rejectingOrderId);

      const { error } = await supabase
        .from('orders')
        .update({
          estado: 'rechazado',
          motivo_rechazo: rejectReason.trim() || 'Comprobante no válido o datos incorrectos.',
          updated_at: new Date().toISOString(),
        })
        .eq('id', rejectingOrderId);

      if (error) throw error;

      if (targetOrder?.usuario_id) {
        await supabase.from('notifications').insert({
          usuario_id: targetOrder.usuario_id,
          mensaje: `Tu pedido ${targetOrder.codigo_pedido} fue rechazado. Motivo: ${
            rejectReason.trim() || 'Comprobante no válido'
          }`,
          tipo: 'rechazo',
          enlace: '/ordenes',
        });
      }

      setRejectingOrderId(null);
      setRejectReason('');
      loadOrders();
    } catch (err: any) {
      alert('Error al rechazar pedido: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* HEADER DE SECCIÓN */}
      <div>
        <h2 className="text-xl font-black text-white">Gestor de Pedidos de Clientes</h2>
        <p className="text-xs text-slate-400">
          Supervisa los pedidos por pago directo, confirma entregas y revisa el historial con paginación de 10 en 10.
        </p>
      </div>

      {/* TABS DE ESTADOS */}
      <div className="flex border-b border-surface-border gap-4 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('nuevo');
            setPage(1);
          }}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'nuevo'
              ? 'text-yellow-400 border-b-2 border-yellow-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Nuevos (Pago Directo)
        </button>

        <button
          onClick={() => {
            setActiveTab('confirmado');
            setPage(1);
          }}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'confirmado'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          Confirmados (Por Entregar)
        </button>

        <button
          onClick={() => {
            setActiveTab('entregado');
            setPage(1);
          }}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'entregado'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Entregados (Auditoría)
        </button>

        <button
          onClick={() => {
            setActiveTab('rechazado');
            setPage(1);
          }}
          className={`pb-3 text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'rechazado'
              ? 'text-rose-400 border-b-2 border-rose-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Rechazados
        </button>
      </div>

      {/* TABLA DE PEDIDOS */}
      <div className="bg-surface-card border border-surface-border rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            Cargando pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No se encontraron pedidos en esta categoría.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Código</th>
                  <th className="px-5 py-3 font-semibold">Cliente</th>
                  <th className="px-5 py-3 font-semibold">Producto / Variante</th>
                  <th className="px-5 py-3 font-semibold">Datos Requeridos (ID)</th>
                  <th className="px-5 py-3 font-semibold">Método / Ref</th>
                  <th className="px-5 py-3 font-semibold">Total</th>
                  <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {orders.map((ord) => {
                  const productName = ord.variants?.products?.nombre || 'Producto';
                  const variantName = ord.variants?.nombre || 'Variante';
                  const isActioning = actionLoading === ord.id;

                  return (
                    <tr key={ord.id} className="hover:bg-surface-hover/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-white text-xs block">
                          {ord.codigo_pedido}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {formatDate(ord.created_at)}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-white block">
                          {ord.users?.nombre || 'Usuario'}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {ord.users?.whatsapp || ord.users?.email}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-200 block">
                          {productName}
                        </span>
                        <span className="text-[10px] text-brand-gold">
                          {variantName}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          {Object.entries(ord.datos_requeridos_json || {}).map(([k, v]) => (
                            <div key={k} className="text-[11px]">
                              <span className="text-slate-400 capitalize">{k}: </span>
                              <span className="font-mono text-brand-cyan font-bold select-all">
                                {v}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-medium text-slate-300 block">
                          {ord.metodo_pago}
                        </span>
                        {ord.referencia_pago && (
                          <span className="font-mono text-[10px] text-slate-400 select-all">
                            Ref: {ord.referencia_pago}
                          </span>
                        )}
                        {ord.comprobante_url && (
                          <button
                            type="button"
                            onClick={async () => {
                              const { data } = await supabase.storage
                                .from('comprobantes')
                                .createSignedUrl(ord.comprobante_url!, 300);
                              if (data?.signedUrl) {
                                setViewReceiptUrl(data.signedUrl);
                              }
                            }}
                            className="text-[10px] text-brand-primary underline flex items-center gap-1 mt-0.5 hover:text-white"
                          >
                            <Eye className="w-3 h-3" />
                            Ver Captura
                          </button>
                        )}
                      </td>

                      <td className="px-5 py-4 font-black text-brand-gold whitespace-nowrap text-sm">
                        {formatCurrency(ord.total)}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {ord.estado === 'nuevo' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={isActioning}
                              onClick={() =>
                                handleConfirmOrder(ord.id, ord.usuario_id, ord.codigo_pedido)
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 font-bold text-xs flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Confirmar
                            </button>
                            <button
                              disabled={isActioning}
                              onClick={() => {
                                setRejectingOrderId(ord.id);
                                setRejectReason('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 font-bold text-xs flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Rechazar
                            </button>
                          </div>
                        )}

                        {ord.estado === 'confirmado' && (
                          <button
                            disabled={isActioning}
                            onClick={() =>
                              handleMarkDelivered(ord.id, ord.usuario_id, ord.codigo_pedido)
                            }
                            className="px-3 py-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs flex items-center gap-1.5 shadow-glow-red ml-auto"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            Servicio Entregado
                          </button>
                        )}

                        {ord.estado === 'entregado' && (
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            ✓ Entregado
                          </span>
                        )}

                        {ord.estado === 'rechazado' && (
                          <span className="text-[11px] text-rose-400 font-semibold" title={ord.motivo_rechazo || ''}>
                            Rechazado
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

        {/* PAGINACIÓN OBLIGATORIA DE 10 EN 10 */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between text-xs text-slate-400 bg-surface/40">
          <span>
            Mostrando {orders.length} de {totalCount} pedidos (Página {page} de {totalPages})
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-surface border border-surface-border disabled:opacity-30 hover:bg-surface-hover text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-white">{page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg bg-surface border border-surface-border disabled:opacity-30 hover:bg-surface-hover text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: VER COMPROBANTE DE PAGO */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full bg-surface-card border border-surface-border rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Comprobante de Pago</h3>
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

      {/* MODAL: MOTIVO DE RECHAZO */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-rose-500/30 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Rechazar Pedido</h3>
            </div>
            <p className="text-xs text-slate-400">
              Ingresa el motivo del rechazo. Este mensaje será notificado inmediatamente al cliente.
            </p>
            <textarea
              rows={3}
              required
              placeholder="Ej: La referencia de pago no coincide con nuestros registros bancarios."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRejectOrder}
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
