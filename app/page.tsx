import { getAllWorks } from '@/lib/data'
import { getUsersWithPreview } from '@/lib/users'
import { getSession } from '@/lib/auth'
import { type Metadata } from 'next'
import InfiniteGrid, { type WorkItem } from '@/app/components/InfiniteGrid'
import GuestBar from '@/app/components/GuestBar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'Portfolio' },
  description: 'Galería de fotografía, edición y retoque digital',
  openGraph: {
    title: 'Portfolio',
    description: 'Galería de fotografía, edición y retoque digital',
  },
}

export default async function Home() {
  const [works, users, session] = await Promise.all([getAllWorks(), getUsersWithPreview(), getSession()])
  const workItems: WorkItem[] = works

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {!session && <GuestBar />}

      <div className="pointer-events-none fixed -top-48 -left-24 h-128 w-lg rounded-full bg-white/2 blur-[120px]" />
      <div className="pointer-events-none fixed -top-16 right-1/4 h-72 w-72 rounded-full bg-white/1 blur-[90px]" />

      <header className="relative">
        <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-20 pb-16 md:pt-32 md:pb-20">
          <p className="text-white/60 text-[11px] uppercase tracking-[0.45em] mb-8 animate-fade-up">
            Estudio creativo
          </p>
          <h1
            className="text-[clamp(3.8rem,12vw,8.5rem)] font-extralight leading-none tracking-[-0.02em] uppercase animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            Portfolio
          </h1>
          <div
            className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-white/8 pt-6 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            {users.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {users.map(u => (
                  <a
                    key={u.id}
                    href={`/${u.username}`}
                    className="text-white/65 hover:text-white text-sm transition-colors"
                  >
                    {u.displayName || u.username}
                  </a>
                ))}
              </div>
            )}
            {works.length > 0 && (
              <span className="text-white/55 text-xs uppercase tracking-[0.3em] shrink-0">
                {works.length} {works.length === 1 ? 'trabajo' : 'trabajos'}
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="px-6 pb-20 md:px-10 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <InfiniteGrid works={workItems} showAuthor randomize />
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 px-6 text-center">
        <p className="text-white/30 text-[11px] uppercase tracking-[0.35em]">
          Portfolio &nbsp;·&nbsp; {new Date().getFullYear()}
        </p>
      </footer>

    </main>
  )
}
