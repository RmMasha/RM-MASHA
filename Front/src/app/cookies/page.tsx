import Link from 'next/link';

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 max-w-4xl">
      <nav className="flex items-center gap-2 text-xs font-mono text-ice/60 mb-6">
        <Link href="/" className="hover:text-neon">Inicio</Link>
        <span>/</span>
        <span className="text-pure font-bold">Política de Cookies</span>
      </nav>

      <div className="cyber-panel rounded-3xl p-8 md:p-12 border-neon/30">
        <h1 className="text-2xl md:text-3xl font-black text-pure uppercase tracking-wider mb-6">
          Política de <span className="text-neon">Cookies</span>
        </h1>

        <div className="space-y-6 text-xs md:text-sm font-mono text-ice/80 leading-relaxed">
          <p>
            En <strong className="text-pure">RM & Masha</strong>, utilizamos cookies técnicas esenciales para garantizar el correcto funcionamiento del sistema de autenticación, preservación de sesiones seguras y persistencia del token de acceso a la billetera digital.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            1. ¿Qué Cookies Utilizamos?
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-neon">sb-xvwcmcrfgrclhebbcrze-auth-token:</strong> Cookie técnica de sesión cifrada administrada por el SDK oficial de Supabase Auth. Garantiza que tu sesión permanezca activa sin exponer credenciales.
            </li>
            <li>
              <strong className="text-neon">rm_session_pref:</strong> Almacena preferencias visuales y selección de vista de catálogo de forma no intrusiva.
            </li>
          </ul>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            2. Cookies de Terceros y Rastreo Publicitario
          </h2>
          <p>
            Nuestra plataforma <strong className="text-magenta">NO</strong> utiliza cookies de rastreo publicitario invasivo ni comparte perfiles de navegación con redes de anuncios comerciales ajenas a nuestro ecosistema.
          </p>

          <h2 className="text-base font-bold text-pure uppercase pt-4 border-t border-neon/15">
            3. Control y Desactivación
          </h2>
          <p>
            Puedes deshabilitar las cookies desde la configuración de tu navegador; sin embargo, ten en cuenta que el inicio de sesión y la recarga de saldo requieren cookies funcionales para operar de forma segura.
          </p>
        </div>
      </div>
    </div>
  );
}

