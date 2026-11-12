import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Category, Subcategory } from '@/types/database.types';
import EntityReviewsSection from '@/components/common/EntityReviewsSection';

export const dynamic = 'force-dynamic';

interface Props {
  params: {
    categoria: string;
  };
}

export default async function CategoriaNivelPage({ params }: Props) {
  const supabase = createClient();
  const { categoria: categoriaSlug } = params;

  // 1. Obtener la categoría
  const { data: categoria } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categoriaSlug)
    .single();

  if (!categoria) {
    notFound();
  }

  // 2. Obtener las subcategorías activas
  const catId = (categoria as Category).id || (categoria as Category).categoria_id || '';
  const { data: subcategorias } = await supabase
    .from('subcategories')
    .select('*')
    .eq('categoria_id', catId)
    .eq('activo', true)
    .order('orden', { ascending: true });

  const subList: Subcategory[] = subcategorias || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Miga de Pan (Breadcrumb) */}
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6">
        <Link href="/" className="hover:text-neon transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/catalogo" className="hover:text-neon transition-colors">Catálogo</Link>
        <span>/</span>
        <span className="text-pure font-bold">{(categoria as Category).nombre}</span>
      </nav>

      {/* Cabecera de Categoría */}
      <div className="cyber-panel rounded-3xl p-6 md:p-10 mb-10 border-neon/30 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon/10 border border-neon/30 text-neon text-[11px] font-mono uppercase mb-3">
            <span>❄</span> Nivel 2: Subcategorías
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-pure uppercase tracking-wider">
            {(categoria as Category).nombre}
          </h1>
          <p className="text-xs md:text-sm text-ice/80 font-mono mt-2 leading-relaxed">
            {(categoria as Category).descripcion || 'Selecciona una subcategoría para ver los paquetes de diamantes y servicios disponibles.'}
          </p>
        </div>
      </div>

      {/* Grid de Subcategorías */}
      <div className="mb-10">
        <h2 className="text-xl font-bold uppercase tracking-wider text-pure mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_8px_#00D2FF]" />
          Subcategorías Disponibles ({subList.length})
        </h2>

        {subList.length === 0 ? (
          <div className="cyber-panel rounded-2xl p-10 text-center">
            <p className="text-sm font-mono text-ice/70">
              No hay subcategorías activas en esta sección por el momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subList.map((sub, idx) => (
              <Link
                key={sub.id || sub.subcategoria_id}
                href={`/catalogo/${categoriaSlug}/${sub.slug}`}
                className="cyber-panel rounded-2xl p-6 group hover:border-neon transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-navy border border-neon/30 flex items-center justify-center text-xl mb-4 text-ice group-hover:scale-105 transition-transform overflow-hidden">
                    {sub.imagen_url ? (
                      <img src={sub.imagen_url} alt={sub.nombre} className="w-full h-full object-cover" />
                    ) : (
                      idx % 2 === 0 ? '⚡' : '🔥'
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-pure group-hover:text-neon transition-colors mb-2">
                    {sub.nombre}
                  </h3>
                  <p className="text-xs text-ice/70 font-mono leading-relaxed line-clamp-2">
                    {sub.descripcion || 'Paquetes de entrega inmediata por ID oficial.'}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-neon/15 flex items-center justify-between text-xs font-mono">
                  <span className="text-ice/70">Nivel 2 de Catálogo</span>
                  <span className="text-neon font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Ver Productos →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reseñas Multinivel (Categoría) */}
      <EntityReviewsSection
        entidadTipo="categoria"
        entidadId={catId}
        entidadNombre={(categoria as Category).nombre}
      />
    </div>
  );
}

