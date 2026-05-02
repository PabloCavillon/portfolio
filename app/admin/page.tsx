import { getSession } from '@/lib/auth'
import { getWorksByUserId } from '@/lib/data'
import { getUserById } from '@/lib/users'
import { redirect } from 'next/navigation'
import AdminDashboard from './components/AdminDashboard'

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [user, works] = await Promise.all([
    getUserById(session.userId),
    getWorksByUserId(session.userId),
  ])

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminDashboard initialWorks={works} user={user} />
    </div>
  )
}
