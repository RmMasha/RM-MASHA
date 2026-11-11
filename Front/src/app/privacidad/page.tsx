import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6">
        <Link href="/" className="hover:text-neon">Inicio</Link>
        <span>/</span>
        <span className="text-pure font-bold">Política de Privacidad</span>
      </nav>

      <div className="cyber-panel rounded-3xl p-8 md:p-12 border-neon/30">
        <h1 className="text-2xl md:text-3xl font-black text-pure uppercase tracking-wider mb-6">
          Política de <span className="text-neon">Privacidad</span>
        </h1>

        <div className="space-y-6 text-xs md:text-sm font-mono text-ice/80 leading-relaxed">
          <p>
            Tu privacidad y la seguridad de tus transacciones son fundamentales para nosotros en <strong className="text-pure">RM & Masha</strong>. Esta política describe cómo recolectamos, protegemos y gestionamos tu información.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            1. Datos Recolectados
          </h2>
          <p>
            Recolectamos únicamente la información necesaria para procesar tus recargas y entregas: Nombre, correo electrónico, número de WhatsApp para contacto y notificaciones, nickname del juego y comprobantes de transferencias bancarias.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            2. Seguridad y Cifrado
          </h2>
          <p>
            Toda la información reside en bases de datos con políticas de seguridad a nivel de fila (Row Level Security - RLS). Las transacciones de billetera son ejecutadas mediante funciones almacenadas atómicas en PostgreSQL sin intermediarios inseguros.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            3. Aislamiento del Rol Programador
          </h2>
          <p>
            Bajo nuestra arquitectura de seguridad, los accesos administrativos de alto nivel y funciones críticas de infraestructura se encuentran estrictamente aislados y protegidos contra accesos no autorizados.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            4. Contacto y Derechos de Supresión
          </h2>
          <p>
            Puedes solicitar la actualización o supresión de tus datos personales en cualquier momento a través de nuestros canales oficiales de atención al cliente.
          </p>
        </div>
      </div>
    </div>
  );
}

