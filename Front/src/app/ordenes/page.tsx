import { Suspense } from 'react';
import OrdenesClient from './OrdenesClient';

export const dynamic = 'force-dynamic';

export default function OrdenesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-ice font-mono">
          Cargando pedidos...
        </div>
      }
    >
      <OrdenesClient />
    </Suspense>
  );
}

