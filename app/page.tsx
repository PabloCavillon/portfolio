import { getWorks } from '@/lib/data'
import WorkGrid from '@/app/components/WorkGrid'

export default async function Home() {
  const works = await getWorks()

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-48 -left-24 h-[32rem] w-[32rem] rounded-full bg-white/[0.025] blur-[120px]" />
        <div className="pointer-events-none absolute -top-16 right-1/4 h-72 w-72 rounded-full bg-white/[0.015] blur-[90px]" />

        <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-20 pb-16 md:pt-32 md:pb-20">

          <p className="text-white/20 text-[11px] uppercase tracking-[0.45em] mb-8 animate-fade-up">
            Estudio creativo
          </p>

          <h1
            className="text-[clamp(3.8rem,12vw,8.5rem)] font-extralight leading-none tracking-[-0.02em] uppercase animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            Portfolio
          </h1>

          <div
            className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/8 pt-6 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            <p className="text-white/35 text-sm tracking-wide">
              Fotografía &nbsp;·&nbsp; Edición &nbsp;·&nbsp; Retoque
            </p>
            {works.length > 0 && (
              <span className="text-white/20 text-xs uppercase tracking-[0.3em]">
                {works.length} {works.length === 1 ? 'trabajo' : 'trabajos'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="px-6 pb-20 md:px-10 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <WorkGrid works={works} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 text-center">
        <p className="text-white/10 text-[11px] uppercase tracking-[0.35em]">
          Portfolio &nbsp;·&nbsp; {new Date().getFullYear()}
        </p>
      </footer>

    </main>
  )
}
