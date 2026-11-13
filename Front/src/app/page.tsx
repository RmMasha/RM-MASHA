import Link from 'next/link';
import HeroChristmas from '@/components/home/HeroChristmas';
import { createClient } from '@/lib/supabase/server';
import { Category, Review } from '@/types/database.types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createClient();

  // Obtener categorías activas
  let categories: Category[] = [];
  try {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });
    if (data) categories = data;
  } catch (err) {
    console.error('Error fetching categories:', err);
  }

  // Obtener reseñas destacadas para el Home
  let reviews: (Review & { users?: { nombre: string; nickname?: string | null; avatar_url?: string | null } })[] = [];
  try {
    const { data } = await supabase
      .from('reviews')
      .select('*, users(nombre, nickname, avatar_url)')
      .eq('entidad_tipo', 'general')
      .order('created_at', { ascending: false })
      .limit(6);
    if (data) reviews = data as any;
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }

  // Categorías de respaldo si aún no hay en la base de datos
  const fallbackCategories: any[] = [
    {
      id: '1',
      categoria_id: '1',
      nombre: 'Free Fire - Diamantes Directos',
      slug: 'free-fire',
      icono_url: null,
      descripcion: 'Recargas por ID oficial de jugador con acreditación inmediata y soporte garantizado.',
    },
    {
      id: '2',
      categoria_id: '2',
      nombre: 'Pases Booyah & Membresías',
      slug: 'pases-y-membresias',
      icono_url: null,
      descripcion: 'Pases de batalla mensuales, membresías semanales y mensuales con bonificaciones exclusivas.',
    },
    {
      id: '3',
      categoria_id: '3',
      nombre: 'Servicios para Otros Juegos',
      slug: 'otros-juegos',
      icono_url: null,
      descripcion: 'Monedas virtuales, tarjetas de regalo y pases para los títulos más populares.',
    },
  ];

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* 1. SECCIÓN HERO */}
      <HeroChristmas />

      {/* 2. CATÁLOGO PRINCIPAL DE CATEGORÍAS */}
      <section className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-ice/10 border border-ice/30 text-ice text-xs font-mono tracking-widest uppercase mb-3">
            <span>⚡</span> Catálogo de Servicios Oficiales
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-pure uppercase tracking-wider">
            Selecciona tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-ice to-white drop-shadow-[0_0_15px_rgba(0,210,255,0.5)]">Categoría</span>
          </h2>
          <p className="text-sm md:text-base text-ice/70 mt-2 font-mono">
            Acceso directo a recargas automáticas con tu saldo interno o métodos de pago directos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {displayCategories.map((cat: any, idx: number) => (
            <div
              key={cat.id || cat.categoria_id}
              className="cyber-panel rounded-2xl p-6 lg:p-8 flex flex-col justify-between group hover:border-neon transition-all duration-300 relative overflow-hidden"
            >
              {/* Adorno sutil de escarcha en la esquina */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-neon/10 rounded-full blur-2xl group-hover:bg-neon/20 transition-all pointer-events-none" />

              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy via-pitch to-navy border border-neon/30 flex items-center justify-center text-neon text-2xl mb-6 shadow-[0_0_15px_rgba(0,210,255,0.2)] group-hover:scale-105 group-hover:border-neon transition-transform overflow-hidden">
                  {cat.imagen_url ? (
                    <img src={cat.imagen_url} alt={cat.nombre} className="w-full h-full object-cover" />
                  ) : (
                    idx === 0 ? '💎' : idx === 1 ? '🎟️' : '🎮'
                  )}
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-neon/10 text-neon border border-neon/20 mb-2">
                  Catálogo Nivel 1
                </div>

                <h3 className="text-xl font-bold text-pure group-hover:text-neon transition-colors mb-2">
                  {cat.nombre}
                </h3>

                <p className="text-xs sm:text-sm text-ice/70 line-clamp-3 mb-6 font-mono leading-relaxed">
                  {cat.descripcion || 'Servicios automatizados con los mejores precios del mercado para jugadores y revendedores.'}
                </p>
              </div>

              <div className="pt-4 border-t border-neon/15 flex items-center justify-between">
                <span className="text-xs font-mono text-gold flex items-center gap-1">
                  <span>★</span> Entrega Inmediata
                </span>
                <Link
                  href={`/catalogo/${cat.slug}`}
                  className="btn-neon-pill px-5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5"
                >
                  Explorar
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CARACTERÍSTICAS / PROPUESTAS DE VALOR DE RM & MASHA */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="cyber-panel rounded-3xl p-8 md:p-12 relative overflow-hidden border-neon/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-magenta/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
            <span className="text-xs font-mono uppercase text-magenta tracking-widest">
              Tecnología & Eficiencia
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-pure uppercase tracking-wider mt-1">
              ¿Por qué recargar con <span className="text-neon">RM & Masha</span>?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="bg-navy/70 border border-neon/20 rounded-2xl p-5 hover:border-neon transition-colors">
              <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold mb-3 text-lg">
                ⚡
              </div>
              <h4 className="text-base font-bold text-pure mb-1">Billetera Automatizada</h4>
              <p className="text-xs text-ice/70 font-mono leading-relaxed">
                Paga instantáneamente con tu saldo disponible. La orden se confirma y procesa al segundo sin esperas manuales.
              </p>
            </div>

            <div className="bg-navy/70 border border-neon/20 rounded-2xl p-5 hover:border-neon transition-colors">
              <div className="w-10 h-10 rounded-full bg-magenta/15 border border-magenta/40 flex items-center justify-center text-magenta mb-3 text-lg">
                👑
              </div>
              <h4 className="text-base font-bold text-pure mb-1">Precios por Rol</h4>
              <p className="text-xs text-ice/70 font-mono leading-relaxed">
                Descuentos progresivos para Revendedores y Clientes Especiales. A mayor nivel, mayor rentabilidad para tu negocio.
              </p>
            </div>

            <div className="bg-navy/70 border border-neon/20 rounded-2xl p-5 hover:border-neon transition-colors">
              <div className="w-10 h-10 rounded-full bg-ice/15 border border-ice/40 flex items-center justify-center text-ice mb-3 text-lg">
                🛡️
              </div>
              <h4 className="text-base font-bold text-pure mb-1">Aislamiento Seguro</h4>
              <p className="text-xs text-ice/70 font-mono leading-relaxed">
                Tus datos de cuenta y pagos están blindados con cifrado PostgreSQL a nivel de fila (RLS) y almacenamiento seguro.
              </p>
            </div>

            <div className="bg-navy/70 border border-neon/20 rounded-2xl p-5 hover:border-neon transition-colors">
              <div className="w-10 h-10 rounded-full bg-neon/15 border border-neon/40 flex items-center justify-center text-neon mb-3 text-lg">
                🎁
              </div>
              <h4 className="text-base font-bold text-pure mb-1">Promociones & Recompensas</h4>
              <p className="text-xs text-ice/70 font-mono leading-relaxed">
                Bonos especiales en recargas de saldo y sorteos exclusivos en nuestra comunidad de WhatsApp y Telegram.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RESEÑAS Y TESTIMONIOS DE LA COMUNIDAD (REALES) */}
      <section id="comentarios" className="container mx-auto px-4 sm:px-6 scroll-mt-24">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-mono uppercase text-neon tracking-widest">
              Opiniones Verificadas
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-pure uppercase tracking-wider mt-1">
              Testimonios de la <span className="text-magenta">Comunidad</span>
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="text-xs font-mono text-ice hover:text-neon underline underline-offset-4 mt-2 md:mt-0 transition-colors"
          >
            Ver más productos y valoraciones →
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r: any) => (
              <div
                key={r.id || r.review_id}
                className="cyber-panel rounded-2xl p-6 flex flex-col justify-between hover:border-ice/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1 text-gold mb-3">
                    {Array.from({ length: r.calificacion || 5 }).map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-pure/90 font-mono leading-relaxed mb-4 italic">
                    "{r.comentario_texto}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-neon/15">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon to-magenta flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                    {r.users?.avatar_url ? (
                      <img src={r.users.avatar_url} alt={r.users?.nombre} className="w-full h-full object-cover" />
                    ) : (
                      r.users?.nombre?.charAt(0) || 'U'
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-pure">
                      {r.users?.nombre || 'Gamer Verificado'}
                    </div>
                    {r.users?.nickname && (
                      <div className="text-[10px] font-mono text-neon">
                        ID: @{r.users.nickname}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cyber-panel rounded-2xl p-8 text-center max-w-xl mx-auto border-neon/20">
            <div className="w-12 h-12 rounded-full bg-neon/10 border border-neon/30 flex items-center justify-center text-neon mx-auto mb-3 text-xl">
              ⭐
            </div>
            <h3 className="text-base font-bold text-pure mb-1">Aún no hay reseñas registradas</h3>
            <p className="text-xs text-ice/70 font-mono mb-5">
              Sé el primero en dejar tu reseña verificada de la comunidad tras recargar en la tienda.
            </p>
            <Link
              href="/catalogo"
              className="btn-neon-pill px-6 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              Explorar Catálogo
            </Link>
          </div>
        )}
      </section>

      {/* 5. BANNER FINAL CTA */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="cyber-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden border-neon/40 shadow-neon">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="text-2xl md:text-4xl font-black text-pure uppercase tracking-wider mb-4">
              ¿Listo para dominar las <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-ice to-white">Partidas de Free Fire</span>?
            </h2>
            <p className="text-sm text-ice/80 font-mono mb-8 max-w-xl mx-auto">
              Crea tu cuenta, recarga tu saldo interno y disfruta de transacciones automatizadas al instante con las mejores tarifas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalogo"
                className="btn-neon-pill px-8 py-3 text-sm font-bold uppercase tracking-wider shadow-neon"
              >
                Ver Catálogo Completo
              </Link>
              <Link
                href="/registro"
                className="btn-ice-pill px-8 py-3 text-sm font-bold uppercase tracking-wider"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

