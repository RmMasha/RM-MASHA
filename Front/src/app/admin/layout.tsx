'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Shield,
  ShoppingBag,
  Wallet,
  Layers,
  CreditCard,
  MessageSquare,
  Bell,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user || (profile?.rol !== 'admin' && profile?.rol !== 'programador')) {
        router.push('/');
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-slate-400 text-sm">
        Verificando permisos de administración...
      </div>
    );
  }

  if (!user || (profile?.rol !== 'admin' && profile?.rol !== 'programador')) {
    return null;
  }

  const adminNav = [
    { label: 'Gestor de Pedidos', href: '/admin/pedidos', icon: ShoppingBag },
    { label: 'Recargas de Saldo', href: '/admin/recargas', icon: Wallet },
    { label: 'Ajuste Manual Saldo', href: '/admin/saldo-manual', icon: DollarSign },
    { label: 'Catálogo & Precios', href: '/admin/catalogo', icon: Layers },
    { label: 'Métodos de Pago', href: '/admin/metodos-pago', icon: CreditCard },
    { label: 'Reseñas & Hero', href: '/admin/comentarios', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER DE ADMIN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-surface-border gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-brand-primary flex items-center justify-center shadow-glow-red">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Panel de Administración</h1>
            <p className="text-xs text-slate-400">
              Conectado como: <strong className="text-brand-gold">{profile.nombre}</strong> ({profile.rol})
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-surface-card hover:bg-surface-hover border border-surface-border transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Tienda
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SIDEBAR DE NAVEGACIÓN */}
        <aside className="lg:col-span-3 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-glow-red'
                    : 'text-slate-300 hover:text-white hover:bg-surface-card border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* CONTENIDO DE LA PÁGINA ADMIN */}
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
