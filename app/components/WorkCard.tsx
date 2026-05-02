import type { Work } from '@/lib/types'
import { toSlug } from '@/lib/utils'

interface Props {
  work: Work
  username: string
  featured?: boolean
  showAuthor?: boolean
}

export default function WorkCard({ work, username, featured, showAuthor }: Props) {
  const thumb = work.type === 'single' ? work.imageUrl : (work.afterImageUrl ?? work.beforeImageUrl)

  return (
    <article
      className={`group relative overflow-hidden rounded-xl bg-white/5 block w-full ${featured ? 'aspect-video' : 'aspect-4/3'}`}
    >
      {/* Stretched main link — covers entire card */}
      <a
        href={`/${username}/${toSlug(work.title)}`}
        className="absolute inset-0 z-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-label={work.title}
      />

      {thumb ? (
        <img
          src={thumb}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] pointer-events-none"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/15 text-sm pointer-events-none">
          Sin imagen
        </div>
      )}

      {/* Gradient */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0 pointer-events-none">
            <p className={`text-white font-medium leading-tight truncate ${featured ? 'text-base' : 'text-sm'}`}>
              {work.title}
            </p>
            {work.categories.length > 0 && (
              <p className="text-white/75 text-xs mt-0.5">{work.categories.join(' · ')}</p>
            )}
          </div>
          {work.type === 'before-after' && (
            <span className="shrink-0 text-[10px] px-2 py-0.5 bg-white/10 text-white/60 rounded tracking-wider uppercase border border-white/10 pointer-events-none">
              A·D
            </span>
          )}
        </div>

        {showAuthor && (
          <a
            href={`/${username}`}
            className="relative z-10 text-white/55 hover:text-white text-xs mt-1 inline-block transition-colors"
          >
            @{username}
          </a>
        )}
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/0 group-hover:ring-white/12 transition-all duration-300 pointer-events-none" />
    </article>
  )
}
