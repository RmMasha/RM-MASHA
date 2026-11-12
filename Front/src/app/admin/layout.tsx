'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleBadge } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const isStaff = profile?.rol === 'admin' || profile?.rol === 'programador';

  useEffect(() => {
    if (!loading && (!user || !isStaff)) {
      router.push('/login?redirect=' + encodeURIComponent(pathname));
    }
  }, [user, profile, loading, isStaff, pathname, router]);

  if (loading || !user || !isStaff) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center font-mono">
        <div className="cyber-panel p-8 rounded-2xl max-w-md border-neon/40 shadow-neon">
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
    { href: '/admin/pedidos', label: 'Gestor de Pedidos', icon: '📦' },
    { href: '/admin/recargas', label: 'Solicitudes de Recarga', icon: '💳' },
    { href: '/admin/saldo-manual', label: 'Ajuste Manual de Saldo', icon: '⚡' },
    { href: '/admin/catalogo', label: 'Catálogo & Precios por Rol', icon: '💎' },
    { href: '/admin/metodos-pago', label: 'Métodos de Pago', icon: '🏦' },
    { href: '/admin/comentarios', label: 'Referencias del Hero & Reseñas', icon: '🌟' },
    { href: '/admin/notificaciones', label: 'Plantillas de Notificaciones', icon: '🔔' },
    { href: '/admin/apariencia', label: 'Apariencia & Marca', icon: '🎨' },
  ];

  return (
    <div className="min-h-screen bg-navy flex flex-col md:flex-row">
      {/* SIDEBAR ADMINISTRATIVO */}
      <aside className="w-full md:w-64 lg:w-72 bg-pitch/95 border-b md:border-b-0 md:border-r border-neon/30 flex flex-col p-4 md:p-6 shrink-0 relative z-20">
        {/* Cabecera del Sidebar */}
        <div className="pb-6 mb-6 border-b border-neon/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-neon animate-pulse shadow-[0_0_10px_#00D2FF]" />
            <span className="text-xs font-mono uppercase tracking-widest text-ice/70">
              Terminal de Control
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-wider uppercase">
            RM & <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan via-ice to-pure-white">MASHA</span>
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

        {/* Enlaces de Navegación del Panel */}
        <nav className="space-y-1.5 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${isActive
                    ? 'btn-neon-pill font-bold shadow-neon'
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
        <div className="pt-6 mt-6 border-t border-neon/20 space-y-2">
          <Link
            href="/"
            className="w-full btn-ice-pill py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-ice"
          >
            <span>←</span> Volver a la Tienda
          </Link>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

