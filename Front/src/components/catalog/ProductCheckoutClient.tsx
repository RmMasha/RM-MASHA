'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import {
  Product,
  Variant,
  ProductRequirement,
  PaymentMethod,
  UserRole,
} from '@/types/database.types';
import { formatCurrency, getRoleBadgeColor } from '@/lib/utils';
import {
  Zap,
  Wallet,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Upload,
  Loader2,
  ShieldCheck,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';

interface Props {
  product: Product;
  variants: Variant[];
  requirements: ProductRequirement[];
  paymentMethods: PaymentMethod[];
}

export function ProductCheckoutClient({
  product,
  variants,
  requirements,
  paymentMethods,
}: Props) {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  const userRole: UserRole = profile?.rol ?? 'cliente';

  // Selección de variante (por defecto la primera)
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id ?? ''
  );

  // Valores de los campos requeridos (ej. ID de Free Fire, Nickname)
  const [formRequirements, setFormRequirements] = useState<Record<string, string>>({});

  // Tipo de Pago: 'saldo' | 'directo'
  const [paymentType, setPaymentType] = useState<'saldo' | 'directo'>('saldo');

  // Si eligió 'directo', método de pago y comprobante
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>(
    paymentMethods[0]?.id ?? ''
  );
  const [transactionReference, setTransactionReference] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Estados de proceso
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    codigo_pedido: string;
    esSaldo: boolean;
  } | null>(null);

  // Obtener variante seleccionada
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  // Resolver precio según el rol
  const getPriceForRole = (variant: Variant): number => {
    if (!variant.prices || variant.prices.length === 0) return 0;
    const priceObj = variant.prices.find((p) => p.rol === userRole);
    if (priceObj) return priceObj.precio;
    const defaultClientPrice = variant.prices.find((p) => p.rol === 'cliente');
    return defaultClientPrice?.precio ?? 0;
  };

  const currentPrice = selectedVariant ? getPriceForRole(selectedVariant) : 0;
  const userBalance = profile?.saldo_actual ?? 0;
  const hasEnoughBalance = userBalance >= currentPrice;

  const handleRequirementChange = (key: string, value: string) => {
    setFormRequirements((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      router.push(`/login?redirect=${window.location.pathname}`);
      return;
    }

    // 1. Validar requisitos requeridos
    for (const req of requirements) {
      if (req.requerido && (!formRequirements[req.tipo] || !formRequirements[req.tipo].trim())) {
        setErrorMsg(`El campo "${req.etiqueta}" es obligatorio.`);
        return;
      }
      if (req.regex_validacion && formRequirements[req.tipo]) {
        const regex = new RegExp(req.regex_validacion);
        if (!regex.test(formRequirements[req.tipo])) {
          setErrorMsg(`El formato de "${req.etiqueta}" es inválido.`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      if (paymentType === 'saldo') {
        // PAGO CON SALDO (RPC ATÓMICO)
        if (!hasEnoughBalance) {
          setErrorMsg(
            `Saldo insuficiente. Tienes ${formatCurrency(userBalance)} y se requieren ${formatCurrency(currentPrice)}.`
          );
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.rpc('pagar_con_saldo', {
          p_variante_id: selectedVariant.id,
          p_datos_requeridos: formRequirements,
        });

        if (error) {
          throw new Error(error.message);
        }

        await refreshProfile();
        setSuccessOrder({
          codigo_pedido: data.codigo_pedido,
          esSaldo: true,
        });
      } else {
        // PAGO DIRECTO (COMPROBANTE + PEDIDO 'NUEVO')
        if (!selectedPaymentMethodId) {
          setErrorMsg('Selecciona un método de pago.');
          setLoading(false);
          return;
        }

        if (!transactionReference.trim()) {
          setErrorMsg('Ingresa el número de referencia o ID de transacción del pago.');
          setLoading(false);
          return;
        }

        if (!receiptFile) {
          setErrorMsg('Debes adjuntar la captura del comprobante de pago.');
          setLoading(false);
          return;
        }

        // Subir comprobante al bucket 'comprobantes'
        const fileExt = receiptFile.name.split('.').pop();
        const filePath = `${user.id}/pedido_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('comprobantes')
          .upload(filePath, receiptFile);

        if (uploadError) {
          throw new Error('Error al subir el comprobante: ' + uploadError.message);
        }

        // Obtener URL de comprobante
        const comprobanteUrl = filePath;

        const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethodId);

        // Crear pedido en estado 'nuevo'
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            usuario_id: user.id,
            variante_id: selectedVariant.id,
            total: currentPrice,
            estado: 'nuevo',
            metodo_pago: selectedMethod?.nombre_metodo || 'Pago Directo',
            comprobante_url: comprobanteUrl,
            referencia_pago: transactionReference.trim(),
            datos_requeridos_json: formRequirements,
          })
          .select('codigo_pedido')
          .single();

        if (orderError) {
          throw new Error(orderError.message);
        }

        setSuccessOrder({
          codigo_pedido: orderData.codigo_pedido,
          esSaldo: false,
        });
      }
    } catch (err: any) {
      console.error('Error durante la orden:', err);
      setErrorMsg(err.message || 'Ocurrió un error al procesar tu compra.');
    } finally {
      setLoading(false);
    }
  };

  // VISTA DE ÉXITO TRAS COMPLETAR COMPRA
  if (successOrder) {
    return (
      <div className="max-w-xl mx-auto p-8 rounded-3xl bg-surface-card border border-emerald-500/40 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
          {successOrder.esSaldo ? '¡Compra Confirmada Automáticamente!' : '¡Pedido Recibido!'}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-2">
          Pedido {successOrder.codigo_pedido}
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          {successOrder.esSaldo
            ? 'Tu compra fue descontada de tu saldo y se confirmó de manera instantánea. El equipo de entrega ya está procesando tus diamantes.'
            : 'Hemos recibido tu comprobante de pago. Un administrador revisará la referencia y confirmará tu entrega a la brevedad.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/ordenes')}
            className="px-6 py-3 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover transition-all shadow-glow-red"
          >
            Ver Mis Pedidos
          </button>
          <button
            onClick={() => {
              setSuccessOrder(null);
              setReceiptFile(null);
              setTransactionReference('');
            }}
            className="px-6 py-3 rounded-xl font-semibold text-slate-300 bg-surface-hover hover:bg-surface-border transition-colors border border-slate-700"
          >
            Hacer Otra Recarga
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* COLUMNA IZQUIERDA: SELECCIÓN DE VARIANTES Y DATOS DE ENTREGA (7 COLS) */}
      <div className="lg:col-span-7 space-y-6">
        {/* PASO 1: SELECCIONAR PAQUETE */}
        <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center">
                1
              </span>
              Elige tu Paquete de Diamantes
            </h3>
            {user && (
              <span
                className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${getRoleBadgeColor(
                  userRole
                )}`}
              >
                Precios para {userRole.replace('_', ' ')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variants.map((v) => {
              const price = getPriceForRole(v);
              const isSelected = v.id === selectedVariantId;
              return (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-primary/10 border-brand-primary shadow-glow-red/20'
                      : 'bg-surface/60 border-surface-border hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{v.nombre}</span>
                      <span className="text-xs">💎</span>
                    </div>
                    {v.descripcion && (
                      <p className="text-xs text-slate-400 mb-2">{v.descripcion}</p>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-surface-border/50">
                    <span className="text-[11px] text-slate-400">Total a pagar:</span>
                    <span className="text-base font-extrabold text-brand-gold">
                      {formatCurrency(price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PASO 2: DATOS REQUERIDOS (ID DE FREE FIRE / NICKNAME) */}
        <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-4">
          <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs flex items-center justify-center">
              2
            </span>
            Datos para la Entrega Directa
          </h3>

          <div className="space-y-4">
            {requirements.map((req) => (
              <div key={req.id}>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {req.etiqueta} {req.requerido && <span className="text-brand-primary">*</span>}
                </label>
                <input
                  type="text"
                  required={req.requerido}
                  placeholder={req.placeholder || ''}
                  value={formRequirements[req.tipo] || ''}
                  onChange={(e) => handleRequirementChange(req.tipo, e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-surface-border text-white placeholder-slate-500 focus:outline-none focus:border-brand-primary transition-colors text-sm"
                />
              </div>
            ))}

            <div className="p-3 rounded-xl bg-surface/70 border border-surface-border flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
              <span>
                Asegúrate de copiar tu ID de jugador con exactitud directamente desde tu perfil de Free Fire. No se requieren contraseñas.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA: RESUMEN Y PASARELA DE PAGO (5 COLS) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="p-6 rounded-3xl bg-surface-card border border-surface-border space-y-5 sticky top-24 glow-border">
          <h3 className="font-extrabold text-lg text-white">Resumen de la Orden</h3>

          {/* DETALLES DE COMPRA */}
          <div className="space-y-2.5 pb-4 border-b border-surface-border text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Producto:</span>
              <span className="font-bold text-white">{product.nombre}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Paquete seleccionado:</span>
              <span className="font-bold text-brand-cyan">{selectedVariant?.nombre}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-bold text-white">Total:</span>
              <span className="text-2xl font-black text-brand-gold">
                {formatCurrency(currentPrice)}
              </span>
            </div>
          </div>

          {/* PASO 3: SELECCIONAR MÉTODO DE PAGO (SALDO VS DIRECTO) */}
          <form onSubmit={handleCheckout} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* OPCIÓN 1: PAGAR CON SALDO */}
                <button
                  type="button"
                  onClick={() => setPaymentType('saldo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentType === 'saldo'
                      ? 'bg-brand-primary/10 border-brand-primary text-white shadow-glow-red/20'
                      : 'bg-surface border-surface-border text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <Wallet className="w-3.5 h-3.5 text-brand-gold" />
                    Pagar con Saldo
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block">
                    ⚡ Entrega Automática
                  </span>
                </button>

                {/* OPCIÓN 2: PAGO DIRECTO */}
                <button
                  type="button"
                  onClick={() => setPaymentType('directo')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    paymentType === 'directo'
                      ? 'bg-brand-primary/10 border-brand-primary text-white shadow-glow-red/20'
                      : 'bg-surface border-surface-border text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-brand-cyan" />
                    Pago Directo
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Subir comprobante
                  </span>
                </button>
              </div>
            </div>

            {/* SECCIÓN ESPECÍFICA SEGÚN TIPO DE PAGO */}
            {paymentType === 'saldo' ? (
              <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tu saldo disponible:</span>
                  <span className="font-bold text-white text-sm">
                    {formatCurrency(userBalance)}
                  </span>
                </div>

                {!user ? (
                  <p className="text-xs text-amber-400 pt-1">
                    Inicia sesión para pagar automáticamente con tu billetera.
                  </p>
                ) : !hasEnoughBalance ? (
                  <div className="pt-2">
                    <p className="text-xs text-rose-400 mb-2">
                      Saldo insuficiente para completar este pedido.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/billetera?accion=recargar')}
                      className="w-full py-2 rounded-lg bg-brand-gold hover:bg-brand-accent text-slate-950 font-bold text-xs transition-colors"
                    >
                      Recargar Saldo Wallet
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Saldo suficiente. La compra se procesará de inmediato.
                  </p>
                )}
              </div>
            ) : (
              /* PAGO DIRECTO */
              <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-3">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Selecciona Billetera o Banco
                  </label>
                  <select
                    value={selectedPaymentMethodId}
                    onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-card border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
                  >
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.id}>
                        {pm.nombre_metodo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DATOS DE LA CUENTA */}
                {(() => {
                  const method = paymentMethods.find((m) => m.id === selectedPaymentMethodId);
                  if (!method) return null;
                  return (
                    <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border text-[11px] text-slate-300 space-y-1">
                      {method.titular && <p><span className="text-slate-400">Titular:</span> {method.titular}</p>}
                      {method.numero_cuenta_o_dato && (
                        <p className="font-mono text-brand-gold select-all font-bold">
                          {method.numero_cuenta_o_dato}
                        </p>
                      )}
                      {method.instrucciones && (
                        <p className="text-[10px] text-slate-400 italic">{method.instrucciones}</p>
                      )}
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Referencia de Pago
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 12345678"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-card border border-surface-border text-white text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">
                    Captura del Comprobante
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface-hover file:text-slate-200 hover:file:bg-brand-primary hover:file:text-white file:transition-colors cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* MENSAJE DE ERROR */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* BOTÓN FINAL DE COMPRA */}
            <button
              type="submit"
              disabled={loading || (paymentType === 'saldo' && user !== null && !hasEnoughBalance)}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-red transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando Pedido...
                </>
              ) : !user ? (
                'Iniciar Sesión para Comprar'
              ) : paymentType === 'saldo' ? (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  Confirmar Compra con Saldo
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Enviar Pedido y Comprobante
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
