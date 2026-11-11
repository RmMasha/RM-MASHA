import React from 'react';
import Link from 'next/link';
import { Ghost, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-2xl bg-surface-card border border-surface-border text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-4">
          <Ghost className="w-8 h-8" />
        </div>
        <span className="text-5xl font-black text-brand-primary tracking-wider">404</span>
        <h2 className="text-xl font-bold text-white mt-2 mb-2">Zona Fuera del Mapa</h2>
        <p className="text-sm text-slate-400 mb-6">
          La página o producto que estás buscando no existe o fue reubicada en otra sección del catálogo.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-hover shadow-glow-red transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Regresar a la Base
        </Link>
      </div>
    </div>
  );
}
