import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="cyber-panel p-8 md:p-12 rounded-2xl max-w-lg w-full text-center border-neon/40 shadow-neon">
        <div className="inline-block text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon via-ice to-magenta mb-2 font-mono tracking-widest drop-shadow-[0_0_20px_rgba(0,210,255,0.6)]">
          404
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-pure mb-3">
          Sector No Encontrado
        </h2>
        <p className="text-sm text-ice/80 mb-6 font-mono leading-relaxed">
          La ruta solicitada no existe o fue reubicada en las dunas cibernéticas del servidor.
        </p>
        <Link
          href="/"
          className="btn-neon-pill px-6 py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center"
        >
          Retornar a Base Principal
        </Link>
      </div>
    </div>
  );
}

