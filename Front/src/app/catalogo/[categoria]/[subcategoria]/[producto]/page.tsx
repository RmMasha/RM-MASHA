import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductCheckoutClient } from '@/components/catalog/ProductCheckoutClient';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import {
  Category,
  Subcategory,
  Product,
  Variant,
  ProductRequirement,
  PaymentMethod,
} from '@/types/database.types';
import { ChevronRight, Home, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    categoria: string;
    subcategoria: string;
    producto: string;
  };
}

async function getProductData(
  catSlug: string,
  subcatSlug: string,
  prodSlug: string
): Promise<{
  category: Category | null;
  subcategory: Subcategory | null;
  product: Product | null;
  variants: Variant[];
  requirements: ProductRequirement[];
  paymentMethods: PaymentMethod[];
}> {
  try {
    const supabase = createClient();

    const { data: category } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', catSlug)
      .eq('activo', true)
      .single();

    if (!category) {
      return {
        category: null,
        subcategory: null,
        product: null,
        variants: [],
        requirements: [],
        paymentMethods: [],
      };
    }

    const { data: subcategory } = await supabase
      .from('subcategories')
      .select('*')
      .eq('categoria_id', category.id)
      .eq('slug', subcatSlug)
      .eq('activo', true)
      .single();

    if (!subcategory) {
      return {
        category: category as Category,
        subcategory: null,
        product: null,
        variants: [],
        requirements: [],
        paymentMethods: [],
      };
    }

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('subcategoria_id', subcategory.id)
      .eq('slug', prodSlug)
      .eq('activo', true)
      .single();

    if (!product) {
      return {
        category: category as Category,
        subcategory: subcategory as Subcategory,
        product: null,
        variants: [],
        requirements: [],
        paymentMethods: [],
      };
    }

    // Cargar variantes con sus precios
    const { data: variants } = await supabase
      .from('variants')
      .select('*, prices(*)')
      .eq('producto_id', product.id)
      .eq('activo', true)
      .order('orden', { ascending: true });

    // Cargar requisitos del producto
    const { data: requirements } = await supabase
      .from('product_requirements')
      .select('*')
      .eq('producto_id', product.id)
      .order('orden', { ascending: true });

    // Cargar métodos de pago activos
    const { data: paymentMethods } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('activo', true);

    return {
      category: category as Category,
      subcategory: subcategory as Subcategory,
      product: product as Product,
      variants: (variants as Variant[]) || [],
      requirements: (requirements as ProductRequirement[]) || [],
      paymentMethods: (paymentMethods as PaymentMethod[]) || [],
    };
  } catch (error) {
    console.error('Error fetching product data:', error);
    return {
      category: null,
      subcategory: null,
      product: null,
      variants: [],
      requirements: [],
      paymentMethods: [],
    };
  }
}

export default async function ProductoPage({ params }: PageProps) {
  const { category, subcategory, product, variants, requirements, paymentMethods } =
    await getProductData(params.categoria, params.subcategoria, params.producto);

  if (!category || !subcategory || !product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* BREADCRUMBS */}
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
        <Link
          href={`/catalogo/${category.slug}/${subcategory.slug}`}
          className="hover:text-white"
        >
          {subcategory.nombre}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-brand-primary font-bold">{product.nombre}</span>
      </nav>

      {/* TÍTULO Y DESCRIPCIÓN */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          {product.nombre}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          {product.descripcion ||
            'Configura tus opciones, ingresa los datos de entrega y selecciona tu método de pago preferido.'}
        </p>
      </div>

      {/* CHECKOUT AISLADO CON ERROR BOUNDARY */}
      <ErrorBoundary fallbackTitle="Error en la pasarela de recarga">
        <ProductCheckoutClient
          product={product}
          variants={variants}
          requirements={requirements}
          paymentMethods={paymentMethods}
        />
      </ErrorBoundary>
    </div>
  );
}
