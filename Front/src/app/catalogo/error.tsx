'use client';

import Link from 'next/link';

export default function CatalogError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="cyber-panel max-w-lg mx-auto p-8 rounded-2xl border-neon/40 shadow-neon">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-magenta/15 border border-magenta flex items-center justify-center text-magenta">
          ⚠️
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-pure mb-2">
          Interferencia en el Catálogo
        </h2>
        <p className="text-xs text-ice/80 font-mono mb-6">
          No pudimos sincronizar el catálogo con la base de datos central. El resto de la plataforma sigue operativa.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="btn-ice-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="btn-neon-pill px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center"
          >
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

