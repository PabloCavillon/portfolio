import { getUserByUsername } from '@/lib/users'
import { getWorksByUserId } from '@/lib/data'
import { getCollectionsByUserId } from '@/lib/collections'
import { getSession } from '@/lib/auth'
import { notFound } from 'next/navigation'
import WorkGrid from '@/app/components/WorkGrid'
import OwnerBar from '@/app/components/OwnerBar'

export const dynamic = 'force-dynamic'

export default async function UserPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const [user, session] = await Promise.all([getUserByUsername(username), getSession()])
  if (!user) notFound()

  const [works, collections] = await Promise.all([
    getWorksByUserId(user.id),
    getCollectionsByUserId(user.id),
  ])
  const isOwner = session?.username === username

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {isOwner && <OwnerBar />}

      {/* Ambient glows */}
      <div className="pointer-events-none fixed -top-48 -left-24 h-128 w-lg rounded-full bg-white/2 blur-[120px]" />
      <div className="pointer-events-none fixed -top-16 right-1/4 h-72 w-72 rounded-full bg-white/1 blur-[90px]" />

      {/* Header */}
      <header className="relative">
        <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-20 pb-16 md:pt-32 md:pb-20">
          <p className="text-white/60 text-[11px] uppercase tracking-[0.45em] mb-8 animate-fade-up">
            Portfolio
          </p>
          <h1
            className="text-[clamp(3.8rem,12vw,8.5rem)] font-extralight leading-none tracking-[-0.02em] uppercase animate-fade-up"
            style={{ animationDelay: '80ms' }}
          >
            {user.displayName || user.username}
          </h1>
          <div
            className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-white/8 pt-6 animate-fade-up"
            style={{ animationDelay: '160ms' }}
          >
            {user.bio ? (
              <p className="text-white/70 text-sm tracking-wide">{user.bio}</p>
            ) : (
              <p className="text-white/70 text-sm tracking-wide">Fotografía &nbsp;·&nbsp; Edición &nbsp;·&nbsp; Retoque</p>
            )}
            {works.length > 0 && (
              <span className="text-white/60 text-xs uppercase tracking-[0.3em]">
                {works.length} {works.length === 1 ? 'trabajo' : 'trabajos'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="px-6 pb-10 md:px-10">
          <div className="max-w-5xl mx-auto">
            <p className="text-white/35 text-[11px] uppercase tracking-[0.4em] mb-5">Colecciones</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {collections.map(col => (
                <a
                  key={col.id}
                  href={`/${username}/c/${col.id}`}
                  className="group block bg-white/3 border border-white/8 rounded-xl p-5 hover:bg-white/5 hover:border-white/15 transition-all"
                >
                  <p className="text-white/85 text-sm font-medium group-hover:text-white transition-colors">{col.name}</p>
                  {col.description && (
                    <p className="text-white/40 text-xs mt-1 line-clamp-2">{col.description}</p>
                  )}
                  <p className="text-white/30 text-xs mt-3">
                    {col.workCount} {col.workCount === 1 ? 'trabajo' : 'trabajos'}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="px-6 pb-20 md:px-10 md:pb-28">
        <div className="max-w-5xl mx-auto">
          <WorkGrid works={works} username={username} />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 text-center">
        <p className="text-white/40 text-[11px] uppercase tracking-[0.35em]">
          {user.displayName || user.username} &nbsp;·&nbsp; {new Date().getFullYear()}
        </p>
        {!session && (
          <a href="/admin/login" className="inline-block mt-4 text-white/35 hover:text-white/65 text-[11px] uppercase tracking-[0.3em] transition-colors">
            Acceder
          </a>
        )}
      </footer>

    </main>
  )
}
