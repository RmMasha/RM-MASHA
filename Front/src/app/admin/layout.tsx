'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleBadge } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { ChevronDown, X, Layers, ArrowLeft } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bloquea el scroll de fondo cuando el menú selector está abierto
  useBodyScrollLock(mobileMenuOpen);

  const isStaff = profile?.rol === 'admin' || profile?.rol === 'programador';

  useEffect(() => {
    // Solo evaluar redirección cuando la sesión y el perfil han terminado de cargarse
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=' + encodeURIComponent(pathname));
      } else if (profile && !isStaff) {
        router.push('/?error=unauthorized');
      }
    }
  }, [user, profile, loading, isStaff, pathname, router]);

  // Cerrar el menú selector automáticamente al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (loading || (!profile && user) || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center font-mono">
        <div className="cyber-panel p-8 rounded-2xl max-w-md border-neon/40">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-magenta/20 border border-magenta flex items-center justify-center text-magenta animate-pulse">
            🔒
          </div>
          <h2 className="text-lg font-bold text-pure uppercase tracking-wider mb-2">
            Verificando Credenciales de Comando
          </h2>
          <p className="text-xs text-ice/70">
            Validando permisos administrativos y niveles de seguridad RLS...
          </p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin/usuarios', label: 'Gestor de Usuarios', icon: '👥' },
    { href: '/admin/pedidos', label: 'Gestor de Pedidos', icon: '📦' },
    { href: '/admin/recargas', label: 'Solicitudes de Recarga', icon: '💳' },
    { href: '/admin/saldo-manual', label: 'Ajuste Manual de Saldo', icon: '⚡' },
    { href: '/admin/catalogo', label: 'Catálogo & Precios por Rol', icon: '💎' },
    { href: '/admin/metodos-pago', label: 'Métodos de Pago', icon: '🏦' },
    { href: '/admin/comentarios', label: 'Referencias del Hero & Reseñas', icon: '🌟' },
    { href: '/admin/redes', label: 'Redes Sociales', icon: '🌐' },
    { href: '/admin/notificaciones', label: 'Plantillas de Notificaciones', icon: '🔔' },
    { href: '/admin/apariencia', label: 'Apariencia & Marca', icon: '🎨' },
  ];

  const currentSection =
    navLinks.find((link) => pathname === link.href || pathname.startsWith(`${link.href}/`)) ||
    navLinks[0];

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      {/* ========================================================= */}
      {/* CABECERA COMPACTA PARA MÓVIL: BOTÓN SELECTOR DE APARTADOS */}
      {/* ========================================================= */}
      <header className="md:hidden sticky top-0 z-40 bg-pitch/95 backdrop-blur-md border-b border-neon/20 p-3 sm:p-4 space-y-2.5">
        {/* Fila 1: Logo y usuario */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon animate-pulse" />
            <h2 className="text-sm font-black text-white tracking-wider uppercase">
              RM & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-ice to-pure-white">MASHA</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={getRoleBadge(profile?.rol || 'admin')}>
              {profile?.rol}
            </span>
            <span className="text-[10px] font-mono text-ice/70 truncate max-w-[110px]">
              {profile?.nombre}
            </span>
          </div>
        </div>

        {/* Fila 2: Botón Selector de Apartado */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-navy/90 border border-neon/30 hover:border-ice/60 text-white font-mono text-xs uppercase tracking-wider transition-all"
        >
          <div className="flex items-center gap-2.5 truncate">
            <span className="text-[10px] text-ice/60 uppercase font-bold">Apartado:</span>
            <span className="text-base">{currentSection.icon}</span>
            <span className="font-bold text-white truncate">{currentSection.label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-ice shrink-0 pl-2">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-pitch border border-ice/20 text-ice">
              {mobileMenuOpen ? 'Cerrar' : 'Cambiar'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''
                }`}
            />
          </div>
        </button>
      </header>

      {/* ========================================================= */}
      {/* MENÚ FLOTANTE / CAJÓN DE APARTADOS (CON SCROLL AISLADO)   */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-3 sm:p-6 overscroll-contain animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-lg mx-auto bg-pitch border border-neon/30 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[82vh] overscroll-contain space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Cajón */}
            <div className="flex items-center justify-between pb-3 border-b border-neon/20">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-neon">
                  Panel de Control
                </span>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Módulos de Administración
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl bg-navy border border-neon/20 text-ice hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista con Scroll Aislado (Solo hace scroll en este apartado) */}
            <div className="space-y-1.5 overflow-y-auto overscroll-contain flex-1 pr-1 max-h-[52vh]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${isActive
                        ? 'btn-neon-pill font-bold'
                        : 'text-ice/70 hover:text-white hover:bg-navy/70 border border-transparent hover:border-neon/30'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{link.icon}</span>
                      <span className="font-semibold">{link.label}</span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold">
                        Actual
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Footer del Cajón */}
            <div className="pt-3 border-t border-neon/20 space-y-2">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full btn-ice-pill py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-ice"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la Tienda</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SIDEBAR ADMINISTRATIVO PARA DESKTOP (STICKY CON SCROLL AISLADO) */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col md:w-64 lg:w-72 sticky top-0 h-screen overflow-y-auto overscroll-contain bg-pitch/95 border-r border-neon/20 p-5 lg:p-6 shrink-0 z-20">
        {/* Cabecera del Sidebar */}
        <div className="pb-5 mb-5 border-b border-neon/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-neon animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-ice/70">
              Terminal de Control
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-wider uppercase">
            RM & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon via-ice to-pure-white">MASHA</span>
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className={getRoleBadge(profile?.rol || 'admin')}>
              {profile?.rol}
            </span>
            <span className="text-[11px] font-mono text-ice/60 truncate">
              {profile?.nombre}
            </span>
          </div>
        </div>

        {/* Enlaces de Navegación del Panel con scroll propio */}
        <nav className="space-y-1.5 flex-1 overflow-y-auto overscroll-contain pr-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${isActive
                    ? 'btn-neon-pill font-bold'
                    : 'text-ice/70 hover:text-white hover:bg-navy/60 hover:border-neon/30'
                  }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar */}
        <div className="pt-5 mt-5 border-t border-neon/20 space-y-2">
          <Link
            href="/"
            className="w-full btn-ice-pill py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-ice"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Tienda</span>
          </Link>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* ÁREA DE CONTENIDO PRINCIPAL (SCROLL NATURAL DEL SISTEMA)  */}
      {/* ========================================================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
