'use client'

export default function OwnerBar() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-sm">
      <a
        href="/admin"
        className="text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors px-2 py-1"
      >
        Admin
      </a>
      <span className="text-white/15 text-xs">|</span>
      <button
        onClick={handleLogout}
        className="text-white/50 hover:text-white text-xs uppercase tracking-widest transition-colors px-2 py-1"
      >
        Salir
      </button>
    </div>
  )
}
