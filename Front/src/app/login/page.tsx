import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-ice font-mono">
          Cargando login...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}

