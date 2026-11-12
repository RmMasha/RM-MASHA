'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  ShieldCheck,
  Star,
  ArrowRight,
  Gift,
  Flame,
  Sparkles,
  Snowflake,
  CheckCircle2,
  Gamepad2,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { Review } from '@/types/database.types';
import HeroBackground from './HeroBackground';
import HeroReviewsFloat from './HeroReviewsFloat';

interface HeroProps {
  featuredReviews?: Review[];
}

export function HeroChristmas({ featuredReviews = [] }: HeroProps) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState('');
  const [selectedPack, setSelectedPack] = useState(2); // Default to 520 diamantes

  const defaultReviews = [
    {
      id: '1',
      nickname: 'Kevin_FF',
      texto: '¡Llegaron los 1060 diamantes en menos de 2 minutos! Súper recomendado.',
      estrellas: 5,
      avatar: 'K',
    },
    {
      id: '2',
      nickname: 'ValenGamer',
      texto: 'Pagué con saldo directo de mi billetera y la entrega fue automática. Excelente.',
      estrellas: 5,
      avatar: 'V',
    },
  ];

  const diamondPacks = [
    { id: 0, diamonds: '100 + 10', bonus: '+10%', price: '$1.15', tag: 'Básico' },
    { id: 1, diamonds: '310 + 31', bonus: '+10%', price: '$3.20', tag: 'Popular' },
    { id: 2, diamonds: '520 + 52', bonus: '+10%', price: '$5.25', tag: 'Más Vendido' },
    { id: 3, diamonds: '1,060 + 106', bonus: '+10%', price: '$10.50', tag: 'Pro' },
    { id: 4, diamonds: 'Pase Booyah', bonus: 'Pase', price: '$2.10', tag: 'Temporada' },
    { id: 5, diamonds: 'Membresía Semanal', bonus: 'VIP', price: '$1.99', tag: 'Ahorro' },
  ];

  const handleQuickRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerId.trim()) {
      router.push(`/catalogo/free-fire?player_id=${encodeURIComponent(playerId.trim())}`);
    } else {
      router.push('/catalogo/free-fire');
    }
  };

  return (
    <HeroBackground className="pt-6 pb-6 lg:pt-10 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: TITULARES Y BADGES FESTIVOS (7 COLS) */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">

            {/* BADGE FESTIVO NEÓN / MAGENTA */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pitch-panel border border-neon-blue/50 text-neon-cyan text-xs font-bold shadow-neon-border backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-magenta animate-pulse" />
              <span>TEMPORADA INVERNAL • RECARGAS OFICIALES FREE FIRE</span>
              <Snowflake className="w-3.5 h-3.5 text-ice animate-spin-slow" />
            </div>

            {/* TÍTULO 3D CON ESCARCHA Y NIEVE ACUMULADA EN LA PARTE SUPERIOR */}
            <div className="space-y-1">
              <div className="inline-block relative snow-cap">
                <span className="text-4xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pure-white via-ice-light to-neon-blue tracking-tight drop-shadow-[0_4px_16px_rgba(0,210,255,0.5)] block">
                  FREE FIRE
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Recargas al Instante con{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-ice to-magenta">
                  Temática Navideña
                </span>
              </h1>
            </div>

            {/* TEXTO DESCRIPTIVO EN BLANCO PURO Y CELESTE */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Diamantes oficiales garantizados, Pases Booyah y Membresías por tu{' '}
              <strong className="text-pure-white">ID de Jugador</strong>. Compra segura con acreditación{' '}
              <span className="text-neon-cyan font-bold">automatizada en &lt; 2 minutos</span>{' '}
              o paga al instante con tu <strong className="text-gold font-bold">Saldo Wallet</strong>.
            </p>

            {/* BOTONES EN FORMA DE PÍLDORA CON RESPLANDOR AZUL ELÉCTRICO */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/catalogo"
                className="btn-neon-pill w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-extrabold px-8 py-3.5"
              >
                <span>Ver Catálogo Navideño</span>
                <ArrowRight className="w-4 h-4 text-ice group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/billetera"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-pitch-panel/90 text-ice-light hover:text-white border border-ice/40 hover:border-neon-blue transition-all duration-300 font-bold text-sm shadow-ice-glow backdrop-blur-md"
              >
                <Wallet className="w-4 h-4 text-neon-cyan" />
                <span>Recargar Saldo Wallet</span>
              </Link>
            </div>

            {/* BADGES DE CONFIANZA EN CAJAS RECTANGULARES NEGRAS CON BORDE NEÓN */}
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-lg mx-auto lg:mx-0">
              <div className="cyber-panel p-3 rounded-2xl text-center lg:text-left backdrop-blur-md">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-gold">
                  <Star className="w-3.5 h-3.5 fill-gold" />
                  <span className="font-black text-white text-sm">4.9 / 5</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Opiniones Verificadas</p>
              </div>

              <div className="cyber-panel p-3 rounded-2xl text-center lg:text-left backdrop-blur-md">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-neon-cyan">
                  <Zap className="w-3.5 h-3.5 fill-neon-cyan" />
                  <span className="font-black text-white text-sm">&lt; 2 Min</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Entrega Inmediata</p>
              </div>

              <div className="cyber-panel p-3 rounded-2xl text-center lg:text-left backdrop-blur-md">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-magenta-light">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="font-black text-white text-sm">100% Legal</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Vía ID Oficial Garena</p>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: UI LIMPIA DE RECARGAS FREE FIRE (5 COLS) */}
          {/* (CERO PERSONAJES, CERO SILUETAS, CERO AVATARES)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">

            {/* PANEL PRINCIPAL CIBERNÉTICO DE RECARGA DIRECTA */}
            <div className="w-full max-w-md rounded-3xl cyber-panel p-6 relative overflow-hidden backdrop-blur-xl border border-neon-blue/40 shadow-[0_0_35px_rgba(0,210,255,0.2)]">

              {/* ESCARCHA SUPERIOR DEL PANEL */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

              {/* ENCABEZADO DE LA UI DE RECARGA */}
              <div className="flex items-center justify-between pb-4 border-b border-neon-blue/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-pitch-black border border-neon-blue/50 flex items-center justify-center text-neon-cyan shadow-neon-border">
                    <Gamepad2 className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">Recarga Rápida Free Fire</h3>
                    <p className="text-[10px] text-ice-light flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
                      Acreditación por ID Oficial
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-magenta/15 text-magenta-light font-bold border border-magenta/30">
                  Edición Invierno
                </span>
              </div>

              {/* FORMULARIO DE RECARGA INTERACTIVO */}
              <form onSubmit={handleQuickRecharge} className="mt-4 space-y-4">

                {/* PASO 1: ID DE JUGADOR */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-neon-blue/20 text-neon-cyan text-[10px] font-black flex items-center justify-center">
                        1
                      </span>
                      ID de Jugador (Free Fire)
                    </label>
                    <span className="text-[10px] text-slate-400">Solo números</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Ej: 1982736450"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-pitch-black/80 border border-neon-blue/30 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-colors"
                      maxLength={14}
                    />
                    {playerId.length >= 8 && (
                      <CheckCircle2 className="w-4 h-4 text-neon-cyan absolute right-3 top-3" />
                    )}
                  </div>
                </div>

                {/* PASO 2: SELECCIÓN DE PAQUETE DE DIAMANTES */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-neon-blue/20 text-neon-cyan text-[10px] font-black flex items-center justify-center">
                        2
                      </span>
                      Selecciona tu Paquete
                    </label>
                    <span className="text-[10px] text-gold font-bold flex items-center gap-0.5">
                      <Gift className="w-3 h-3" /> +10% Extra Navideño
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {diamondPacks.map((pack) => {
                      const isSelected = selectedPack === pack.id;
                      return (
                        <button
                          key={pack.id}
                          type="button"
                          onClick={() => setSelectedPack(pack.id)}
                          className={`relative p-2.5 rounded-xl text-left border transition-all duration-200 ${isSelected
                              ? 'bg-neon-blue/15 border-neon-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                              : 'bg-pitch-black/70 border-neon-blue/20 hover:border-neon-blue/50 text-slate-300'
                            }`}
                        >
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">💎</span>
                            <span className="text-xs font-bold text-white line-clamp-1">
                              {pack.diamonds}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5">
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-ice/10 text-ice-light font-medium">
                              {pack.tag}
                            </span>
                            <span className="text-xs font-extrabold text-gold">
                              {pack.price}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* INFORMACIÓN DE PAGO AUTOMÁTICO */}
                <div className="p-2.5 rounded-xl bg-pitch-black/80 border border-neon-blue/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-neon-blue/15 border border-neon-blue/40 flex items-center justify-center text-neon-cyan">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">Acreditación Automática</p>
                      <p className="text-[9px] text-slate-400">Paga con Saldo Wallet o Depósito Directo</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold text-neon-cyan uppercase">
                    &lt; 2 MIN
                  </span>
                </div>

                {/* BOTÓN PÍLDORA NEÓN DE ACCIÓN DIRECTA */}
                <button
                  type="submit"
                  className="btn-neon-pill w-full py-3 text-center font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                >
                  <span>Recargar Ahora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-3 text-center">
                <Link
                  href="/catalogo"
                  className="text-[11px] text-ice-light hover:text-white transition-colors underline underline-offset-2"
                >
                  Ver todos los juegos y opciones del catálogo completo
                </Link>
              </div>
            </div>

            {/* CÁPSULAS FLOTANTES DE REFERENCIAS EN TIEMPO REAL CON ROTACIÓN INFINITA (4s) */}
            <HeroReviewsFloat
              position="top-left"
              variant="cyan"
              defaultIndexOffset={0}
              intervalMs={4000}
            />

            <HeroReviewsFloat
              position="bottom-right"
              variant="magenta"
              defaultIndexOffset={2}
              intervalMs={4000}
            />

          </div>
        </div>
      </div>
    </HeroBackground>
  );
}

export default HeroChristmas;
