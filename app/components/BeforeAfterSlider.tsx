'use client'
import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  before: string
  after: string
  alt?: string
}

export default function BeforeAfterSlider({ before, after, alt }: Props) {
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    setPosition((x / rect.width) * 100)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => updatePosition(e.clientX)
    const onTouchMove = (e: TouchEvent) => updatePosition(e.touches[0].clientX)
    const onEnd = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
    window.addEventListener('touchmove', onTouchMove)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onEnd)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onEnd)
    }
  }, [dragging, updatePosition])

  return (
    <div ref={containerRef} className="relative overflow-hidden select-none cursor-col-resize">
      {/* Before (background) */}
      <img
        src={before}
        alt={`Antes${alt ? ` - ${alt}` : ''}`}
        className="w-full max-h-[75vh] object-contain block"
        draggable={false}
      />

      {/* After (clipped to right of handle) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img
          src={after}
          alt={`Después${alt ? ` - ${alt}` : ''}`}
          className="w-full h-full object-contain block"
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <button
          type="button"
          aria-label="Arrastrar para comparar"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center cursor-col-resize hover:scale-105 transition-transform"
          onMouseDown={e => { e.preventDefault(); setDragging(true) }}
          onTouchStart={e => { e.preventDefault(); setDragging(true) }}
        >
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <path d="M1 6H19M5 2L1 6L5 10M15 2L19 6L15 10" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
        ANTES
      </span>
      <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm pointer-events-none">
        DESPUÉS
      </span>
    </div>
  )
}
