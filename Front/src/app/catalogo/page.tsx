import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Category } from '@/types/database.types';
import { Gem, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    return (data as Category[]) || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export default async function CatalogoPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-bold">
          <Flame className="w-4 h-4 fill-brand-primary" />
          <span>CATÁLOGO COMPLETO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Selecciona tu Juego o Servicio
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Navega paso a paso por nuestro catálogo jerárquico aislado para recargas oficiales con entrega instantánea.
        </p>
      </div>

      {/* CATEGORIES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/catalogo/${cat.slug}`}
            className="group rounded-3xl bg-surface-card border border-surface-border p-7 hover:border-brand-primary/60 transition-all hover:scale-[1.02] shadow-xl flex flex-col justify-between glow-border"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-glow-red group-hover:rotate-6 transition-transform">
                <Gem className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white group-hover:text-brand-primary transition-colors">
                {cat.nombre}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                {cat.descripcion || 'Servicios y recargas directas con los mejores precios del mercado.'}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-surface-border flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
              <span>Ver subcategorías</span>
              <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
