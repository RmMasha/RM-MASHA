import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6">
        <Link href="/" className="hover:text-neon">Inicio</Link>
        <span>/</span>
        <span className="text-pure font-bold">Términos del Servicio</span>
      </nav>

      <div className="cyber-panel rounded-3xl p-8 md:p-12 border-neon/30">
        <h1 className="text-2xl md:text-3xl font-black text-pure uppercase tracking-wider mb-6">
          Términos y <span className="text-neon">Condiciones</span>
        </h1>

        <div className="space-y-6 text-xs md:text-sm font-mono text-ice/80 leading-relaxed">
          <p>
            Al utilizar los servicios de <strong className="text-pure">RM & Masha</strong>, aceptas plenamente las siguientes condiciones de entrega y uso de la billetera digital para recargas de videojuegos.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            1. Veracidad del ID de Jugador
          </h2>
          <p>
            El cliente es el único responsable de ingresar correctamente el ID (UID) de jugador en Free Fire u otros videojuegos. Una vez acreditados los diamantes en el ID suministrado por el comprador, la transacción es irreversible.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            2. Sistema de Saldo (Wallet)
          </h2>
          <p>
            El saldo depositado en la plataforma es de uso exclusivo para adquirir servicios y recargas dentro del ecosistema de RM & Masha. Las compras con saldo se procesan de forma automatizada mediante procedimientos atómicos protegidos por base de datos.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            3. Verificación de Comprobantes de Pago
          </h2>
          <p>
            Cualquier intento de alteración o falsificación de comprobantes de transferencia bancaria conllevará a la suspensión inmediata de la cuenta y bloqueo definitivo del ID de usuario.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            4. Precios Dinámicos por Rol
          </h2>
          <p>
            Los precios para revendedores están sujetos a la permanencia y volumen acordado. La administración se reserva el derecho de ajustar los roles de usuario según su actividad comercial.
          </p>
        </div>
      </div>
    </div>
  );
}

