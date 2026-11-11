'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Product, Variant, Price, ProductRequirement, PaymentMethod, Review } from '@/types/database.types';
import { formatCurrency, getRoleBadge } from '@/lib/utils';

interface VariantWithPrices extends Variant {
  prices: Price[];
}

interface Props {
  product: Product;
  variants: VariantWithPrices[];
  requirements: ProductRequirement[];
  paymentMethods: PaymentMethod[];
  initialReviews: (Review & { users?: { nombre: string; nickname?: string | null; avatar_url?: string | null } })[];
  categorySlug: string;
  subcategorySlug: string;
}

export default function ProductCheckoutClient({
  product,
  variants,
  requirements,
  paymentMethods,
  initialReviews,
  categorySlug,
  subcategorySlug,
}: Props) {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  // Selección de variante
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || variants[0]?.variante_id || ''
  );

  // Método de compra: 'saldo' | 'directo'
  const [paymentChoice, setPaymentChoice] = useState<'saldo' | 'directo'>('saldo');

  // Método de pago directo seleccionado
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    paymentMethods[0]?.id || paymentMethods[0]?.metodo_id || ''
  );
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [referenciaText, setReferenciaText] = useState<string>('');

  // Datos de requisitos del producto (e.g. ID de Jugador, Nickname)
  const [requirementValues, setRequirementValues] = useState<Record<string, string>>({});

  // Estados de carga y feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estados para agregar reseña
  const [reviews, setReviews] = useState(initialReviews);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Obtener la variante seleccionada
  const currentVariant = variants.find((v) => (v.id || v.variante_id) === selectedVariantId) || variants[0];
  const variantId = currentVariant?.id || currentVariant?.variante_id || '';

  // Determinar el precio según el rol del usuario (o 'cliente' por defecto)
  const userRole = profile?.rol || 'cliente';
  const rolePriceObj = currentVariant?.prices?.find((p) => p.rol === userRole) 
    || currentVariant?.prices?.find((p) => p.rol === 'cliente');
  const currentPrice = rolePriceObj ? Number(rolePriceObj.precio) : 0;

  // Comparar con precio cliente para mostrar ahorro si es revendedor
  const clientPriceObj = currentVariant?.prices?.find((p) => p.rol === 'cliente');
  const clientPrice = clientPriceObj ? Number(clientPriceObj.precio) : currentPrice;
  const savings = clientPrice > currentPrice ? clientPrice - currentPrice : 0;

  // Manejar cambio en requisitos
  const handleReqChange = (campo: string, val: string) => {
    setRequirementValues((prev) => ({ ...prev, [campo]: val }));
  };

  // Validar requisitos
  const validateRequirements = (): boolean => {
    if (!requirements || requirements.length === 0) return true;
    for (const req of requirements) {
      const fieldName = req.etiqueta || req.campo_nombre || 'ID de Jugador';
      const isObligatorio = req.requerido ?? req.obligatorio ?? true;
      const val = requirementValues[fieldName];

      if (isObligatorio && (!val || !val.trim())) {
        setErrorMessage(`El campo "${fieldName}" es obligatorio.`);
        return false;
      }
      if ((req.tipo === 'id' || req.tipo === 'id_jugador') && val && !/^\d+$/.test(val.trim())) {
        setErrorMessage(`El campo "${fieldName}" debe contener solo números.`);
        return false;
      }
    }
    return true;
  };

  // Procesar Compra con Saldo Automático
  const handlePayWithBalance = async () => {
    if (!user) {
      router.push(`/login?redirect=/catalogo/${categorySlug}/${subcategorySlug}/${product.slug}`);
      return;
    }

    if (!validateRequirements()) return;

    if ((profile?.saldo_actual || 0) < currentPrice) {
      setErrorMessage(
        `Saldo insuficiente. Tienes ${formatCurrency(profile?.saldo_actual || 0)} y el pedido cuesta ${formatCurrency(currentPrice)}. Recarga saldo en tu Billetera.`
      );
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Llamar al Stored Procedure atómico de PostgreSQL: pagar_con_saldo
      const { data, error } = await supabase.rpc('pagar_con_saldo', {
        p_variante_id: variantId,
        p_datos_requeridos: requirementValues,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage('¡Compra confirmada al instante con saldo! Tus diamantes están en proceso de acreditación.');
      await refreshProfile();
      setTimeout(() => {
        router.push('/ordenes');
      }, 2000);
    } catch (err: any) {
      console.error('Error al pagar con saldo:', err);
      setErrorMessage(err.message || 'Error al procesar la compra con saldo.');
    } finally {
      setLoading(false);
    }
  };

  // Procesar Pago Directo con Comprobante
  const handleDirectPayment = async () => {
    if (!user) {
      router.push(`/login?redirect=/catalogo/${categorySlug}/${subcategorySlug}/${product.slug}`);
      return;
    }

    if (!validateRequirements()) return;

    if (!selectedMethodId) {
      setErrorMessage('Selecciona un método de pago directo.');
      return;
    }

    if (!referenciaText.trim()) {
      setErrorMessage('Ingresa el número o código de referencia de tu transferencia.');
      return;
    }

    if (!comprobanteFile) {
      setErrorMessage('Por favor sube la captura o foto del comprobante de pago.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 1. Subir comprobante al bucket privado 'comprobantes'
      const fileExt = comprobanteFile.name.split('.').pop();
      const filePath = `pedidos/${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('comprobantes')
        .upload(filePath, comprobanteFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Error al subir comprobante: ${uploadError.message}`);
      }

      const selectedMethod = paymentMethods.find((m) => (m.id || m.metodo_id) === selectedMethodId);

      // 2. Crear pedido en estado 'nuevo'
      const { error: orderError } = await supabase.from('orders').insert({
        usuario_id: user.id,
        variante_id: variantId,
        total: currentPrice,
        estado: 'nuevo',
        metodo_pago: selectedMethod?.nombre_metodo || 'Pago Directo',
        comprobante_url: filePath,
        referencia_pago: referenciaText.trim(),
        datos_requeridos_json: {
          ...requirementValues,
          referencia: referenciaText.trim(),
        },
      });

      if (orderError) {
        throw new Error(`Error al crear la orden: ${orderError.message}`);
      }

      setSuccessMessage('¡Pedido registrado con éxito! Nuestro equipo validará el comprobante en breve.');
      setTimeout(() => {
        router.push('/ordenes');
      }, 2000);
    } catch (err: any) {
      console.error('Error en pago directo:', err);
      setErrorMessage(err.message || 'Error al procesar el pedido directo.');
    } finally {
      setLoading(false);
    }
  };

  // Enviar nueva reseña
  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage('Debes iniciar sesión para publicar una reseña.');
      return;
    }
    if (!newReviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const prodId = product.id || product.producto_id;
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          usuario_id: user.id,
          entidad_tipo: 'producto',
          entidad_id: prodId,
          calificacion: newReviewRating,
          comentario_texto: newReviewComment.trim(),
          destacado_hero: false,
        })
        .select('*, users(nombre, nickname, avatar_url)')
        .single();

      if (error) throw error;
      if (data) {
        setReviews([data as any, ...reviews]);
        setNewReviewComment('');
      }
    } catch (err: any) {
      console.error('Error al agregar reseña:', err);
      setErrorMessage('No se pudo enviar la reseña.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* MENSAJES DE ESTADO */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-magenta/15 border border-magenta text-pure text-xs md:text-sm font-mono flex items-center justify-between shadow-[0_0_15px_rgba(255,0,127,0.3)]">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-pure hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-neon/15 border border-neon text-pure text-xs md:text-sm font-mono flex items-center justify-between shadow-[0_0_15px_rgba(0,210,255,0.3)]">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-pure hover:text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* DETALLES Y CHECKOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA: SELECCIÓN DE PAQUETE / REQUISITOS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Panel de Selección de Variante */}
          <div className="cyber-panel rounded-2xl p-6 border-neon/30">
            <h3 className="text-base font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
              1. Selecciona tu Paquete de Diamantes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {variants.map((v) => {
                const vId = v.id || v.variante_id || '';
                const isSelected = vId === selectedVariantId;
                const vPriceObj = v.prices?.find((p) => p.rol === userRole) || v.prices?.find((p) => p.rol === 'cliente');
                const vPrice = vPriceObj ? Number(vPriceObj.precio) : 0;

                return (
                  <button
                    key={vId}
                    type="button"
                    onClick={() => setSelectedVariantId(vId)}
                    className={`p-4 rounded-xl text-left border transition-all ${
                      isSelected
                        ? 'border-neon bg-neon/10 shadow-[0_0_15px_rgba(0,210,255,0.35)]'
                        : 'border-neon/20 bg-navy/60 hover:border-ice/50 hover:bg-navy/80'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-pure">{v.nombre}</span>
                      <span className="text-xs font-mono font-bold text-gold">
                        {formatCurrency(vPrice)}
                      </span>
                    </div>
                    {v.descripcion && (
                      <p className="text-[11px] font-mono text-ice/70">{v.descripcion}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panel de Requisitos (ID de Jugador, etc.) */}
          <div className="cyber-panel rounded-2xl p-6 border-neon/30">
            <h3 className="text-base font-bold uppercase tracking-wider text-pure mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-magenta shadow-[0_0_8px_#FF007F]" />
              2. Datos de Entrega para Free Fire
            </h3>

            {requirements && requirements.length > 0 ? (
              <div className="space-y-4">
                {requirements.map((req) => {
                  const reqId = req.id || req.requisito_id;
                  const fieldName = req.etiqueta || req.campo_nombre || 'ID de Jugador';
                  const isObligatorio = req.requerido ?? req.obligatorio ?? true;
                  const isIdType = req.tipo === 'id' || req.tipo === 'id_jugador';

                  return (
                    <div key={reqId}>
                      <label className="block text-xs font-mono uppercase text-ice/90 mb-1.5">
                        {fieldName} {isObligatorio && <span className="text-magenta">*</span>}
                      </label>
                      <input
                        type={isIdType ? 'tel' : 'text'}
                        placeholder={req.placeholder || `Ingresa tu ${fieldName}`}
                        value={requirementValues[fieldName] || ''}
                        onChange={(e) => handleReqChange(fieldName, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-sm font-mono focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                      />
                      <span className="text-[10px] font-mono text-ice/50 mt-1 block">
                        {isIdType ? 'Solo números. Encuéntralo en tu perfil de Free Fire.' : 'Escríbelo exactamente como figura en el juego.'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-mono uppercase text-ice/90 mb-1.5">
                  ID de Jugador (UID) <span className="text-magenta">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ej: 123456789"
                  value={requirementValues['ID de Jugador'] || ''}
                  onChange={(e) => handleReqChange('ID de Jugador', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-navy/90 border border-neon/30 text-pure placeholder-ice/40 text-sm font-mono focus:outline-none focus:border-neon focus:ring-1 focus:ring-neon transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN, SELECCIÓN DE PAGO Y BOTÓN DE ACCIÓN (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="cyber-panel rounded-2xl p-6 border-neon/40 shadow-neon">
            <h3 className="text-base font-bold uppercase tracking-wider text-pure mb-4 flex items-center justify-between">
              <span>3. Resumen del Pedido</span>
              <span className={getRoleBadge(userRole)}>{userRole.replace('_', ' ')}</span>
            </h3>

            {/* Ficha Resumen */}
            <div className="space-y-3 pb-4 mb-4 border-b border-neon/15 text-xs font-mono">
              <div className="flex justify-between text-ice/80">
                <span>Producto:</span>
                <span className="text-pure font-bold">{product.nombre}</span>
              </div>
              <div className="flex justify-between text-ice/80">
                <span>Variante:</span>
                <span className="text-pure font-bold">{currentVariant?.nombre || 'Default'}</span>
              </div>
              <div className="flex justify-between text-ice/80">
                <span>Tarifa según Rol:</span>
                <span className="text-gold font-bold">{formatCurrency(currentPrice)}</span>
              </div>

              {savings > 0 && (
                <div className="p-2 rounded-lg bg-neon/10 border border-neon/30 text-neon text-[11px] flex justify-between items-center">
                  <span>¡Ahorro de Revendedor!</span>
                  <span className="font-bold">-{formatCurrency(savings)}</span>
                </div>
              )}
            </div>

            {/* Selector de Método: Saldo vs Directo */}
            <div className="mb-6">
              <label className="block text-xs font-mono uppercase text-ice/80 mb-2">
                Método de Liquidación:
              </label>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentChoice('saldo')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    paymentChoice === 'saldo'
                      ? 'border-gold bg-gold/15 text-gold shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                      : 'border-neon/20 bg-navy/60 text-ice/70 hover:border-ice/40'
                  }`}
                >
                  ⚡ Pagar con Saldo
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentChoice('directo')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    paymentChoice === 'directo'
                      ? 'border-neon bg-neon/15 text-neon shadow-[0_0_12px_rgba(0,210,255,0.3)]'
                      : 'border-neon/20 bg-navy/60 text-ice/70 hover:border-ice/40'
                  }`}
                >
                  💳 Pago Directo
                </button>
              </div>

              {/* Contenido según elección */}
              {paymentChoice === 'saldo' ? (
                <div className="p-4 rounded-xl bg-navy/80 border border-gold/30 mb-4 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-ice/80">Tu Saldo Disponible:</span>
                    <span className="text-gold font-bold text-sm">
                      {formatCurrency(profile?.saldo_actual || 0)}
                    </span>
                  </div>

                  {user ? (
                    (profile?.saldo_actual || 0) < currentPrice ? (
                      <div className="text-[11px] font-mono text-magenta">
                        ⚠️ Saldo insuficiente para procesar la orden automática.{' '}
                        <Link href="/billetera" className="underline font-bold text-ice">
                          Recargar Saldo aquí →
                        </Link>
                      </div>
                    ) : (
                      <div className="text-[11px] font-mono text-neon flex items-center gap-1.5">
                        <span>✓</span> Saldo suficiente. Se confirmará de forma inmediata.
                      </div>
                    )
                  ) : (
                    <div className="text-[11px] font-mono text-ice/80">
                      <Link href="/login" className="text-neon underline font-bold">
                        Inicia sesión
                      </Link>{' '}
                      para usar tu saldo interno automatizado.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 p-4 rounded-xl bg-navy/80 border border-neon/30 mb-4">
                  {/* Selector de pasarela */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-ice/80 mb-1">
                      Selecciona Banco / Billetera:
                    </label>
                    <select
                      value={selectedMethodId}
                      onChange={(e) => setSelectedMethodId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
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

                  {/* Número de Referencia */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-ice/80 mb-1">
                      Nº de Referencia / Comprobante:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: 198283749"
                      value={referenciaText}
                      onChange={(e) => setReferenciaText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon"
                    />
                  </div>

                  {/* Subir comprobante */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-ice/80 mb-1">
                      Captura del Comprobante (JPG, PNG):
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                      className="w-full text-xs font-mono text-ice/80 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-neon/20 file:text-neon hover:file:bg-neon/30 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Botón Principal de Acción */}
            {paymentChoice === 'saldo' ? (
              <button
                type="button"
                onClick={handlePayWithBalance}
                disabled={loading || (user ? (profile?.saldo_actual || 0) < currentPrice : false)}
                className="w-full btn-neon-pill py-3 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Procesando...</span>
                ) : (
                  <>
                    <span>⚡ Confirmar y Pagar con Saldo</span>
                    <span>({formatCurrency(currentPrice)})</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDirectPayment}
                disabled={loading}
                className="w-full btn-ice-pill py-3 text-xs md:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Enviando Comprobante...</span>
                ) : (
                  <>
                    <span>Enviar Pedido Directo</span>
                    <span>({formatCurrency(currentPrice)})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN DE RESEÑAS DEL PRODUCTO */}
      <div className="cyber-panel rounded-2xl p-6 md:p-8 border-neon/30">
        <h3 className="text-xl font-bold uppercase tracking-wider text-pure mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gold shadow-[0_0_8px_#FBBF24]" />
          Reseñas y Valoraciones ({reviews.length})
        </h3>

        {/* Formulario de nueva reseña */}
        {user ? (
          <form onSubmit={handleAddReview} className="mb-8 p-4 rounded-xl bg-navy/60 border border-neon/20">
            <h4 className="text-xs font-mono uppercase text-ice mb-3">Deja tu opinión sobre este producto:</h4>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono text-pure">Puntuación:</span>
              <div className="flex gap-1 text-gold cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className={`text-lg ${star <= newReviewRating ? 'text-gold' : 'text-ice/30'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={2}
              placeholder="¿Qué te pareció la velocidad de entrega y el servicio?"
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-pitch border border-neon/30 text-pure text-xs font-mono focus:outline-none focus:border-neon mb-3"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="btn-ice-pill px-5 py-2 text-xs font-bold uppercase tracking-wider"
            >
              {submittingReview ? 'Publicando...' : 'Publicar Reseña'}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 rounded-xl bg-navy/40 border border-neon/15 text-xs font-mono text-ice/70">
            Para dejar una reseña sobre este producto, por favor{' '}
            <Link href="/login" className="text-neon underline font-bold">
              inicia sesión
            </Link>.
          </div>
        )}

        {/* Lista de reseñas */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs font-mono text-ice/60">Aún no hay reseñas para este producto. ¡Sé el primero!</p>
          ) : (
            reviews.map((rev) => {
              const rId = rev.id || rev.review_id;
              return (
                <div key={rId} className="p-4 rounded-xl bg-navy/40 border border-neon/15">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-magenta/20 text-magenta flex items-center justify-center text-[10px] font-bold">
                        {rev.users?.nombre?.charAt(0) || 'U'}
                      </div>
                      <span className="text-xs font-bold text-pure">{rev.users?.nombre || 'Usuario'}</span>
                    </div>
                    <div className="flex text-gold text-xs">
                      {Array.from({ length: rev.calificacion }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-mono text-ice/80">{rev.comentario_texto}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
