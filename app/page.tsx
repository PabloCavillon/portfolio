import { getUsersWithPreview } from '@/lib/users'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const users = await getUsersWithPreview()

  if (users.length === 1) {
    redirect(`/${users[0].username}`)
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed -top-48 -left-24 h-128 w-lg rounded-full bg-white/2 blur-[120px]" />
      <div className="pointer-events-none fixed -top-16 right-1/4 h-72 w-72 rounded-full bg-white/1 blur-[90px]" />

      <div className="relative max-w-5xl mx-auto px-6 md:px-10 pt-20 pb-16 md:pt-32 md:pb-20">
        <p className="text-white/20 text-[11px] uppercase tracking-[0.45em] mb-8 animate-fade-up">
          Estudio creativo
        </p>
        <h1
          className="text-[clamp(3.8rem,12vw,8.5rem)] font-extralight leading-none tracking-[-0.02em] uppercase animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          Portfolio
        </h1>
        <div
          className="mt-8 border-t border-white/8 pt-10 animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          {users.length === 0 ? (
            <p className="text-white/20 text-sm tracking-wide">Próximamente.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user, i) => (
                <a
                  key={user.id}
                  href={`/${user.username}`}
                  className="group relative overflow-hidden rounded-xl bg-white/3 border border-white/7 hover:border-white/15 transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${i * 65}ms` }}
                >
                  <div className="aspect-video overflow-hidden bg-white/3">
                    {user.previewUrl ? (
                      <img
                        src={user.previewUrl}
                        alt={user.displayName || user.username}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10 text-xs uppercase tracking-widest">
                        Sin trabajos
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-white/85 font-medium text-sm group-hover:text-white transition-colors">
                      {user.displayName || user.username}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      @{user.username} &nbsp;·&nbsp; {user.workCount} {user.workCount === 1 ? 'trabajo' : 'trabajos'}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-white/5 py-10 px-6 text-center">
        <p className="text-white/10 text-[11px] uppercase tracking-[0.35em]">
          Portfolio &nbsp;·&nbsp; {new Date().getFullYear()}
        </p>
      </footer>

    </main>
  )
}
