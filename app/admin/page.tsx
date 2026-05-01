import { getWorks } from '@/lib/data'
import AdminDashboard from './components/AdminDashboard'

export default async function AdminPage() {
  const works = await getWorks()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminDashboard initialWorks={works} />
    </div>
  )
}
