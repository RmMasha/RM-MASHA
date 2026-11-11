import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Snowfall from '@/components/common/Snowfall';
import ErrorBoundary from '@/components/common/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RM & Masha | Recargas de Diamantes Free Fire - Temporada Navideña',
  description: 'Plataforma oficial de recargas para Free Fire y videojuegos. Precios dinámicos para revendedores, billetera automatizada, entregas rápidas y soporte 24/7.',
  keywords: ['Free Fire', 'Diamantes', 'Recargas', 'Pase Booyah', 'RM & Masha', 'Garena', 'Revendedor'],
  authors: [{ name: 'RM & Masha Gaming Store' }],
  openGraph: {
    title: 'RM & Masha - Recargas Navideñas Free Fire',
    description: 'Recarga diamantes al mejor precio con entrega inmediata y sistema de billetera automatizada.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} min-h-screen bg-navy text-pure relative antialiased flex flex-col selection:bg-neon/30 selection:text-white`}>
        {/* Efecto de copos de nieve interactivos */}
        <Snowfall count={45} />

        {/* Proveedor de Estado Global de Autenticación */}
        <AuthProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {/* Barra de Navegación Minimalista Superior */}
            <Navbar />

            {/* Contenedor Principal Aislado con Error Boundary */}
            <main className="flex-1">
              <ErrorBoundary fallbackTitle="Interferencia en Vista Principal">
                {children}
              </ErrorBoundary>
            </main>

            {/* Pie de Página */}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

