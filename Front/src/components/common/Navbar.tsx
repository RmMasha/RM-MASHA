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
  CheckCircle,
  Snowflake,
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
    <header className="sticky top-0 z-40 w-full bg-navy-deepest/90 backdrop-blur-md border-b border-neon-blue/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* BRAND LOGO */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-pitch-panel border border-neon-blue/50 flex items-center justify-center shadow-neon-border group-hover:border-neon-cyan transition-all">
              <Gem className="w-5 h-5 text-neon-blue group-hover:scale-110 transition-transform" />
              <Snowflake className="w-3 h-3 text-ice absolute -top-1 -right-1 animate-spin-slow" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-neon-cyan transition-colors flex items-center gap-1.5">
                RM & MASHA
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-magenta/20 text-magenta font-mono border border-magenta/40">
                  XMAS
                </span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-ice font-semibold -mt-1">
                Free Fire • Recargas Navideñas
              </span>
            </div>
          </Link>

          {/* DESKTOP MINIMALIST NAVIGATION */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              if (link.authOnly && !user) return null;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-neon-blue/15 text-neon-cyan border border-neon-blue/40 shadow-neon-border'
                      : 'text-slate-300 hover:text-white hover:bg-navy-surface/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAdminOrDev && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-magenta/15 text-magenta-light border border-magenta/40 hover:bg-magenta/25 transition-all shadow-[0_0_12px_rgba(255,0,127,0.3)] ml-2"
              >
                <Shield className="w-3.5 h-3.5 text-magenta" />
                Panel Admin
              </Link>
            )}
          </nav>

          {/* ACTION CONTROLS */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && profile ? (
              <>
                {/* SALDO / WALLET PILL (SPEC: PILL SHAPE WITH GOLD ACCENTS) */}
                <div className="flex items-center bg-pitch-panel border border-gold/40 rounded-full pl-3 pr-1 py-1 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  <div className="flex items-center gap-1.5 mr-2">
                    <Wallet className="w-3.5 h-3.5 text-gold" />
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Saldo:</span>
                    <span className="text-xs sm:text-sm font-black text-gold-bright tracking-tight">
                      {formatCurrency(profile.saldo_actual)}
                    </span>
                  </div>
                  <Link
                    href="/billetera?accion=recargar"
                    className="w-5 h-5 rounded-full bg-gold hover:bg-gold-amber text-slate-950 flex items-center justify-center font-bold text-xs transition-transform hover:scale-110 shadow-sm"
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
                    className="relative p-2 rounded-full bg-pitch-panel hover:bg-navy-surface border border-neon-blue/30 text-slate-300 hover:text-white transition-colors"
                    aria-label="Notificaciones"
                  >
                    <Bell className="w-4 h-4 text-ice" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-magenta text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* NOTIFICATIONS DROPDOWN */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-pitch-panel border border-neon-blue/40 shadow-2xl overflow-hidden z-50">
                      <div className="p-3 bg-navy-card border-b border-neon-blue/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-neon-blue" />
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                            Notificaciones
                          </h4>
                        </div>
                        <span className="text-[10px] text-ice-light">
                          {unreadCount} sin leer
                        </span>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-neon-blue/10">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No tienes notificaciones pendientes.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 text-xs transition-colors ${
                                !notif.leido ? 'bg-neon-blue/5' : 'hover:bg-navy-surface/40'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-slate-200 ${!notif.leido ? 'font-semibold text-white' : ''}`}>
                                  {notif.mensaje}
                                </p>
                                {!notif.leido && (
                                  <button
                                    onClick={() => markNotificationAsRead(notif.id)}
                                    title="Marcar como leída"
                                    className="text-slate-400 hover:text-neon-cyan shrink-0"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-ice" />
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
                    className="flex items-center gap-2 p-1 rounded-full bg-pitch-panel hover:bg-navy-surface border border-neon-blue/30 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-magenta to-navy-surface border border-magenta/40 flex items-center justify-center text-white font-bold text-xs">
                      {profile.nombre.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-pitch-panel border border-neon-blue/40 shadow-2xl p-2 z-50">
                      <div className="p-3 border-b border-neon-blue/20">
                        <p className="text-xs font-bold text-white truncate">{profile.nombre}</p>
                        <p className="text-[11px] text-slate-400 truncate">{profile.email}</p>
                        <div className="mt-2">
                          <span
                            className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                              profile.rol
                            )}`}
                          >
                            {profile.rol.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          href="/perfil"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-navy-surface rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-ice" />
                          Mi Perfil
                        </Link>
                        <Link
                          href="/billetera"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-navy-surface rounded-xl transition-colors"
                        >
                          <Wallet className="w-4 h-4 text-gold" />
                          Mi Billetera & Saldo
                        </Link>
                        <Link
                          href="/ordenes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-navy-surface rounded-xl transition-colors"
                        >
                          <ShoppingBag className="w-4 h-4 text-neon-blue" />
                          Historial de Pedidos
                        </Link>

                        {isAdminOrDev && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-magenta-light hover:bg-magenta/10 rounded-xl transition-colors font-bold"
                          >
                            <Shield className="w-4 h-4 text-magenta" />
                            Panel Administrativo
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-neon-blue/20">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
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
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-surface/80 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="btn-neon-pill px-5 py-1.5 text-xs font-bold"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-full bg-pitch-panel border border-neon-blue/30 text-slate-300 hover:text-white"
              aria-label="Abrir Menú"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neon-blue/20 bg-navy-deepest px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            if (link.authOnly && !user) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-navy-surface"
              >
                {link.label}
              </Link>
            );
          })}
          {isAdminOrDev && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-magenta-light bg-magenta/10 border border-magenta/30"
            >
              <Shield className="w-4 h-4 text-magenta" />
              Panel Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;

