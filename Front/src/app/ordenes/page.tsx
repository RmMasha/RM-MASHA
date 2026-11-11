'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types/database.types';
import { formatCurrency, formatDate, getOrderStatusBadge } from '@/lib/utils';
import { ShoppingBag, Clock, CheckCircle2, ChevronRight, Gem, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function OrdenesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, variants(*, products(*))')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setOrders(data as Order[]);
      }
    } catch (err) {
      console.error('Error al cargar órdenes:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=/ordenes');
      return;
    }
    loadOrders(user.id);
  }, [user, router, loadOrders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-brand-cyan">
            Mis Compras
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Historial de Pedidos</h1>
          <p className="text-sm text-slate-400 mt-1">
            Consulta el estado en vivo de la entrega de tus diamantes y servicios.
          </p>
        </div>

        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-glow-red transition-all text-sm w-fit"
        >
          <Gem className="w-4 h-4" />
          Nueva Recarga
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          Cargando tus órdenes...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 rounded-3xl bg-surface-card border border-surface-border text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No tienes pedidos aún</h3>
          <p className="text-xs text-slate-400 mb-6">
            Recarga tus diamantes para Free Fire y disfruta de la mejor tasa de entrega.
          </p>
          <Link
            href="/catalogo/free-fire"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover transition-colors text-sm"
          >
            Ir a Recargas Free Fire
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getOrderStatusBadge(order.estado);
            const productName = order.variants?.products?.nombre || 'Diamantes Free Fire';
            const variantName = order.variants?.nombre || 'Paquete';

            return (
              <div
                key={order.id}
                className="p-6 rounded-2xl bg-surface-card border border-surface-border hover:border-slate-700 transition-colors shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-hover flex items-center justify-center text-brand-primary font-black">
                      💎
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-base">
                          {order.codigo_pedido}
                        </span>
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total pagado:</span>
                    <span className="text-xl font-black text-brand-gold">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Producto & Variante</span>
                    <span className="font-semibold text-white">
                      {productName} - {variantName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5">Método de Pago</span>
                    <span className="font-semibold text-slate-300">
                      {order.metodo_pago}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-0.5">Datos Entregados (ID / Nick)</span>
                    <div className="space-y-0.5">
                      {Object.entries(order.datos_requeridos_json || {}).map(([key, val]) => (
                        <span key={key} className="block text-brand-cyan font-mono font-medium">
                          {key}: <span className="text-white">{val}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {order.motivo_rechazo && (
                  <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                    <strong className="font-bold">Motivo de rechazo:</strong> {order.motivo_rechazo}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
