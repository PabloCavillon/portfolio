'use client'
import { useState, useRef } from 'react'
import { upload } from '@vercel/blob/client'
import type { Work, Collection } from '@/lib/types'

interface Props {
  initialData?: Work
  collections?: Collection[]
  onSaved: (work: Work) => void
  onCancel: () => void
}

function ImageUpload({ label, value, onChange }: { label: string; value: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const blob = await upload(uniqueName, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      })
      onChange(blob.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">{label}</label>
      <div
        className="border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-white/20 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <div className="relative">
            <img src={value} alt="" className="w-full h-36 object-cover" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null) }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white text-xs flex items-center justify-center hover:bg-black/90"
            >✕</button>
          </div>
        ) : (
          <div className="h-28 flex flex-col items-center justify-center gap-2 text-white/20">
            {uploading ? <span className="text-sm">Subiendo...</span> : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span className="text-sm">Subir imagen</span>
              </>
            )}
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
    </div>
  )
}

export default function WorkForm({ initialData, collections = [], onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [categoriesInput, setCategoriesInput] = useState(initialData?.categories.join('; ') ?? '')
  const [type, setType] = useState<'single' | 'before-after'>(initialData?.type ?? 'single')
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null)
  const [beforeUrl, setBeforeUrl] = useState<string | null>(initialData?.beforeImageUrl ?? null)
  const [afterUrl, setAfterUrl] = useState<string | null>(initialData?.afterImageUrl ?? null)
  const [order, setOrder] = useState(initialData?.order ?? 0)
  const [collectionId, setCollectionId] = useState<string | null>(initialData?.collectionId ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es requerido'); return }

    setSaving(true)
    setError('')

    const categories = categoriesInput.split(';').map(c => c.trim()).filter(Boolean)

    const res = await fetch(initialData ? `/api/works/${initialData.id}` : '/api/works', {
      method: initialData ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), description: description.trim(), categories, type, imageUrl, beforeImageUrl: beforeUrl, afterImageUrl: afterUrl, order, collectionId }),
    })

    if (res.ok) {
      onSaved(await res.json())
    } else {
      setError('Error al guardar. Intentá de nuevo.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Título *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del trabajo"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors" />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">
            Categorías <span className="normal-case text-white/30 tracking-normal">(separar con punto y coma)</span>
          </label>
          <input type="text" value={categoriesInput} onChange={e => setCategoriesInput(e.target.value)}
            placeholder="ej: Retrato; Blanco y negro; Paisaje"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors" />
        </div>

        <div>
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Orden</label>
          <input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/25 transition-colors" />
        </div>

        {collections.length > 0 && (
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Colección</label>
            <select
              value={collectionId ?? ''}
              onChange={e => setCollectionId(e.target.value || null)}
              className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/25 transition-colors"
            >
              <option value="">Sin colección</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
            placeholder="Descripción opcional"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors resize-none" />
        </div>
      </div>

      <div>
        <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Tipo</label>
        <div className="flex gap-2">
          {(['single', 'before-after'] as const).map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-lg border text-sm transition-colors ${type === t ? 'border-white/40 bg-white/10 text-white' : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'}`}>
              {t === 'single' ? 'Imagen única' : 'Antes / Después'}
            </button>
          ))}
        </div>
      </div>

      {type === 'single'
        ? <ImageUpload label="Imagen" value={imageUrl} onChange={setImageUrl} />
        : <div className="grid grid-cols-2 gap-4">
            <ImageUpload label="Antes" value={beforeUrl} onChange={setBeforeUrl} />
            <ImageUpload label="Después" value={afterUrl} onChange={setAfterUrl} />
          </div>
      }

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving}
          className="flex-1 bg-white text-black rounded-lg py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50">
          {saving ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear trabajo'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2.5 border border-white/15 text-white/50 rounded-lg hover:border-white/30 hover:text-white/80 transition-colors text-sm">
          Cancelar
        </button>
      </div>
    </form>
  )
}
