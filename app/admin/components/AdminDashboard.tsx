'use client'
import { useState } from 'react'
import type { Work, User } from '@/lib/types'
import WorkForm from './WorkForm'

type Tab = 'works' | 'profile'

const TABS: { id: Tab; label: string }[] = [
  { id: 'works', label: 'Trabajos' },
  { id: 'profile', label: 'Perfil' },
]

export default function AdminDashboard({ initialWorks, user }: { initialWorks: Work[]; user: User }) {
  const [tab, setTab] = useState<Tab>('works')
  const [works, setWorks] = useState<Work[]>(initialWorks)
  const [editing, setEditing] = useState<Work | null>(null)
  const [adding, setAdding] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState(user.displayName)
  const [bio, setBio] = useState(user.bio)
  const [password, setPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/admin/login'
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/works/${id}`, { method: 'DELETE' })
    if (res.ok) { setWorks(prev => prev.filter(w => w.id !== id)); setConfirmDelete(null) }
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

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg('')
    const body: Record<string, string> = { displayName, bio }
    if (password) body.password = password
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSavingProfile(false)
    if (res.ok) {
      setProfileMsg('Cambios guardados')
      setPassword('')
      setTimeout(() => setProfileMsg(''), 3000)
    } else {
      setProfileMsg('Error al guardar')
    }
  }

  const showForm = adding || editing !== null

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <a href={`/${user.username}`} className="text-white/30 hover:text-white/70 text-sm transition-colors">
            ← Mi portfolio
          </a>
          <span className="text-white/15 text-sm">|</span>
          <span className="text-white/50 text-sm">{user.displayName || user.username}</span>
        </div>
        <div className="flex items-center gap-4">
          {user.isAdmin && (
            <a href="/admin/users" className="text-white/30 hover:text-white/70 text-xs uppercase tracking-widest transition-colors">
              Usuarios
            </a>
          )}
          <button onClick={handleLogout} className="text-white/30 hover:text-white/70 text-sm transition-colors">
            Salir
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-8 border-b border-white/8">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
              tab === id ? 'border-white text-white' : 'border-transparent text-white/35 hover:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Works tab */}
      {tab === 'works' && (
        <>
          {!showForm && (
            <button
              onClick={() => { setAdding(true); setEditing(null) }}
              className="mb-6 flex items-center gap-2 px-4 py-2 border border-white/15 rounded-lg text-white/50 hover:border-white/30 hover:text-white/80 transition-colors text-sm"
            >
              <span className="text-lg leading-none">+</span> Agregar trabajo
            </button>
          )}

          {showForm && (
            <div className="mb-6 bg-white/4 rounded-xl p-6 border border-white/10">
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

          {works.length === 0 ? (
            <p className="text-white/20 text-center py-16">No hay trabajos todavía.</p>
          ) : (
            <div className="space-y-2">
              {works.map(work => {
                const thumb = work.type === 'single' ? work.imageUrl : (work.afterImageUrl ?? work.beforeImageUrl)
                return (
                  <div key={work.id} className="flex items-center gap-4 bg-white/3 rounded-xl p-3.5 border border-white/7">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                      {thumb
                        ? <img src={thumb} alt={work.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-white/15 text-xs">—</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm font-medium truncate">{work.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        {work.categories.map(cat => (
                          <span key={cat} className="text-white/35 text-xs">{cat}</span>
                        ))}
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
                          <button onClick={() => handleDelete(work.id)} className="text-red-400 text-xs px-3 py-1.5 rounded-lg border border-red-400/30 hover:border-red-400/60 transition-colors">
                            Confirmar
                          </button>
                          <button onClick={() => setConfirmDelete(null)} className="text-white/30 hover:text-white text-xs px-2 py-1.5 transition-colors">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(work.id)} className="text-white/25 hover:text-red-400 text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-400/30 transition-colors">
                          Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Profile tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-5 max-w-md">
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Nombre para mostrar</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/25 transition-colors resize-none"
            />
          </div>
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-wider mb-2">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Dejar en blanco para no cambiar"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4 pt-1">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-white text-black rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {savingProfile ? 'Guardando...' : 'Guardar perfil'}
            </button>
            {profileMsg && (
              <p className={`text-sm ${profileMsg.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {profileMsg}
              </p>
            )}
          </div>
          <div className="pt-4 border-t border-white/8">
            <p className="text-white/20 text-xs">Usuario: <span className="text-white/35">@{user.username}</span></p>
          </div>
        </form>
      )}
    </div>
  )
}
