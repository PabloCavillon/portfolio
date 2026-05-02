export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-xs w-full">
        <p className="text-white/25 text-[11px] uppercase tracking-[0.5em] mb-6">404</p>
        <h1 className="text-[clamp(3rem,10vw,5rem)] font-extralight leading-none tracking-[-0.02em] uppercase mb-6">
          Fuera de<br />foco.
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Esta página no existe, fue eliminada, o nunca estuvo en cuadro.
        </p>
        <a
          href="/"
          className="text-white/55 hover:text-white text-xs uppercase tracking-widest transition-colors"
        >
          ← Volver al inicio
        </a>
      </div>
    </main>
  )
}
