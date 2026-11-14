import { useEffect } from 'react';

/**
 * Hook para bloquear el scroll de la página principal (body)
 * cuando un modal, cajón o menú flotante está abierto.
 * Evita el molesto "scroll bleed" o scroll encadenado.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLocked]);
}

