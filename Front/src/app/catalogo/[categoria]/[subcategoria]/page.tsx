import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Category, Subcategory, Product } from '@/types/database.types';
import { ChevronRight, ArrowRight, Package, Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    categoria: string;
    subcategoria: string;
  };
}

async function getProductsData(catSlug: string, subcatSlug: string): Promise<{
  category: Category | null;
  subcategory: Subcategory | null;
  products: Product[];
}> {
  try {
    const supabase = createClient();

    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', catSlug)
      .eq('activo', true)
      .single();

    if (!category) return { category: null, subcategory: null, products: [] };

    const { data: subcategory } = await supabase
      .from('subcategories')
      .select('*')
      .eq('categoria_id', category.id)
      .eq('slug', subcatSlug)
      .eq('activo', true)
      .single();

    if (!subcategory) return { category: category as Category, subcategory: null, products: [] };

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('subcategoria_id', subcategory.id)
      .eq('activo', true)
      .order('orden', { ascending: true });

    return {
      category: category as Category,
      subcategory: subcategory as Subcategory,
      products: (products as Product[]) || [],
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { category: null, subcategory: null, products: [] };
  }
}

export default async function SubcategoriaPage({ params }: PageProps) {
  const { category, subcategory, products } = await getProductsData(
    params.categoria,
    params.subcategoria
  );

  if (!category || !subcategory) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-8 flex-wrap">
        <Link href="/" className="hover:text-white flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Inicio
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link href="/catalogo" className="hover:text-white">
          Catálogo
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link href={`/catalogo/${category.slug}`} className="hover:text-white">
          {category.nombre}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-brand-primary font-bold">{subcategory.nombre}</span>
      </nav>

      {/* HEADER */}
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {subcategory.nombre}
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
          {subcategory.descripcion || 'Selecciona el producto o paquete para ver opciones y precios dinámicos.'}
        </p>
      </div>

      {/* PRODUCTS GRID */}
      {products.length === 0 ? (
        <div className="p-8 rounded-2xl bg-surface-card border border-surface-border text-center text-slate-400">
          No hay productos disponibles en esta subcategoría.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <Link
              key={prod.id}
              href={`/catalogo/${params.categoria}/${params.subcategoria}/${prod.slug}`}
              className="group rounded-3xl bg-surface-card border border-surface-border p-6 hover:border-brand-primary/60 transition-all hover:scale-[1.02] shadow-xl flex flex-col justify-between glow-border"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-surface-hover flex items-center justify-center text-brand-gold group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">
                  {prod.nombre}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {prod.descripcion || 'Entrega directa y segura con múltiples opciones de pago.'}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-surface-border flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
                <span>Configurar y Comprar</span>
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
