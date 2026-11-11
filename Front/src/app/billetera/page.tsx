import { Suspense } from 'react';
import BilleteraClient from './BilleteraClient';

export const dynamic = 'force-dynamic';

export default function BilleteraPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-ice font-mono">
          Cargando Billetera...
        </div>
      }
    >
      <BilleteraClient />
    </Suspense>
  );
}

