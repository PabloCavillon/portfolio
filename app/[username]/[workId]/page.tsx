import { getUserByUsername } from '@/lib/users'
import { getWorksByUserId } from '@/lib/data'
import { notFound } from 'next/navigation'
import { type Metadata } from 'next'
import BeforeAfterSlider from '@/app/components/BeforeAfterSlider'

export const dynamic = 'force-dynamic'

type Params = Promise<{ username: string; workId: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { username, workId } = await params
  const user = await getUserByUsername(username)
  if (!user) return {}
  const works = await getWorksByUserId(user.id)
  const work = works.find(w => w.id === workId)
  if (!work) return {}
  const displayName = user.displayName || user.username
  const image = work.imageUrl ?? work.afterImageUrl ?? work.beforeImageUrl
  const desc = work.description
    ? work.description.slice(0, 155)
    : `${work.categories.join(', ')} — ${displayName}`
  return {
    title: work.title,
    description: desc,
    openGraph: {
      title: `${work.title} — ${displayName}`,
      description: desc,
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function WorkPage({ params }: { params: Params }) {
  const { username, workId } = await params
  const user = await getUserByUsername(username)
  if (!user) notFound()

  const works = await getWorksByUserId(user.id)
  const idx = works.findIndex(w => w.id === workId)
  if (idx === -1) notFound()

  const work = works[idx]
  const prev = idx > 0 ? works[idx - 1] : null
  const next = idx < works.length - 1 ? works[idx + 1] : null
  const displayName = user.displayName || user.username

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      <div className="pointer-events-none fixed -top-48 -left-24 h-128 w-lg rounded-full bg-white/2 blur-[120px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-6 md:mb-8 gap-4">
          <a
            href={`/${username}`}
            className="text-white/35 hover:text-white/70 text-sm transition-colors"
          >
            ← {displayName}
          </a>
          <div className="flex gap-2">
            <a
              href={prev ? `/${username}/${prev.id}` : '#'}
              aria-disabled={!prev}
              className={`h-9 w-9 flex items-center justify-center border rounded-lg text-sm transition-colors ${
                prev
                  ? 'border-white/15 text-white/50 hover:border-white/40 hover:text-white'
                  : 'border-white/7 text-white/20 pointer-events-none'
              }`}
            >
              ←
            </a>
            <a
              href={next ? `/${username}/${next.id}` : '#'}
              aria-disabled={!next}
              className={`h-9 w-9 flex items-center justify-center border rounded-lg text-sm transition-colors ${
                next
                  ? 'border-white/15 text-white/50 hover:border-white/40 hover:text-white'
                  : 'border-white/7 text-white/20 pointer-events-none'
              }`}
            >
              →
            </a>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row rounded-xl overflow-hidden bg-[#111]">

          {/* Image */}
          <div className="flex-1 min-w-0 flex items-center justify-center bg-black min-h-[50vw] md:min-h-[60vh]">
            {work.type === 'before-after' && work.beforeImageUrl && work.afterImageUrl ? (
              <BeforeAfterSlider before={work.beforeImageUrl} after={work.afterImageUrl} alt={work.title} />
            ) : work.imageUrl ? (
              <img
                src={work.imageUrl}
                alt={work.title}
                className="w-full max-h-[85vh] object-contain"
              />
            ) : (
              <div className="aspect-video w-full flex items-center justify-center text-white/20">
                Sin imagen
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full md:w-72 shrink-0 flex flex-col p-6 md:p-8 border-t border-white/8 md:border-t-0 md:border-l md:border-white/8 gap-4">
            <div>
              <h1 className="text-white text-lg md:text-xl font-medium leading-snug">{work.title}</h1>
              {work.categories.length > 0 && (
                <p className="text-white/45 text-xs uppercase tracking-wider mt-2">
                  {work.categories.join(' · ')}
                </p>
              )}
            </div>

            {work.description && (
              <p className="text-white/65 text-sm leading-relaxed whitespace-pre-line">
                {work.description}
              </p>
            )}

            <div className="mt-auto pt-4 border-t border-white/8">
              <a
                href={`/${username}`}
                className="text-white/35 hover:text-white/70 text-xs transition-colors"
              >
                @{username}
              </a>
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
