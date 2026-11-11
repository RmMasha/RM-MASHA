import React from 'react';
import Link from 'next/link';
import { HeroSection } from '@/components/home/HeroSection';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { createClient } from '@/lib/supabase/server';
import { Category, Review } from '@/types/database.types';
import { Zap, ShieldCheck, Gem, Flame, ArrowRight, Star, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getHomePageData(): Promise<{
  categories: Category[];
  heroReviews: Review[];
}> {
  try {
    const supabase = createClient();

    const [catRes, revRes] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true }),
      supabase
        .from('reviews')
        .select('*, users(nombre, nickname, avatar_url, pais)')
        .eq('destacado_hero', true)
        .eq('activo', true)
        .limit(6),
    ]);

    return {
      categories: (catRes.data as Category[]) || [],
      heroReviews: (revRes.data as Review[]) || [],
    };
  } catch (error) {
    console.error('Error al cargar datos del Home:', error);
    return { categories: [], heroReviews: [] };
  }
}

export default async function HomePage() {
  const { categories, heroReviews } = await getHomePageData();

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* 1. HERO SECTION CON BURBUJAS DE RESEÑAS */}
      <ErrorBoundary fallbackTitle="Hero temporalmente no disponible">
        <HeroSection featuredReviews={heroReviews} />
      </ErrorBoundary>

      {/* 2. CATEGORÍAS PRINCIPALES (CATÁLOGO AISLADO) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-brand-primary" />
              <span>Catálogo Oficial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Explora Nuestras Categorías
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors"
          >
            Ver catálogo completo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ErrorBoundary fallbackTitle="Error al cargar las categorías">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/catalogo/${cat.slug}`}
                className="group relative rounded-2xl bg-surface-card border border-surface-border p-6 hover:border-brand-primary/50 transition-all hover:scale-[1.02] shadow-xl overflow-hidden glow-border flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-glow-red group-hover:rotate-6 transition-transform">
                    <Gem className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">
                    {cat.nombre}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {cat.descripcion || 'Recargas seguras y entrega inmediata a tu cuenta de juego.'}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-surface-border/60 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
                  <span>Explorar productos</span>
                  <div className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ErrorBoundary>
      </section>

      {/* 3. PROPUESTAS DE VALOR Y SEGURIDAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-surface-card border border-surface-border p-8 lg:p-12 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-brand-gold">
              Ventajas Exclusivas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              ¿Por qué elegir RM & Masha?
            </h2>
            <p className="text-sm text-slate-400">
              Diseñado para jugadores que buscan inmediatez y revendedores que demandan los márgenes más competitivos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-surface/60 border border-surface-border/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Zap className="w-5 h-5 fill-brand-primary" />
              </div>
              <h4 className="font-bold text-white text-base">Compras con Saldo</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paga directamente con el saldo de tu billetera y tu pedido se confirma en milisegundos sin esperas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface/60 border border-surface-border/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Precios por Rol</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Desbloquea descuentos exclusivos según tu nivel: Cliente Especial, Revendedor y Revendedor VIP.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface/60 border border-surface-border/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 text-brand-cyan flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">100% Sin Riesgo</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Recargas oficiales procesadas únicamente con tu ID de jugador. Cero contraseñas requeridas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface/60 border border-surface-border/60 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base">Reseñas Verificadas</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Opiniones reales de miles de compradores satisfechos en cada nivel de nuestra tienda.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
