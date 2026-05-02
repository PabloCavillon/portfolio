'use client'
import { useState } from 'react'
import type { Work } from '@/lib/types'
import WorkCard from './WorkCard'
import WorkModal from './WorkModal'

export default function WorkGrid({ works }: { works: Work[] }) {
  const [selected, setSelected] = useState<Work | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(works.flatMap(w => w.categories)))
  const filtered = category ? works.filter(w => w.categories.includes(category)) : works

  if (works.length === 0) {
    return <p className="text-white/40 text-center py-28 text-sm tracking-widest uppercase">Aún no hay trabajos</p>
  }

  return (
    <>
      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-10">
          <CategoryPill active={category === null} onClick={() => setCategory(null)}>Todos</CategoryPill>
          {categories.map(cat => (
            <CategoryPill key={cat} active={category === cat} onClick={() => setCategory(cat)}>
              {cat}
            </CategoryPill>
          ))}
        </div>
      )}

      {/* Grid — first card is featured (2 cols wide) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((work, i) => {
          const isFeatured = i === 0 && filtered.length > 1
          return (
            <div
              key={work.id}
              className={`animate-fade-up ${isFeatured ? 'sm:col-span-2' : ''}`}
              style={{ animationDelay: `${i * 65}ms` }}
            >
              <WorkCard
                work={work}
                onClick={() => setSelected(work)}
                featured={isFeatured}
              />
            </div>
          )
        })}
      </div>

      {selected && (
        <WorkModal
          work={selected}
          works={filtered}
          onClose={() => setSelected(null)}
          onNavigate={setSelected}
        />
      )}
    </>
  )
}

function CategoryPill({
  active, onClick, children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
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
