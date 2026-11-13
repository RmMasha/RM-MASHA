import React from 'react';
import Link from 'next/link';
import { Gem, MessageCircle, Send, Video, ShieldCheck, Heart, Snowflake } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-pitch-panel border-t border-neon-blue/20 mt-20 relative overflow-hidden">
      {/* Resplandor decorativo de hielo */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-neon-blue/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* BRAND */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pitch-black border border-neon-blue/50 flex items-center justify-center text-neon-blue shadow-neon-border">
                <Gem className="w-4 h-4" />
              </div>
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                RM & MASHA
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma gamer de recargas directas por ID para Free Fire y videojuegos. Entrega automatizada y soporte en vivo.
            </p>
          </div>

          {/* NAVEGACIÓN RÁPIDA */}
          <div>
            <h4 className="text-xs font-extrabold text-neon-blue uppercase tracking-wider mb-4">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/catalogo" className="hover:text-ice transition-colors">
                  Catálogo de Juegos
                </Link>
              </li>
              <li>
                <Link href="/catalogo/free-fire" className="hover:text-ice transition-colors">
                  Diamantes Free Fire
                </Link>
              </li>
              <li>
                <Link href="/billetera" className="hover:text-ice transition-colors">
                  Recargar Mi Billetera
                </Link>
              </li>
              <li>
                <Link href="/ordenes" className="hover:text-ice transition-colors">
                  Seguimiento de Pedidos
                </Link>
              </li>
            </ul>
          </div>

          {/* COMUNIDAD Y REDES */}
          <div>
            <h4 className="text-xs font-extrabold text-magenta uppercase tracking-wider mb-4">
              Comunidad & Soporte
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <a
                  href="https://wa.me/584121234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  WhatsApp Oficial
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/rmmasha_oficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-neon-cyan transition-colors"
                >
                  <Send className="w-4 h-4 text-neon-blue" />
                  Canal de Telegram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@rmmasha"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-magenta-light transition-colors"
                >
                  <Video className="w-4 h-4 text-magenta" />
                  TikTok @rmmasha
                </a>
              </li>
            </ul>
          </div>

          {/* SEGURIDAD & LEGAL */}
          <div>
            <h4 className="text-xs font-extrabold text-ice uppercase tracking-wider mb-4">
              Seguridad & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/terminos" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li className="pt-2 flex items-center gap-1.5 text-xs text-neon-cyan font-semibold">
                <ShieldCheck className="w-4 h-4" />
                Transacciones Encriptadas SSL
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-neon-blue/15 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} RM & MASHA. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5 text-ice-light">
            Cyber Winter Edition creada con <Heart className="w-3.5 h-3.5 text-magenta fill-magenta" /> para gamers
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

