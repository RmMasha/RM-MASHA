import { Suspense } from 'react';
import RegistroClient from './RegistroClient';

export const dynamic = 'force-dynamic';

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-ice font-mono">
          Cargando registro...
        </div>
      }
    >
      <RegistroClient />
    </Suspense>
  );
}

