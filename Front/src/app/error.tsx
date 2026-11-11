'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error no controlado a nivel raíz:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-surface-card border border-rose-500/30 text-center shadow-glow-red">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          ¡Ups! Algo no salió como esperábamos
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Se ha producido una excepción imprevista. El sistema de protección aislada evitó que la aplicación se congele.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover transition-colors shadow-glow-red"
          >
            <RotateCcw className="w-4 h-4" />
            Reintentar
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-surface-hover hover:bg-surface-border transition-colors border border-slate-700"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
