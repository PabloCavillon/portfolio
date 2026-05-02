'use client'
import { useState } from 'react'
import type { User } from '@/lib/types'

const emptyForm = { username: '', displayName: '', password: '', isAdmin: false }

export default function UsersPanel({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const created = await res.json()
      setUsers(prev => [...prev, created])
      setForm(emptyForm)
      setShowForm(false)
    } else {
      setError((await res.json()).error || 'Error al crear usuario')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    if (res.ok) { setUsers(prev => prev.filter(u => u.id !== id)); setConfirmDelete(null) }
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-white/30 hover:text-white/70 text-sm transition-colors">← Admin</a>
          <h1 className="text-white text-lg font-light">Gestionar usuarios</h1>
        </div>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="mb-6 flex items-center gap-2 px-4 py-2 border border-white/15 rounded-lg text-white/50 hover:border-white/30 hover:text-white/80 transition-colors text-sm">
          <span className="text-lg leading-none">+</span> Nuevo usuario
        </button>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 bg-white/4 rounded-xl p-6 border border-white/10 space-y-4">
          <h2 className="text-white/80 text-sm font-medium">Nuevo usuario</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Usuario *</label>
              <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/25 transition-colors" />
            </div>
            <div>
              <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Nombre</label>
              <input type="text" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/25 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Contraseña *</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-white/25 transition-colors" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isAdmin} onChange={e => setForm(f => ({ ...f, isAdmin: e.target.checked }))} className="w-4 h-4 rounded" />
            <span className="text-white/50 text-sm">Administrador</span>
          </label>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="bg-white text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setError('') }}
              className="px-5 py-2.5 border border-white/15 text-white/50 rounded-lg hover:border-white/30 hover:text-white/80 transition-colors text-sm">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="flex items-center gap-4 bg-white/3 rounded-xl p-3.5 border border-white/[0.07]">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white/90 text-sm font-medium">@{u.username}</p>
                {u.isAdmin && <span className="text-xs px-1.5 py-px bg-white/10 text-white/50 rounded">Admin</span>}
              </div>
              {u.displayName && u.displayName !== u.username && (
                <p className="text-white/35 text-xs mt-0.5">{u.displayName}</p>
              )}
            </div>
            <a href={`/${u.username}`} target="_blank"
              className="text-white/25 hover:text-white/60 text-xs transition-colors">Ver ↗</a>
            {confirmDelete === u.id ? (
              <div className="flex items-center gap-1">
                <button onClick={() => handleDelete(u.id)}
                  className="text-red-400 text-xs px-3 py-1.5 rounded-lg border border-red-400/30 hover:border-red-400/60 transition-colors">Confirmar</button>
                <button onClick={() => setConfirmDelete(null)}
                  className="text-white/30 hover:text-white text-xs px-2 py-1.5 transition-colors">✕</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(u.id)}
                className="text-white/25 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-400/30 transition-colors">
                Eliminar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
