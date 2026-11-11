'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="cyber-panel p-8 md:p-12 rounded-2xl max-w-lg w-full text-center border-neon/40 shadow-neon">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-magenta/15 border border-magenta flex items-center justify-center text-magenta shadow-[0_0_25px_rgba(255,0,127,0.4)]">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono uppercase bg-neon/15 text-neon border border-neon/30 mb-3">
          Error de Renderizado
        </span>
        <h2 className="text-2xl font-black text-pure tracking-wider uppercase mb-2">
          Interferencia de Señal
        </h2>
        <p className="text-sm text-ice/80 mb-6 font-mono leading-relaxed">
          Ha ocurrido un error inesperado al procesar la solicitud. Nuestro protocolo de aislamiento ha contenido el incidente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="btn-ice-pill px-6 py-3 text-xs font-bold uppercase tracking-wider"
          >
            Reintentar Acción
          </button>
          <Link
            href="/"
            className="btn-neon-pill px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center"
          >
            Regresar al Home
          </Link>
        </div>
      </div>
    </div>
  );
}

