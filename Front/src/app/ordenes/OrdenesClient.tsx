'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Order } from '@/types/database.types';
import { formatDate, getOrderStatusBadge } from '@/lib/utils';

export default function OrdenesClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/ordenes');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*, variants(nombre, products(nombre))')
          .eq('usuario_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setOrders(data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (authLoading || (!user && loading)) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-ice font-mono">
        Cargando tus pedidos...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-5xl">
      {/* Miga de Pan */}
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6">
        <Link href="/" className="hover:text-neon transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-pure font-bold">Mis Pedidos</span>
      </nav>

      <div className="cyber-panel rounded-3xl p-6 md:p-8 mb-8 border-neon/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-xs font-mono uppercase tracking-wider mb-2">
              <span>❄</span> Historial de Compras
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-pure uppercase tracking-wider">
              Mis Pedidos Registrados
            </h1>
            <p className="text-xs text-ice/70 font-mono mt-1">
              Rastrea en tiempo real el estado de acreditación de tus diamantes y servicios.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="btn-neon-pill px-6 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
          >
            Nueva Recarga +
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-ice">
          Cargando pedidos...
        </div>
      ) : orders.length === 0 ? (
        <div className="cyber-panel rounded-2xl p-12 text-center border-neon/20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy border border-neon/30 flex items-center justify-center text-2xl">
            📦
          </div>
          <h3 className="text-base font-bold uppercase tracking-wider text-pure mb-2">
            No tienes pedidos activos
          </h3>
          <p className="text-xs font-mono text-ice/70 mb-6 max-w-md mx-auto">
            Aún no has realizado ninguna compra en la plataforma. Explora nuestro catálogo y aprovecha los precios de temporada navideña.
          </p>
          <Link
            href="/catalogo"
            className="btn-neon-pill px-6 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="cyber-panel rounded-2xl overflow-hidden border-neon/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neon/20 text-ice/70 bg-navy/60">
                  <th className="py-3.5 px-4">Pedido ID</th>
                  <th className="py-3.5 px-4">Producto & Paquete</th>
                  <th className="py-3.5 px-4">Datos Requeridos (UID)</th>
                  <th className="py-3.5 px-4">Método de Pago</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon/10">
                {orders.map((order) => {
                  const prodName = order.variants?.products?.nombre || 'Producto';
                  const varName = order.variants?.nombre || 'Paquete';
                  const reqJson = order.datos_requeridos_json || {};
                  const orderId = order.id || order.pedido_id;
                  const orderCode = order.codigo_pedido || ('#' + orderId.slice(0, 8));
                  const orderFecha = order.created_at || order.fecha_creacion;

                  return (
                    <tr key={orderId} className="hover:bg-navy/40 transition-colors">
                      <td className="py-3.5 px-4 text-ice/60">
                        {orderCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-pure font-bold">{prodName}</div>
                        <div className="text-[11px] text-neon">{varName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-ice/90">
                        {Object.entries(reqJson)
                          .filter(([key]) => key !== 'referencia')
                          .map(([key, val]) => (
                            <div key={key}>
                              <span className="text-ice/50">{key}:</span> {String(val)}
                            </div>
                          ))}
                      </td>
                      <td className="py-3.5 px-4 text-pure">
                        {order.metodo_pago}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={getOrderStatusBadge(order.estado)}>
                          {order.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-ice/70">
                        {formatDate(orderFecha)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

