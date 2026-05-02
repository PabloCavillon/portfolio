'use client'
import { useState } from 'react'
import type { Collection } from '@/lib/types'

interface Props {
  initialCollections: Collection[]
  username: string
}

export default function CollectionsPanel({ initialCollections, username }: Props) {
  const [collections, setCollections] = useState<Collection[]>(initialCollections)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('El nombre es requerido'); return }
    setCreating(true)
    setError('')
    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    })
    setCreating(false)
    if (res.ok) {
      const created = await res.json()
      setCollections(prev => [...prev, created])
      setName('')
      setDescription('')
      setShowForm(false)
    } else {
      setError('Error al crear la colección')
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCollections(prev => prev.filter(c => c.id !== id))
      setConfirmDelete(null)
    }
  }

  function copyLink(id: string) {
    const url = `${window.location.origin}/${username}/c/${id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2 border border-white/15 rounded-lg text-white/50 hover:border-white/30 hover:text-white/80 transition-colors text-sm"
        >
          <span className="text-lg leading-none">+</span> Nueva colección
        </button>
      ) : (
        <form onSubmit={handleCreate} className="mb-6 bg-white/4 rounded-xl p-5 border border-white/10 space-y-4">
          <h2 className="text-white/80 text-sm font-medium">Nueva colección</h2>
          <div>
            <label className="block text-white/45 text-xs uppercase tracking-wider mb-1.5">Nombre *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ej: Entrega Parcial 1"
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-white/45 text-xs uppercase tracking-wider mb-1.5">Descripción</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Descripción opcional"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors resize-none text-sm"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={creating}
              className="flex-1 bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {creating ? 'Creando...' : 'Crear colección'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(''); setName(''); setDescription('') }}
              className="px-5 py-2.5 border border-white/15 text-white/50 rounded-lg hover:border-white/30 hover:text-white/80 transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {collections.length === 0 ? (
        <p className="text-white/20 text-center py-16">No hay colecciones todavía.</p>
      ) : (
        <div className="space-y-2">
          {collections.map(col => (
            <div key={col.id} className="bg-white/3 rounded-xl p-4 border border-white/7">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-medium">{col.name}</p>
                  {col.description && (
                    <p className="text-white/35 text-xs mt-0.5 line-clamp-1">{col.description}</p>
                  )}
                  <p className="text-white/30 text-xs mt-1">
                    {col.workCount} {col.workCount === 1 ? 'trabajo' : 'trabajos'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => copyLink(col.id)}
                    className="text-white/35 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 transition-colors whitespace-nowrap"
                  >
                    {copied === col.id ? '✓ Copiado' : 'Copiar enlace'}
                  </button>
                  <a
                    href={`/${username}/c/${col.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/35 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 transition-colors"
                  >
                    Ver
                  </a>
                  {confirmDelete === col.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(col.id)}
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
                      onClick={() => setConfirmDelete(col.id)}
                      className="text-white/25 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-400/30 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
