import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Category, Subcategory, Product } from '@/types/database.types';
import EntityReviewsSection from '@/components/common/EntityReviewsSection';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    categoria: string;
    subcategoria: string;
  };
}

export default async function SubcategoriaProductosPage({ params }: Props) {
  const supabase = createClient();
  const { categoria: catSlug, subcategoria: subSlug } = params;

  // 1. Obtener la categoría
  const { data: categoria } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', catSlug)
    .single();

  if (!categoria) {
    notFound();
  }

  // 2. Obtener la subcategoría
  const catId = (categoria as Category).id || (categoria as Category).categoria_id || '';
  const { data: subcategoria } = await supabase
    .from('subcategories')
    .select('*')
    .eq('categoria_id', catId)
    .eq('slug', subSlug)
    .single();

  if (!subcategoria) {
    notFound();
  }

  // 3. Obtener los productos activos de esta subcategoría
  const subId = (subcategoria as Subcategory).id || (subcategoria as Subcategory).subcategoria_id || '';
  const { data: productos } = await supabase
    .from('products')
    .select('*, variants(*, prices(*))')
    .eq('subcategoria_id', subId)
    .eq('activo', true)
    .order('orden', { ascending: true });

  const productList: (Product & { variants?: any[] })[] = productos || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Miga de Pan (Breadcrumb) */}
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6 flex-wrap">
        <Link href="/" className="hover:text-neon transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-neon transition-colors">Catálogo</Link>
        <span>/</span>
        <Link href={`/catalogo/${catSlug}`} className="hover:text-neon transition-colors">{(categoria as Category).nombre}</Link>
        <span>/</span>
        <span className="text-pure font-bold">{(subcategoria as Subcategory).nombre}</span>
      </nav>

      {/* Cabecera de Subcategoría */}
      <div className="cyber-panel rounded-3xl p-6 md:p-10 mb-10 border-neon/30 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-magenta/10 border border-magenta/30 text-magenta text-[11px] font-mono uppercase mb-3">
            <span>❄</span> Nivel 3: Productos Disponibles
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-pure uppercase tracking-wider">
            {(subcategoria as Subcategory).nombre}
          </h1>
          <p className="text-xs md:text-sm text-ice/80 font-mono mt-2 leading-relaxed">
            {(subcategoria as Subcategory).descripcion || 'Selecciona el paquete deseado para configurar tu ID y método de pago.'}
          </p>
        </div>
      </div>

      {/* Grid de Productos */}
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-pure mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
          Lista de Productos ({productList.length})
        </h2>

        {productList.length === 0 ? (
          <div className="cyber-panel rounded-2xl p-10 text-center">
            <p className="text-sm font-mono text-ice/70">
              No hay productos registrados en esta subcategoría actualmente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productList.map((prod) => (
              <div
                key={prod.id || prod.producto_id}
                className="cyber-panel rounded-2xl p-6 flex flex-col justify-between hover:border-neon transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-neon/15 text-neon border border-neon/30">
                      Entrega por ID
                    </span>
                    <span className="text-xs font-mono text-gold flex items-center gap-1">
                      <span>★</span> Garantizado
                    </span>
                  </div>

                  {prod.imagen_url && (
                    <div className="w-full h-32 rounded-xl overflow-hidden mb-4 border border-neon/20 bg-pitch">
                      <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-pure mb-2">
                    {prod.nombre}
                  </h3>

                  <p className="text-xs text-ice/70 font-mono leading-relaxed mb-6 line-clamp-3">
                    {prod.descripcion || 'Recarga oficial sin riesgo de ban, acreditación rápida.'}
                  </p>

                  {/* Variantes mini-list */}
                  {prod.variants && prod.variants.length > 0 && (
                    <div className="text-[11px] font-mono text-ice/60 mb-4">
                      {prod.variants.length} {prod.variants.length === 1 ? 'paquete disponible' : 'paquetes disponibles'}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-neon/15 flex items-center justify-between">
                  <span className="text-xs font-mono text-ice/70">
                    Nivel 3
                  </span>
                  <Link
                    href={`/catalogo/${catSlug}/${subSlug}/${prod.slug}`}
                    className="btn-neon-pill px-5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    Comprar Ahora
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reseñas Multinivel (Subcategoría) */}
      <EntityReviewsSection
        entidadTipo="subcategoria"
        entidadId={subId}
        entidadNombre={(subcategoria as Subcategory).nombre}
      />
    </div>
  );
}

