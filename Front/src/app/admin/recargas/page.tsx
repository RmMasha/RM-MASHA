'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { formatCurrency, formatDate, getOrderStatusBadge } from '@/lib/utils';

export default function AdminRecargasPage() {
  const { user } = useAuth();
  const [recharges, setRecharges] = useState<any[]>([]);
  const [filterState, setFilterState] = useState<'pendiente' | 'aprobada' | 'rechazada' | 'todos'>('pendiente');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Bloquea scroll del fondo cuando el visor de comprobante está abierto
  useBodyScrollLock(!!previewImageUrl);

  const fetchRecharges = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('balance_recharges')
        .select('*, users(id, nombre, email, whatsapp, rol, saldo_actual)')
        .order('fecha', { ascending: false });

      if (filterState !== 'todos') {
        query = query.eq('estado', filterState);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRecharges(data || []);
    } catch (err) {
      console.error('Error fetching recharges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecharges();
  }, [filterState]);

  // Aprobar recarga llamando al Stored Procedure atómico de PostgreSQL: aprobar_recarga_saldo
  const handleAprobar = async (recargaId: string) => {
    if (!user) return;
    if (!confirm('¿Confirmas que verificaste el comprobante y deseas aprobar esta recarga de saldo?')) return;

    try {
      setActionLoading(recargaId);
      const { data, error } = await supabase.rpc('aprobar_recarga_saldo', {
        p_recarga_id: recargaId,
      });

      if (error) throw error;
      alert('¡Recarga aprobada exitosamente y saldo acreditado!');
      await fetchRecharges();
    } catch (err: any) {
      console.error('Error al aprobar recarga:', err);
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Rechazar recarga llamando al Stored Procedure: rechazar_recarga_saldo
  const handleRechazar = async (recargaId: string) => {
    if (!user) return;
    const motivo = prompt('Por favor ingresa el motivo del rechazo para notificar al usuario:');
    if (!motivo) return;

    try {
      setActionLoading(recargaId);
      const { data, error } = await supabase.rpc('rechazar_recarga_saldo', {
        p_recarga_id: recargaId,
        p_motivo: motivo.trim(),
      });

      if (error) throw error;
      alert('Recarga rechazada y notificación enviada al cliente.');
      await fetchRecharges();
    } catch (err: any) {
      console.error('Error al rechazar recarga:', err);
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Ver comprobante con URL firmada
  const handleViewReceipt = async (comprobantePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('comprobantes')
        .createSignedUrl(comprobantePath, 300);

      if (error) throw error;
      if (data?.signedUrl) {
        setPreviewImageUrl(data.signedUrl);
      }
    } catch (err: any) {
      alert('No se pudo cargar el comprobante: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="cyber-panel rounded-2xl p-6 border-neon/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold text-[11px] font-mono uppercase mb-2">
            <span>❄</span> Módulo 6.2: Gestión de Saldo
          </div>
          <h1 className="text-2xl font-black text-pure uppercase tracking-wider">
            Solicitudes de Recarga de Saldo
          </h1>
          <p className="text-xs text-ice/70 font-mono mt-1">
            Revisión de comprobantes y acreditación automática mediante función atómica PostgreSQL.
          </p>
        </div>

        <button
          onClick={() => fetchRecharges()}
          className="btn-ice-pill px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <span>↻</span> Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 border-b border-neon/20 pb-2 overflow-x-auto">
        {(['pendiente', 'aprobada', 'rechazada', 'todos'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterState(tab)}
            className={`px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
              filterState === tab
                ? 'btn-neon-pill font-bold'
                : 'text-ice/70 hover:text-white hover:bg-navy/60'
            }`}
          >
            {tab === 'pendiente'
              ? 'Pendientes de Revisión'
              : tab === 'aprobada'
              ? 'Aprobadas'
              : tab === 'rechazada'
              ? 'Rechazadas'
              : 'Ver Todas'}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="cyber-panel rounded-2xl overflow-hidden border-neon/30">
        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-ice">
            Cargando solicitudes de recarga...
          </div>
        ) : recharges.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-ice/60">
            No hay solicitudes de recarga en esta categoría.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neon/20 text-ice/70 bg-pitch/80">
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Usuario</th>
                  <th className="py-3.5 px-4">Monto Solicitado</th>
                  <th className="py-3.5 px-4">Canal / Referencia</th>
                  <th className="py-3.5 px-4">Comprobante</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neon/10">
                {recharges.map((r) => {
                  const recId = r.id || r.recarga_id;
                  const recFecha = r.created_at || r.fecha;
                  const recMetodo = r.payment_methods?.nombre_metodo || r.metodo_pago || (r.referencia_pago ? `Ref: ${r.referencia_pago}` : 'Transferencia');
                  return (
                    <tr key={recId} className="hover:bg-navy/40 transition-colors">
                      <td className="py-3.5 px-4 text-ice/70">{formatDate(recFecha)}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-pure font-bold">{r.users?.nombre || 'Usuario'}</div>
                        <div className="text-[11px] text-ice/60">{r.users?.email}</div>
                        <div className="text-[10px] text-gold font-bold">
                          Saldo Actual: {formatCurrency(r.users?.saldo_actual || 0)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gold font-bold text-sm">
                        {formatCurrency(r.monto)}
                      </td>
                      <td className="py-3.5 px-4 text-pure">{recMetodo}</td>
                      <td className="py-3.5 px-4">
                        {r.comprobante_url ? (
                          <button
                            type="button"
                            onClick={() => handleViewReceipt(r.comprobante_url)}
                            className="text-neon hover:text-white underline cursor-pointer"
                          >
                            Ver Comprobante 🔍
                          </button>
                        ) : (
                          <span className="text-ice/40">Sin archivo</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={getOrderStatusBadge(r.estado)}>
                          {r.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {r.estado === 'pendiente' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              disabled={actionLoading === recId}
                              onClick={() => handleAprobar(recId)}
                              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase bg-neon/20 border border-neon text-neon hover:bg-neon hover:text-white transition-all disabled:opacity-50"
                            >
                              ✓ Aprobar
                            </button>
                            <button
                              disabled={actionLoading === recId}
                              onClick={() => handleRechazar(recId)}
                              className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase bg-magenta/20 border border-magenta text-magenta hover:bg-magenta hover:text-white transition-all disabled:opacity-50"
                            >
                              ✕ Rechazar
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-mono text-ice/50">Procesado</span>
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

      {/* Modal Visor de Comprobante */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain animate-fadeIn">
          <div className="cyber-panel p-6 rounded-2xl max-w-2xl w-full border-neon/40 shadow-2xl max-h-[90vh] overflow-y-auto overscroll-contain">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-pure">
                Comprobante de Recarga
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

