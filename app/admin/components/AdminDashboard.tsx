'use client'
import { useState } from 'react'
import type { Work } from '@/lib/types'
import WorkForm from './WorkForm'

export default function AdminDashboard({ initialWorks }: { initialWorks: Work[] }) {
  const [works, setWorks] = useState<Work[]>(initialWorks)
  const [editing, setEditing] = useState<Work | null>(null)
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/works/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setWorks(prev => prev.filter(w => w.id !== id))
      setConfirmDelete(null)
    }
  }

  function handleSaved(work: Work) {
    if (editing) {
      setWorks(prev => prev.map(w => w.id === work.id ? work : w))
      setEditing(null)
    } else {
      setWorks(prev => [...prev, work])
      setAdding(false)
    }
  }

  const showForm = adding || editing !== null

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <a href="/" className="text-white/30 hover:text-white/70 text-sm transition-colors">
            ← Portfolio
          </a>
          <h1 className="text-white text-lg font-light">Administrar trabajos</h1>
        </div>
        <button onClick={handleLogout} className="text-white/30 hover:text-white/70 text-sm transition-colors">
          Salir
        </button>
      </div>

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => { setAdding(true); setEditing(null) }}
          className="mb-6 flex items-center gap-2 px-4 py-2 border border-white/15 rounded-lg text-white/50 hover:border-white/30 hover:text-white/80 transition-colors text-sm"
        >
          <span className="text-lg leading-none">+</span> Agregar trabajo
        </button>
      )}

      {/* Form panel */}
      {showForm && (
        <div className="mb-6 bg-white/[0.04] rounded-xl p-6 border border-white/10">
          <h2 className="text-white/80 text-sm font-medium mb-5">
            {editing ? 'Editar trabajo' : 'Nuevo trabajo'}
          </h2>
          <WorkForm
            initialData={editing ?? undefined}
            onSaved={handleSaved}
            onCancel={() => { setEditing(null); setAdding(false) }}
          />
        </div>
      )}

      {/* Works list */}
      {works.length === 0 ? (
        <p className="text-white/20 text-center py-16">No hay trabajos todavía.</p>
      ) : (
        <div className="space-y-2">
          {works.map(work => {
            const thumb = work.type === 'single' ? work.imageUrl : (work.afterImageUrl ?? work.beforeImageUrl)
            return (
              <div
                key={work.id}
                className="flex items-center gap-4 bg-white/[0.03] rounded-xl p-3.5 border border-white/[0.07]"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                  {thumb ? (
                    <img src={thumb} alt={work.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/15 text-xs">—</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-medium truncate">{work.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {work.category && <span className="text-white/35 text-xs">{work.category}</span>}
                    {work.type === 'before-after' && (
                      <span className="text-xs px-1.5 py-px bg-white/10 text-white/50 rounded">A/D</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => { setEditing(work); setAdding(false) }}
                    className="text-white/35 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 transition-colors"
                  >
                    Editar
                  </button>

                  {confirmDelete === work.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(work.id)}
                        className="text-red-400 text-xs px-3 py-1.5 rounded-lg border border-red-400/30 hover:border-red-400/60 transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-white/30 hover:text-white text-xs px-2 py-1.5 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(work.id)}
                      className="text-white/25 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-400/30 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
