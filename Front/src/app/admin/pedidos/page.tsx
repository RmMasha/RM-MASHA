'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { formatDate, getOrderStatusBadge } from '@/lib/utils';

export default function AdminPedidosPage() {
  const [activeTab, setActiveTab] = useState<'nuevo' | 'confirmado' | 'entregado' | 'rechazado'>('nuevo');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // Modal para ver comprobante
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Cargar pedidos según pestaña y página
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabase
        .from('orders')
        .select('*, users(id, nombre, email, whatsapp, rol), variants(nombre, products(nombre))', { count: 'exact' })
        .eq('estado', activeTab)
        .order('fecha_creacion', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setOrders(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, page]);

  // Cambiar de estado un pedido y disparar notificación
  const handleUpdateStatus = async (pedidoId: string, nuevoEstado: 'confirmado' | 'entregado' | 'rechazado', usuarioId: string, motivo?: string) => {
    try {
      setActionLoading(pedidoId);

      // 1. Actualizar estado del pedido
      const { error: updateError } = await supabase
        .from('orders')
        .update({ estado: nuevoEstado })
        .eq('id', pedidoId);

      if (updateError) throw updateError;

      // 2. Disparar notificación push al cliente
      let mensaje = '';
      if (nuevoEstado === 'confirmado') {
        mensaje = `Tu pedido #${pedidoId.slice(0, 8)} ha sido confirmado y está en cola de acreditación.`;
      } else if (nuevoEstado === 'entregado') {
        mensaje = `¡Tus diamantes o servicio del pedido #${pedidoId.slice(0, 8)} han sido entregados con éxito! Revisa tu cuenta de Free Fire.`;
      } else if (nuevoEstado === 'rechazado') {
        mensaje = `Tu pedido #${pedidoId.slice(0, 8)} fue rechazado. Motivo: ${motivo || 'Comprobante no válido'}.`;
      }

      await supabase.from('notifications').insert({
        usuario_id: usuarioId,
        mensaje,
        tipo: nuevoEstado === 'rechazado' ? 'rechazo' : 'pedido',
        leido: false,
      });

      await fetchOrders();
    } catch (err: any) {
      console.error('Error actualizando pedido:', err);
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Obtener URL firmada temporal para comprobante privado
  const handleViewReceipt = async (comprobantePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('comprobantes')
        .createSignedUrl(comprobantePath, 300); // 5 minutos de validez

      if (error) throw error;
      if (data?.signedUrl) {
        setPreviewImageUrl(data.signedUrl);
      }
    } catch (err: any) {
      alert('No se pudo cargar el comprobante: ' + err.message);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Cabecera del Gestor */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/15 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-2">
            <span>❄</span> Módulo 6.6: Gestor de Pedidos (Paginación 10 en 10)
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Control de Pedidos
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Revisión de pagos directos, aprobación y confirmación de entrega de diamantes.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="btn-ice-pill px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <span>↻</span> Actualizar Lista
        </button>
      </div>

      {/* Pestañas de Estado de Pedidos */}
      <div className="flex gap-2 border-b border-neon/20 pb-2 overflow-x-auto">
        {(['nuevo', 'confirmado', 'entregado', 'rechazado'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'btn-neon-pill font-bold shadow-neon'
                : 'text-ice/70 hover:text-white hover:bg-navy/60'
            }`}
          >
            {tab === 'nuevo'
              ? 'Nuevos (Pago Directo)'
              : tab === 'confirmado'
              ? 'Confirmados (En Proceso)'
              : tab === 'entregado'
              ? 'Entregados (Historial)'
              : 'Rechazados'}
          </button>
        ))}
      </div>

      {/* Tabla de Pedidos */}
      <div className="cyber-panel rounded-2xl overflow-hidden border-neon/30">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-ice">
            Cargando pedidos de la base de datos...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-ice/60">
            No hay pedidos en la pestaña "{activeTab}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neon/20 text-ice/70 bg-pitch/80">
                  <th className="py-3.5 px-4">ID Pedido</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Producto & Variante</th>
                  <th className="py-3.5 px-4">Datos Requeridos (UID)</th>
                  <th className="py-3.5 px-4">Método / Comprobante</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon/10">
                {orders.map((o) => {
                  const reqJson = o.datos_requeridos_json || {};
                  const orderId = o.id || o.pedido_id;
                  const orderCode = o.codigo_pedido || ('#' + orderId.slice(0, 8));
                  const orderFecha = o.created_at || o.fecha_creacion;
                  return (
                    <tr key={orderId} className="hover:bg-navy/40 transition-colors">
                      <td className="py-3.5 px-4 text-neon font-bold">
                        {orderCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-pure font-bold">{o.users?.nombre || 'Usuario'}</div>
                        <div className="text-[11px] text-ice/60">{o.users?.email}</div>
                        <div className="text-[10px] text-ice/50">WhatsApp: {o.users?.whatsapp || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-pure font-bold">{o.variants?.products?.nombre}</div>
                        <div className="text-[11px] text-gold">{o.variants?.nombre}</div>
                      </td>
                      <td className="py-3.5 px-4 text-ice/90">
                        {Object.entries(reqJson)
                          .filter(([k]) => k !== 'referencia')
                          .map(([k, v]) => (
                            <div key={k}>
                              <span className="text-ice/50">{k}:</span> {String(v)}
                            </div>
                          ))}
                        {reqJson.referencia && (
                          <div className="text-[10px] text-neon mt-1">
                            Ref: {reqJson.referencia}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-pure">{o.metodo_pago}</div>
                        {o.comprobante_url ? (
                          <button
                            type="button"
                            onClick={() => handleViewReceipt(o.comprobante_url)}
                            className="mt-1 text-[11px] text-neon hover:text-white underline cursor-pointer"
                          >
                            Ver Comprobante 🔍
                          </button>
                        ) : (
                          <span className="text-[10px] text-gold font-bold">
                            ⚡ Pagado con Saldo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-ice/70">
                        {formatDate(orderFecha)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {activeTab === 'nuevo' && (
                            <>
                              <button
                                disabled={actionLoading === orderId}
                                onClick={() => handleUpdateStatus(orderId, 'confirmado', o.usuario_id)}
                                className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase bg-neon/20 border border-neon text-neon hover:bg-neon hover:text-white transition-all disabled:opacity-50"
                              >
                                Confirmar
                              </button>
                              <button
                                disabled={actionLoading === orderId}
                                onClick={() => {
                                  const motivo = prompt('Ingresa el motivo del rechazo para notificar al cliente:');
                                  if (motivo) {
                                    handleUpdateStatus(orderId, 'rechazado', o.usuario_id, motivo);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase bg-magenta/20 border border-magenta text-magenta hover:bg-magenta hover:text-white transition-all disabled:opacity-50"
                              >
                                Rechazar
                              </button>
                            </>
                          )}

                          {activeTab === 'confirmado' && (
                            <button
                              disabled={actionLoading === orderId}
                              onClick={() => handleUpdateStatus(orderId, 'entregado', o.usuario_id)}
                              className="btn-neon-pill px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider disabled:opacity-50"
                            >
                              ✓ Servicio Entregado
                            </button>
                          )}

                          {activeTab === 'entregado' && (
                            <span className="text-neon text-[11px] font-bold">
                              ✓ Completado
                            </span>
                          )}

                          {activeTab === 'rechazado' && (
                            <span className="text-magenta text-[11px] font-bold">
                              ✕ Rechazado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación 10 en 10 */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-neon/20 flex items-center justify-between text-xs font-mono">
            <span className="text-ice/70">
              Página {page} de {totalPages} ({totalCount} pedidos en total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-navy/80 border border-neon/30 text-pure hover:border-neon disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-navy/80 border border-neon/30 text-pure hover:border-neon disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Visualizar Comprobante de Pago */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="cyber-panel p-6 rounded-2xl max-w-2xl w-full border-neon shadow-neon">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-pure">
                Comprobante de Pago
              </h3>
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="text-pure hover:text-magenta font-bold text-xl"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl bg-pitch p-2 flex items-center justify-center">
              <img
                src={previewImageUrl}
                alt="Comprobante"
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="btn-ice-pill px-5 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

