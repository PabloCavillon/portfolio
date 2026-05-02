'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error')
    if (!err) return
    const msgs: Record<string, string> = {
      oauth_config:         'Google OAuth no está configurado',
      state_mismatch:       'Error de seguridad OAuth (state). Intentá de nuevo.',
      token_exchange:       'Error al intercambiar código con Google (redirect URI incorrecto).',
      profile_fetch:        'Error al obtener perfil de Google.',
      db_error:             'Error al crear cuenta. Revisá los logs.',
      google_access_denied: 'Acceso denegado por Google (revisá el OAuth consent screen).',
    }
    setError(msgs[err] ?? `Error Google: ${err}`)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      setError('Usuario o contraseña incorrectos')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <h1 className="text-2xl font-light text-white mb-1">Admin</h1>
        <p className="text-white/30 text-sm mb-8">Acceso al panel de administración</p>

        {/* Google */}
        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-3 w-full border border-white/15 rounded-lg py-3 text-white/70 hover:border-white/30 hover:text-white transition-colors text-sm mb-6"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 6.294C4.672 4.169 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </a>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-white/20 text-xs">o</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Usuario"
            autoComplete="username"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
            required
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            autoComplete="current-password"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-white/25 transition-colors"
            required
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black rounded-lg py-3 text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-white/25 text-sm">
          ¿No tenés cuenta?{' '}
          <a href="/admin/register" className="text-white/50 hover:text-white transition-colors">
            Registrarse
          </a>
        </p>

        <a href="/" className="block mt-3 text-center text-white/20 hover:text-white/40 text-sm transition-colors">
          ← Inicio
        </a>
      </div>
    </div>
  )
}
