import { getSession } from '@/lib/auth'
import { getAllUsers } from '@/lib/users'
import { redirect } from 'next/navigation'
import UsersPanel from './components/UsersPanel'

export default async function UsersPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/admin')

  const users = await getAllUsers()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <UsersPanel initialUsers={users} />
    </div>
  )
}
