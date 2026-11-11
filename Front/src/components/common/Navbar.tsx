'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, getRoleBadgeColor, formatDate } from '@/lib/utils';
import {
  Gem,
  Wallet,
  Bell,
  User,
  Shield,
  LogOut,
  Menu,
  X,
  Plus,
  ShoppingBag,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';

export function Navbar() {
  const { user, profile, notifications, unreadCount, markNotificationAsRead, signOut } = useAuth();
  const pathname = usePathname();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdminOrDev = profile?.rol === 'admin' || profile?.rol === 'programador';

  const navLinks = [
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Billetera', href: '/billetera', authOnly: true },
    { label: 'Mis Pedidos', href: '/ordenes', authOnly: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform">
              <Gem className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-brand-primary transition-colors">
                RM & MASHA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-brand-gold font-semibold -mt-1">
                Recargas & Gaming
              </span>
            </div>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.authOnly && !user) return null;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-hover text-brand-primary font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-surface-hover/60'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAdminOrDev && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/20 transition-all shadow-glow-red"
              >
                <Shield className="w-4 h-4" />
                Panel Admin
              </Link>
            )}
          </nav>

          {/* RIGHT ACTION CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && profile ? (
              <>
                {/* SALDO / WALLET PILL */}
                <div className="flex items-center bg-surface-card border border-brand-gold/30 rounded-full pl-3 pr-1.5 py-1 shadow-glow-gold/20">
                  <div className="flex items-center gap-1.5 mr-2">
                    <Wallet className="w-4 h-4 text-brand-gold" />
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">Saldo:</span>
                    <span className="text-sm font-bold text-white tracking-tight">
                      {formatCurrency(profile.saldo_actual)}
                    </span>
                  </div>
                  <Link
                    href="/billetera?accion=recargar"
                    className="w-6 h-6 rounded-full bg-brand-gold hover:bg-brand-accent text-slate-950 flex items-center justify-center font-bold text-xs transition-transform hover:scale-110"
                    title="Recargar Saldo"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </Link>
                </div>

                {/* NOTIFICATIONS BELL */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setUserMenuOpen(false);
                    }}
                    className="relative p-2 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white transition-colors"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* NOTIFICATIONS DROPDOWN */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-surface-border shadow-2xl overflow-hidden z-50">
                      <div className="p-3 bg-surface-card border-b border-surface-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-brand-primary" />
                          <h4 className="text-sm font-bold text-white">Notificaciones</h4>
                        </div>
                        <span className="text-xs text-slate-400">
                          {unreadCount} sin leer
                        </span>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-sm text-slate-400">
                            No tienes notificaciones pendientes.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 text-xs sm:text-sm transition-colors ${
                                !notif.leido ? 'bg-brand-primary/5' : 'hover:bg-surface-hover/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-slate-200 ${!notif.leido ? 'font-semibold' : ''}`}>
                                  {notif.mensaje}
                                </p>
                                {!notif.leido && (
                                  <button
                                    onClick={() => markNotificationAsRead(notif.id)}
                                    title="Marcar como leída"
                                    className="text-slate-400 hover:text-brand-primary shrink-0"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {formatDate(notif.created_at)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* USER PROFILE DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserMenuOpen(!userMenuOpen);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-surface-card hover:bg-surface-hover border border-surface-border transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-sm">
                      {profile.nombre.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-surface-border shadow-2xl p-2 z-50">
                      <div className="p-3 border-b border-surface-border">
                        <p className="text-sm font-bold text-white truncate">{profile.nombre}</p>
                        <p className="text-xs text-slate-400 truncate">{profile.email}</p>
                        <div className="mt-2">
                          <span
                            className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                              profile.rol
                            )}`}
                          >
                            {profile.rol.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          Mi Perfil
                        </Link>
                        <Link
                          href="/billetera"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-brand-gold" />
                          Mi Billetera & Saldo
                        </Link>
                        <Link
                          href="/ordenes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-surface-hover rounded-lg transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-brand-cyan" />
                          Historial de Pedidos
                        </Link>

                        {isAdminOrDev && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors font-semibold"
                          >
                            <Shield className="w-4 h-4" />
                            Panel Administrativo
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-surface-border">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-surface-card transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-brand-primary to-brand-accent hover:opacity-90 shadow-glow-red transition-all"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-xl bg-surface-card border border-surface-border text-slate-300 hover:text-white"
              aria-label="Abrir Menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            if (link.authOnly && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-surface-hover"
              >
                {link.label}
              </Link>
            );
          })}
          {isAdminOrDev && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-semibold text-brand-primary bg-brand-primary/10 border border-brand-primary/20"
            >
              <Shield className="w-4 h-4" />
              Panel Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
