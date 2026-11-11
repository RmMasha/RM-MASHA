import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Category, Subcategory } from '@/types/database.types';
import { ChevronRight, ArrowRight, Layers, Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    categoria: string;
  };
}

async function getCategoryAndSubcategories(slug: string): Promise<{
  category: Category | null;
  subcategories: Subcategory[];
}> {
  try {
    const supabase = createClient();
    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('activo', true)
      .single();

    if (!category) return { category: null, subcategories: [] };

    const { data: subcategories } = await supabase
      .from('subcategories')
      .select('*')
      .eq('categoria_id', category.id)
      .eq('activo', true)
      .order('orden', { ascending: true });

    return {
      category: category as Category,
      subcategories: (subcategories as Subcategory[]) || [],
    };
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return { category: null, subcategories: [] };
  }
}

export default async function CategoriaPage({ params }: PageProps) {
  const { category, subcategories } = await getCategoryAndSubcategories(params.categoria);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-8">
        <Link href="/" className="hover:text-white flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link href="/catalogo" className="hover:text-white">
          Catálogo
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-brand-primary font-bold">{category.nombre}</span>
      </nav>

      {/* HEADER */}
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {category.nombre}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
          {category.descripcion || 'Selecciona el tipo de servicio o recarga deseada para continuar.'}
        </p>
      </div>

      {/* SUBCATEGORIES GRID */}
      {subcategories.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-card border border-surface-border text-center text-slate-400">
          No hay subcategorías activas en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcategories.map((subcat) => (
            <Link
              key={subcat.id}
              href={`/catalogo/${params.categoria}/${subcat.slug}`}
              className="group rounded-3xl bg-surface-card border border-surface-border p-6 hover:border-brand-primary/60 transition-all hover:scale-[1.02] shadow-xl flex flex-col justify-between glow-border"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center text-brand-cyan group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">
                  {subcat.nombre}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {subcat.descripcion || 'Ver todos los paquetes y opciones de este servicio.'}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-surface-border flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
                <span>Ver productos</span>
                <div className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
