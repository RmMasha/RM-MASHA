import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

export const metadata: Metadata = {
  title: 'RM & Masha | Recargas de Diamantes Free Fire y Gaming',
  description:
    'Plataforma líder para recargas instantáneas de Free Fire, pases de batalla, membresías y saldo para juegos con los mejores precios del mercado.',
  keywords: ['Free Fire', 'Diamantes Free Fire', 'Recargas Free Fire', 'RM Masha', 'Pase Booyah'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-background text-slate-100 flex flex-col min-h-screen antialiased selection:bg-brand-primary selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
