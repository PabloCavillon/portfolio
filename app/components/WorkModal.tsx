'use client'
import { useEffect, useCallback } from 'react'
import type { Work } from '@/lib/types'
import BeforeAfterSlider from './BeforeAfterSlider'

interface Props {
  work: Work
  works: Work[]
  onClose: () => void
  onNavigate: (work: Work) => void
}

export default function WorkModal({ work, works, onClose, onNavigate }: Props) {
  const idx = works.findIndex(w => w.id === work.id)
  const hasPrev = idx > 0
  const hasNext = idx < works.length - 1

  const goPrev = useCallback(() => { if (hasPrev) onNavigate(works[idx - 1]) }, [hasPrev, idx, works, onNavigate])
  const goNext = useCallback(() => { if (hasNext) onNavigate(works[idx + 1]) }, [hasNext, idx, works, onNavigate])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8">
      <div className="relative w-full max-w-6xl flex flex-col md:flex-row gap-0 rounded-xl overflow-hidden bg-[#111] max-h-[90vh]">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/60 hover:text-white hover:bg-black/80 text-sm transition-colors"
        >
          ✕
        </button>

        {/* Image */}
        <div className="flex-1 min-w-0 flex items-center justify-center bg-black">
          {work.type === 'before-after' && work.beforeImageUrl && work.afterImageUrl ? (
            <BeforeAfterSlider before={work.beforeImageUrl} after={work.afterImageUrl} alt={work.title} />
          ) : work.imageUrl ? (
            <img src={work.imageUrl} alt={work.title} className="w-full max-h-[90vh] object-contain" />
          ) : (
            <div className="aspect-video flex items-center justify-center text-white/20">Sin imagen</div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col justify-between p-6 border-t border-white/8 md:border-t-0 md:border-l md:border-white/8">
          <div className="space-y-3">
            <h2 className="text-white text-base font-medium leading-snug">{work.title}</h2>
            {work.categories.length > 0 && (
              <p className="text-white/55 text-xs uppercase tracking-wider">{work.categories.join(' · ')}</p>
            )}
            {work.description && (
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{work.description}</p>
            )}
          </div>

          {/* Nav */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              className="flex-1 h-9 flex items-center justify-center border border-white/15 rounded-lg text-white/50 hover:border-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            <button
              onClick={goNext}
              disabled={!hasNext}
              className="flex-1 h-9 flex items-center justify-center border border-white/15 rounded-lg text-white/50 hover:border-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
