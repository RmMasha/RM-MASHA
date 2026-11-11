import React from 'react';

export default function CookiesPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-black text-white">Política de Cookies</h1>
      <p className="text-sm text-slate-400">Última actualización: Noviembre 2026</p>

      <section className="space-y-3 text-sm text-slate-300 leading-relaxed">
        <h2 className="text-lg font-bold text-white">1. ¿Qué son las cookies?</h2>
        <p>
          Una cookie es un pequeño archivo de texto que un sitio web almacena en su navegador para permitir el funcionamiento de las sesiones de usuario, recordar preferencias y garantizar transacciones financieras seguras.
        </p>

        <h2 className="text-lg font-bold text-white pt-4">2. Cookies que utilizamos en RM & Masha</h2>
        <p>
          Nuestra plataforma utiliza únicamente cookies estrictamente necesarias para la autenticación y seguridad de sus operaciones:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-400">
          <li>
            <strong className="text-white">sb-[ref]-auth-token:</strong> Cookie técnica emitida por Supabase para mantener activa y cifrada su sesión de usuario.
          </li>
          <li>
            <strong className="text-white">rm_masha_cookie_consent:</strong> Almacena su consentimiento sobre el uso de cookies técnicas.
          </li>
        </ul>

        <h2 className="text-lg font-bold text-white pt-4">3. Cómo administrar o desactivar las cookies</h2>
        <p>
          Usted puede bloquear o eliminar las cookies en cualquier momento mediante las opciones de configuración de su navegador web. Tenga en cuenta que deshabilitar cookies técnicas impedirá iniciar sesión y recargar saldo en su billetera.
        </p>
      </section>
    </div>
  );
}
