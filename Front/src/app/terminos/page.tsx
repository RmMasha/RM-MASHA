import React from 'react';

export default function TerminosPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <h1 className="text-3xl font-black text-white">Términos y Condiciones del Servicio</h1>
      <p className="text-sm text-slate-400">Última actualización: Noviembre 2026</p>

      <section className="space-y-4 text-sm text-slate-300 leading-relaxed">
        <h2 className="text-lg font-bold text-white">1. Objeto del Servicio</h2>
        <p>
          RM & Masha es una plataforma intermediaria dedicada a la recarga de diamantes, pases y artículos virtuales para Free Fire y otros videojuegos mediante el ID oficial de jugador proporcionado por el usuario.
        </p>

        <h2 className="text-lg font-bold text-white">2. Responsabilidad sobre los Datos Suministrados</h2>
        <p>
          El usuario es el único responsable de ingresar correctamente su ID de jugador. RM & Masha no se hace responsable por diamantes recargados a un ID erróneo provisto por el comprador. En ningún momento solicitamos contraseñas de cuentas de juego ni accesos a redes sociales.
        </p>

        <h2 className="text-lg font-bold text-white">3. Billetera y Saldo Interno</h2>
        <p>
          El saldo interno de la billetera (Wallet) se acredita tras la validación del comprobante de depósito bancario. Las compras realizadas con saldo son irreversibles una vez confirmadas y entregadas en el juego.
        </p>
      </section>
    </div>
  );
}
