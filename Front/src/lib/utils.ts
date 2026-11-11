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

export function formatDate(dateString: string): string {
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
    return dateString;
  }
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case 'programador':
      return 'bg-purple-900/60 text-purple-300 border-purple-500/50';
    case 'admin':
      return 'bg-red-900/60 text-red-300 border-red-500/50';
    case 'revendedor_especial':
      return 'bg-amber-900/60 text-amber-300 border-amber-500/50';
    case 'revendedor':
      return 'bg-yellow-900/60 text-yellow-300 border-yellow-500/50';
    case 'cliente_especial':
      return 'bg-blue-900/60 text-blue-300 border-blue-500/50';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}

export function getOrderStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'nuevo':
      return {
        label: 'Nuevo / Por Revisar',
        className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30',
      };
    case 'confirmado':
      return {
        label: 'Confirmado / En Proceso',
        className: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
      };
    case 'entregado':
      return {
        label: 'Servicio Entregado',
        className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
      };
    case 'rechazado':
      return {
        label: 'Rechazado',
        className: 'bg-rose-500/10 text-rose-400 border border-rose-500/30',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-800 text-slate-400 border border-slate-700',
      };
  }
}
