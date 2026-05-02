'use client'
import type { Work } from '@/lib/types'

interface Props {
  work: Work
  onClick: () => void
  featured?: boolean
}

export default function WorkCard({ work, onClick, featured }: Props) {
  const thumb = work.type === 'single' ? work.imageUrl : (work.afterImageUrl ?? work.beforeImageUrl)

  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl bg-white/5 block w-full h-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${featured ? 'aspect-video' : 'aspect-4/3'}`}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={work.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/15 text-sm">
          Sin imagen
        </div>
      )}

      {/* Permanent gradient */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-white/85 font-medium leading-tight group-hover:text-white transition-colors duration-200 truncate ${featured ? 'text-base' : 'text-sm'}`}>
              {work.title}
            </p>
            {work.categories.length > 0 && (
              <p className="text-white/60 text-xs mt-0.5">{work.categories.join(' · ')}</p>
            )}
          </div>
          {work.type === 'before-after' && (
            <span className="shrink-0 text-[10px] px-2 py-0.5 bg-white/10 text-white/60 rounded tracking-wider uppercase border border-white/10">
              A·D
            </span>
          )}
        </div>
      </div>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/0 group-hover:ring-white/12 transition-all duration-300" />
    </button>
  )
}
