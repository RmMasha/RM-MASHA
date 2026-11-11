import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductCheckoutClient from '@/components/catalog/ProductCheckoutClient';
import { Category, Subcategory, Product, Variant, Price, ProductRequirement, PaymentMethod, Review } from '@/types/database.types';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    categoria: string;
    subcategoria: string;
    producto: string;
  };
}

export default async function DetalleProductoPage({ params }: Props) {
  const supabase = createClient();
  const { categoria: catSlug, subcategoria: subSlug, producto: prodSlug } = params;

  // 1. Obtener la categoría
  const { data: categoria } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', catSlug)
    .single();

  if (!categoria) notFound();

  // 2. Obtener la subcategoría
  const catId = (categoria as Category).id || (categoria as Category).categoria_id;
  const { data: subcategoria } = await supabase
    .from('subcategories')
    .select('*')
    .eq('categoria_id', catId)
    .eq('slug', subSlug)
    .single();

  if (!subcategoria) notFound();

  // 3. Obtener el producto
  const subId = (subcategoria as Subcategory).id || (subcategoria as Subcategory).subcategoria_id;
  const { data: producto } = await supabase
    .from('products')
    .select('*')
    .eq('subcategoria_id', subId)
    .eq('slug', prodSlug)
    .single();

  if (!producto) notFound();

  const prodObj = producto as Product;
  const prodId = prodObj.id || prodObj.producto_id;

  // 4. Obtener las variantes del producto con sus precios
  const { data: variantsData } = await supabase
    .from('variants')
    .select('*, prices(*)')
    .eq('producto_id', prodId)
    .order('orden', { ascending: true });

  const variants = (variantsData || []) as (Variant & { prices: Price[] })[];

  // 5. Obtener los requisitos del producto (ID de Jugador, etc.)
  const { data: reqsData } = await supabase
    .from('product_requirements')
    .select('*')
    .eq('producto_id', prodId)
    .order('orden', { ascending: true });

  const requirements = (reqsData || []) as ProductRequirement[];

  // 6. Obtener métodos de pago activos
  const { data: payMethodsData } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('activo', true);

  const paymentMethods = (payMethodsData || []) as PaymentMethod[];

  // 7. Obtener reseñas del producto
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*, users(nombre, nickname, avatar_url)')
    .eq('entidad_tipo', 'producto')
    .eq('entidad_id', prodId)
    .order('created_at', { ascending: false });

  const initialReviews = (reviewsData || []) as (Review & { users?: { nombre: string; nickname?: string | null; avatar_url?: string | null } })[];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Miga de Pan (Breadcrumb Completo de 4 Niveles) */}
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6 flex-wrap">
        <Link href="/" className="hover:text-neon transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-neon transition-colors">Catálogo</Link>
        <span>/</span>
        <Link href={`/catalogo/${catSlug}`} className="hover:text-neon transition-colors">{(categoria as Category).nombre}</Link>
        <span>/</span>
        <Link href={`/catalogo/${catSlug}/${subSlug}`} className="hover:text-neon transition-colors">{(subcategoria as Subcategory).nombre}</Link>
        <span>/</span>
        <span className="text-pure font-bold">{prodObj.nombre}</span>
      </nav>

      {/* Cabecera del Producto */}
      <div className="cyber-panel rounded-3xl p-6 md:p-8 mb-8 border-neon/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[11px] font-mono uppercase mb-2">
              <span>❄</span> Nivel 4: Configuración & Entrega Inmediata
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-pure uppercase tracking-wider">
              {prodObj.nombre}
            </h1>
            <p className="text-xs md:text-sm text-ice/80 font-mono mt-1 max-w-2xl">
              {prodObj.descripcion || 'Servicio de recarga directa a cuenta oficial por ID.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-full bg-neon/15 border border-neon/30 text-neon">
              Soporte 24/7 Activo
            </span>
          </div>
        </div>
      </div>

      {/* Componente Interactivo de Selección, Requisitos y Liquidación */}
      <ProductCheckoutClient
        product={prodObj}
        variants={variants}
        requirements={requirements}
        paymentMethods={paymentMethods}
        initialReviews={initialReviews}
        categorySlug={catSlug}
        subcategorySlug={subSlug}
      />
    </div>
  );
}

