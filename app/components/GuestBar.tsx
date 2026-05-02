export default function GuestBar() {
  return (
    <div className="fixed top-4 right-4 z-40">
      <a
        href="/admin/register"
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-sm text-white/55 hover:text-white hover:bg-white/8 hover:border-white/20 text-xs uppercase tracking-widest transition-all"
      >
        Acceder
      </a>
    </div>
  )
}
