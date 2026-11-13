'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAppearance } from '@/context/AppearanceContext';
import { SocialLink } from '@/types/database.types';
import {
  Gem,
  MessageCircle,
  Send,
  Video,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Globe,
  ShieldCheck,
  Heart,
} from 'lucide-react';

const FALLBACK_SOCIALS: Partial<SocialLink>[] = [
  {
    id: 's1',
    nombre: 'WhatsApp Oficial',
    url: 'https://wa.me/584121234567',
    icono_nombre: 'message-circle',
    activo: true,
  },
  {
    id: 's2',
    nombre: 'Canal de Telegram',
    url: 'https://t.me/rmmasha_oficial',
    icono_nombre: 'send',
    activo: true,
  },
  {
    id: 's3',
    nombre: 'TikTok @rmmasha',
    url: 'https://tiktok.com/@rmmasha',
    icono_nombre: 'video',
    activo: true,
  },
];

export function Footer() {
  const { settings } = useAppearance();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const fetchSocials = async () => {
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (!error && data && data.length > 0) {
        setSocialLinks(data as SocialLink[]);
      } else {
        setSocialLinks(FALLBACK_SOCIALS as SocialLink[]);
      }
    } catch (err) {
      setSocialLinks(FALLBACK_SOCIALS as SocialLink[]);
    }
  };

  useEffect(() => {
    fetchSocials();

    // Actualización en tiempo real al cambiar redes en panel de administración
    const channel = supabase
      .channel('public:social_links_footer')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'social_links' },
        () => {
          fetchSocials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const renderSocialIcon = (link: SocialLink) => {
    if (link.icono_url) {
      return (
        <img
          src={link.icono_url}
          alt={link.nombre}
          className="w-4 h-4 object-contain rounded"
        />
      );
    }

    switch (link.icono_nombre) {
      case 'message-circle':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'send':
        return <Send className="w-4 h-4 text-neon-blue" />;
      case 'video':
        return <Video className="w-4 h-4 text-magenta" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-500" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'twitter':
        return <Twitter className="w-4 h-4 text-sky-400" />;
      default:
        return <Globe className="w-4 h-4 text-neon-cyan" />;
    }
  };

  const storeName = settings.site_name || 'RM & MASHA';

  return (
    <footer className="w-full bg-pitch-panel border-t border-neon-blue/20 mt-20 relative overflow-hidden">
      {/* Resplandor decorativo */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-neon-blue/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* BRAND */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pitch-black border border-neon-blue/50 flex items-center justify-center text-neon-blue shadow-neon-border overflow-hidden">
                {settings.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={storeName}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Gem className="w-4 h-4" />
                )}
              </div>
              <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                {storeName}
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

          {/* COMUNIDAD Y REDES (DINÁMICO CONECTADO AL PANEL ADMIN) */}
          <div>
            <h4 className="text-xs font-extrabold text-magenta uppercase tracking-wider mb-4">
              Comunidad & Soporte
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    {renderSocialIcon(link)}
                    <span>{link.nombre}</span>
                  </a>
                </li>
              ))}
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
          <p>© {new Date().getFullYear()} {storeName}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5 text-ice-light">
            Plataforma creada con <Heart className="w-3.5 h-3.5 text-magenta fill-magenta" /> para la comunidad gamer
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
