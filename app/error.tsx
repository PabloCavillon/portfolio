'use client'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-xs w-full">
        <p className="text-white/25 text-[11px] uppercase tracking-[0.5em] mb-6">Error</p>
        <h1 className="text-[clamp(3rem,10vw,5rem)] font-extralight leading-none tracking-[-0.02em] uppercase mb-6">
          La toma<br />falló.
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Algo salió mal de nuestro lado. Podés reintentar o volver al inicio.
        </p>
        <div className="flex items-center gap-6">
          <button
            onClick={reset}
            className="text-white text-xs uppercase tracking-widest border border-white/20 px-5 py-2.5 rounded-lg hover:border-white/45 transition-colors"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors"
          >
            ← Inicio
          </a>
        </div>
      </div>
    </main>
  )
}
