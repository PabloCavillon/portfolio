'use client'
import { usePathname } from 'next/navigation'

export default function HomeButton() {
  const path = usePathname()
  if (path === '/' || path.startsWith('/admin')) return null
  return (
    <a
      href="/"
      className="fixed top-4 left-4 z-40 flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm text-white/50 hover:text-white hover:bg-white/8 hover:border-white/20 transition-all"
      aria-label="Inicio"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    </a>
  )
}
