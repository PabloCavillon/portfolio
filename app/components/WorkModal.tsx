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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10"
    >
      <div className="relative w-full max-w-5xl">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/50 hover:text-white text-sm transition-colors"
        >
          Cerrar ✕
        </button>

        {/* Content */}
        <div className="rounded-xl overflow-hidden bg-[#111]">
          {work.type === 'before-after' && work.beforeImageUrl && work.afterImageUrl ? (
            <BeforeAfterSlider before={work.beforeImageUrl} after={work.afterImageUrl} alt={work.title} />
          ) : work.imageUrl ? (
            <img src={work.imageUrl} alt={work.title} className="w-full max-h-[80vh] object-contain" />
          ) : (
            <div className="aspect-video flex items-center justify-center text-white/20">Sin imagen</div>
          )}
        </div>

        {/* Meta + nav */}
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-white text-base font-medium">{work.title}</h2>
            {work.categories.length > 0 && <p className="text-white/40 text-sm mt-0.5">{work.categories.join(' · ')}</p>}
            {work.description && <p className="text-white/60 text-sm mt-2 leading-relaxed">{work.description}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              className="w-9 h-9 flex items-center justify-center border border-white/15 rounded-lg text-white/50 hover:border-white/40 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            <button
              onClick={goNext}
              disabled={!hasNext}
              className="w-9 h-9 flex items-center justify-center border border-white/15 rounded-lg text-white/50 hover:border-white/40 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
