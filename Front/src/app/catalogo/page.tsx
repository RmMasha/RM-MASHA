import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Category, Product } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export default async function CatalogoGeneralPage() {
  const supabase = createClient();

  let categories: Category[] = [];
  let featuredProducts: (Product & { subcategories?: { nombre: string; categories?: { nombre: string; slug: string } } })[] = [];

  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });
    if (catData) categories = catData;

    const { data: prodData } = await supabase
      .from('products')
      .select('*, subcategories(nombre, categories(nombre, slug))')
      .eq('activo', true)
      .limit(8);
    if (prodData) featuredProducts = prodData as any;
  } catch (err) {
    console.error('Error fetching catalog data:', err);
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Miga de Pan (Breadcrumb) */}
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6">
        <Link href="/" className="hover:text-neon transition-colors">Inicio</Link>
        <span>/</span>
        <span className="text-pure font-bold">Catálogo General</span>
      </nav>

      {/* Cabecera de Página con Temática Navideña */}
      <div className="cyber-panel rounded-3xl p-6 md:p-10 mb-10 border-neon/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-3">
            <span>❄</span> Catálogo Oficial RM & Masha
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-pure uppercase tracking-wider">
            Explora Nuestras <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-ice to-white">Categorías</span>
          </h1>
          <p className="text-xs md:text-sm text-ice/80 font-mono mt-2 leading-relaxed">
            Navegación por niveles aislados. Selecciona tu juego o categoría para ver las subcategorías y paquetes de recarga disponibles.
          </p>
        </div>
      </div>

      {/* Cuadrícula de Categorías (Nivel 1) */}
      <div className="mb-14">
        <h2 className="text-xl font-bold uppercase tracking-wider text-pure mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
          Categorías Principales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={cat.id || cat.categoria_id}
              href={`/catalogo/${cat.slug}`}
              className="cyber-panel rounded-2xl p-6 group hover:border-neon transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-navy border border-neon/30 flex items-center justify-center text-xl mb-4 text-neon group-hover:scale-105 transition-transform overflow-hidden">
                  {cat.imagen_url ? (
                    <img src={cat.imagen_url} alt={cat.nombre} className="w-full h-full object-cover" />
                  ) : (
                    idx === 0 ? '💎' : idx === 1 ? '🎟️' : '🎮'
                  )}
                </div>
                <h3 className="text-lg font-bold text-pure group-hover:text-neon transition-colors mb-2">
                  {cat.nombre}
                </h3>
                <p className="text-xs text-ice/70 font-mono leading-relaxed line-clamp-2">
                  {cat.descripcion || 'Entregas instantáneas y soporte garantizado.'}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-neon/15 flex items-center justify-between text-xs font-mono">
                <span className="text-ice/70">Nivel 1 de Catálogo</span>
                <span className="text-neon font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Abrir →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Productos Destacados Rápidos */}
      {featuredProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-pure mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-magenta shadow-[0_0_8px_#FF007F]" />
            Productos Más Solicitados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id || prod.producto_id}
                className="cyber-panel rounded-2xl p-5 flex flex-col justify-between hover:border-magenta/50 transition-colors"
              >
                <div>
                  <div className="text-[10px] font-mono uppercase text-neon tracking-wider mb-1">
                    {prod.subcategories?.nombre || 'Free Fire'}
                  </div>
                  <h4 className="text-base font-bold text-pure mb-2">
                    {prod.nombre}
                  </h4>
                  <p className="text-xs text-ice/70 font-mono line-clamp-2 mb-4">
                    {prod.descripcion}
                  </p>
                </div>

                <div className="pt-3 border-t border-neon/15 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gold flex items-center gap-1">
                    <span>⚡</span> Instantáneo
                  </span>
                  <Link
                    href={`/catalogo/${prod.subcategories?.categories?.slug || 'free-fire'}/${prod.subcategoria_id}/${prod.slug}`}
                    className="btn-ice-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                  >
                    Ver Precios
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

