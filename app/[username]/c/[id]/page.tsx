import { getUserByUsername } from '@/lib/users'
import { getCollectionById } from '@/lib/collections'
import { getWorksByCollectionId } from '@/lib/data'
import { notFound } from 'next/navigation'
import WorkGrid from '@/app/components/WorkGrid'
import CopyLinkButton from './CopyLinkButton'

export const dynamic = 'force-dynamic'

export default async function CollectionPage({ params }: { params: Promise<{ username: string; id: string }> }) {
  const { username, id } = await params
  const [user, collection] = await Promise.all([getUserByUsername(username), getCollectionById(id)])

  if (!user || !collection || collection.userId !== user.id) notFound()

  const works = await getWorksByCollectionId(id)

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed -top-48 -left-24 h-128 w-lg rounded-full bg-white/2 blur-[120px]" />
      <div className="pointer-events-none fixed -top-16 right-1/4 h-72 w-72 rounded-full bg-white/1 blur-[90px]" />

      {/* Header */}
      <header className="relative">
        <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-20 pb-12 md:pt-28 md:pb-16">

          <a
            href={`/${username}`}
            className="inline-block text-white/35 hover:text-white/65 text-[11px] uppercase tracking-[0.4em] mb-8 transition-colors"
          >
            ← {user.displayName || user.username}
          </a>

          <p className="text-white/45 text-[11px] uppercase tracking-[0.45em] mb-3">
            Colección
          </p>
          <h1 className="text-[clamp(2.4rem,8vw,5.5rem)] font-extralight leading-none tracking-[-0.02em] uppercase">
            {collection.name}
          </h1>

          {collection.description && (
            <p className="mt-5 text-white/55 text-sm leading-relaxed max-w-xl whitespace-pre-line">
              {collection.description}
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 border-t border-white/8 pt-5">
            <span className="text-white/40 text-xs uppercase tracking-[0.3em]">
              {works.length} {works.length === 1 ? 'trabajo' : 'trabajos'}
            </span>
            <CopyLinkButton />
          </div>
        </div>
      </header>

      {/* Grid */}
      <section className="px-6 pb-20 md:px-10 md:pb-28">
        <div className="max-w-5xl mx-auto">
          {works.length === 0 ? (
            <p className="text-white/20 text-center py-24">Esta colección no tiene trabajos todavía.</p>
          ) : (
            <WorkGrid works={works} />
          )}
        </div>
      </section>

      <footer className="border-t border-white/5 py-10 px-6 text-center">
        <p className="text-white/30 text-[11px] uppercase tracking-[0.35em]">
          {user.displayName || user.username} &nbsp;·&nbsp; {collection.name}
        </p>
      </footer>

    </main>
  )
}
