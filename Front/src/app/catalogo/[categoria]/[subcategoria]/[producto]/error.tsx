'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';

export default function ProductoError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="p-8 rounded-2xl bg-surface-card border border-rose-500/30 shadow-glow-red">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Error en la Ficha del Producto</h2>
        <p className="text-sm text-slate-400 mb-6">
          Ocurrió un inconveniente al cargar las opciones o la pasarela de compra de este producto. El aislamiento por Error Boundaries previene que afecte a otras secciones.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-hover transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/catalogo"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-surface-hover hover:bg-surface-border border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
