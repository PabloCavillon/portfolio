'use client'
import { useState, useEffect, useRef } from 'react'
import type { Work } from '@/lib/types'
import WorkCard from './WorkCard'

export type WorkItem = Work & { username: string }

const PAGE = 12

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface Props {
  works: WorkItem[]
  showAuthor?: boolean
  randomize?: boolean
}

export default function InfiniteGrid({ works: source, showAuthor, randomize }: Props) {
  const [works, setWorks] = useState<WorkItem[]>(source)
  const [category, setCategory] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE)
  const sentinel = useRef<HTMLDivElement>(null)

  // Shuffle after hydration to avoid mismatch
  useEffect(() => {
    if (randomize) setWorks(shuffle(source))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // IntersectionObserver — reveal more on scroll
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(v => v + PAGE) },
      { rootMargin: '500px' }
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  const categories = Array.from(new Set(works.flatMap(w => w.categories)))
  const filtered = category ? works.filter(w => w.categories.includes(category)) : works
  const shown = filtered.slice(0, visible)
  const hasMore = visible < filtered.length

  if (source.length === 0) {
    return <p className="text-white/40 text-center py-28 text-sm tracking-widest uppercase">Aún no hay trabajos</p>
  }

  return (
    <>
      {categories.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-10">
          <Pill active={!category} onClick={() => { setCategory(null); setVisible(PAGE) }}>Todos</Pill>
          {categories.map(cat => (
            <Pill key={cat} active={category === cat} onClick={() => { setCategory(cat); setVisible(PAGE) }}>
              {cat}
            </Pill>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map((work, i) => {
          const featured = i === 0 && filtered.length > 1
          return (
            <div
              key={work.id}
              className={`animate-fade-up ${featured ? 'sm:col-span-2' : ''}`}
              style={{ animationDelay: `${Math.min(i % PAGE, 8) * 65}ms` }}
            >
              <WorkCard work={work} username={work.username} featured={featured} showAuthor={showAuthor} />
            </div>
          )
        })}
      </div>

      <div ref={sentinel} className="mt-10 h-8 flex items-center justify-center">
        {hasMore && (
          <div className="flex gap-1.5">
            <span className="w-1 h-1 rounded-full bg-white/25 animate-pulse" />
            <span className="w-1 h-1 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: '200ms' }} />
            <span className="w-1 h-1 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </div>
    </>
  )
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 text-xs uppercase tracking-widest rounded-full border transition-all duration-200 ${
        active
          ? 'bg-white text-black border-white'
          : 'border-white/25 text-white/60 hover:border-white/50 hover:text-white/90'
      }`}
    >
      {children}
    </button>
  )
}
