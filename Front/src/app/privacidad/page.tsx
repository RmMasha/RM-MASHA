import React from 'react';

export default function PrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-black text-white">Política de Privacidad</h1>
      <p className="text-sm text-slate-400">Última actualización: Noviembre 2026</p>

      <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
        <h2 className="text-lg font-bold text-white">1. Datos Recopilados</h2>
        <p>
          Recopilamos únicamente los datos necesarios para brindar el servicio: nombre, WhatsApp para soporte de entrega, correo electrónico para acceso seguro y el ID de jugador para recargas en el juego.
        </p>

        <h2 className="text-lg font-bold text-white">2. Seguridad y Aislamiento de Datos</h2>
        <p>
          Los datos están protegidos bajo protocolos de cifrado y políticas de seguridad a nivel de fila (Row Level Security en PostgreSQL). Jamás comercializamos información de nuestros clientes con terceros.
        </p>

        <h2 className="text-lg font-bold text-white">3. Derechos del Usuario</h2>
        <p>
          Usted puede solicitar la rectificación o eliminación de sus datos en cualquier momento comunicándose con nuestro equipo de soporte oficial.
        </p>
      </section>
    </div>
  );
}
