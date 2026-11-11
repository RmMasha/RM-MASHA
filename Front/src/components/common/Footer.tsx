import React from 'react';
import Link from 'next/link';
import { Gem, MessageCircle, Send, Video, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-surface-card border-t border-surface-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* BRAND */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
                <Gem className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                RM & MASHA
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              La plataforma número 1 para recargas de diamantes Free Fire, pases y servicios gamer con entrega inmediata y total seguridad.
            </p>
          </div>

          {/* NAVEGACIÓN RÁPIDA */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Navegación
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/catalogo" className="hover:text-brand-primary transition-colors">
                  Catálogo de Juegos
                </Link>
              </li>
              <li>
                <Link href="/catalogo/free-fire" className="hover:text-brand-primary transition-colors">
                  Diamantes Free Fire
                </Link>
              </li>
              <li>
                <Link href="/billetera" className="hover:text-brand-primary transition-colors">
                  Recargar Mi Saldo
                </Link>
              </li>
              <li>
                <Link href="/ordenes" className="hover:text-brand-primary transition-colors">
                  Seguimiento de Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* SOPORTE Y COMUNIDAD */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Comunidad & Soporte
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a
                  href="https://wa.me/584121234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  WhatsApp Oficial
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/rmmasha_oficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-sky-400 transition-colors"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  Canal de Telegram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@rmmasha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-pink-400 transition-colors"
                >
                  <Video className="w-4 h-4 text-pink-500" />
                  TikTok @rmmasha
                </a>
              </li>
            </ul>
          </div>

          {/* LEGAL & SEGURIDAD */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Seguridad & Legal
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/terminos" className="hover:text-slate-200 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-slate-200 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-slate-200 transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li className="pt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                Transacciones Encriptadas SSL
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} RM & MASHA. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Diseñado para la comunidad gamer con <Heart className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" />
          </p>
        </div>
      </div>
    </footer>
  );
}
