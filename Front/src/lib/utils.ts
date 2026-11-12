import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString || '';
  }
}

export function getRoleBadge(role: string): string {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ';
  switch (role) {
    case 'programador':
      return base + 'bg-magenta/20 text-magenta border-magenta shadow-[0_0_10px_rgba(255,0,127,0.3)]';
    case 'admin':
      return base + 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
    case 'revendedor_especial':
      return base + 'bg-gold/20 text-gold border-gold shadow-[0_0_10px_rgba(251,191,36,0.3)]';
    case 'revendedor':
      return base + 'bg-ice/20 text-ice border-ice shadow-[0_0_10px_rgba(125,211,252,0.3)]';
    case 'cliente_especial':
      return base + 'bg-neon/20 text-neon border-neon';
    default:
      return base + 'bg-navy/80 text-ice/80 border-neon/20';
  }
}

export const getRoleBadgeColor = getRoleBadge;

export function getOrderStatusBadge(status: string): string {
  const base = 'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold border ';
  switch (status) {
    case 'nuevo':
      return base + 'bg-gold/15 text-gold border-gold/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]';
    case 'confirmado':
      return base + 'bg-neon/15 text-neon border-neon/50 shadow-[0_0_10px_rgba(0,210,255,0.25)]';
    case 'entregado':
      return base + 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    case 'rechazado':
      return base + 'bg-magenta/15 text-magenta border-magenta/40 shadow-[0_0_10px_rgba(255,0,127,0.2)]';
    case 'aprobada':
      return base + 'bg-neon/15 text-neon border-neon/50 shadow-[0_0_10px_rgba(0,210,255,0.25)]';
    case 'pendiente':
      return base + 'bg-gold/15 text-gold border-gold/40 shadow-[0_0_10px_rgba(251,191,36,0.2)]';
    default:
      return base + 'bg-navy/60 text-ice/60 border-neon/20';
  }
}

export function validatePaymentReference(
  reference: string,
  formato?: string | null
): { isValid: boolean; message?: string } {
  const clean = (reference || '').trim();
  if (!clean) {
    return { isValid: false, message: 'La referencia o comprobante es obligatoria.' };
  }

  const fmt = (formato || 'alfanumerico').toLowerCase();

  if (fmt === 'solo_numeros') {
    const isNum = /^[0-9]+$/.test(clean);
    return isNum
      ? { isValid: true }
      : { isValid: false, message: 'Este método exige exclusivamente números (0-9).' };
  }

  if (fmt === 'solo_letras') {
    const isLetters = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(clean);
    return isLetters
      ? { isValid: true }
      : { isValid: false, message: 'Este método solo permite letras y espacios.' };
  }

  // Alfanumérico por defecto
  const isAlphaNum = /^[a-zA-Z0-9\-_#]+$/.test(clean);
  return isAlphaNum
    ? { isValid: true }
    : { isValid: false, message: 'Formato alfanumérico inválido (solo letras, dígitos y guiones).' };
}
