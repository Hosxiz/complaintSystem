// ==============================================================================
// 👑 หน้า Admin Portal Server Page (/admin) - รวมครบทุกฟีเจอร์สำหรับ Admin
// ==============================================================================
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const currentProfile = profile || {
    full_name: 'ครูใหญ่ผู้ดูแลระบบ (Admin Demo)',
    email: 'admin@school.local',
    role: 'admin',
  }

  let tickets = []
  let profiles = []
  let categories = []

  if (user) {
    const { data: t } = await supabase.from('tickets').select(`
      id, ticket_code, title, description, status, is_anonymous, category_id, created_at, rating, rating_feedback, rated_at, category:categories(name), complainant:profiles!tickets_user_id_fkey(full_name, email)
    `).order('created_at', { ascending: false })
    if (t) tickets = t

    const { data: p } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (p) profiles = p

    const { data: c } = await supabase.from('categories').select('*').order('name')
    if (c) categories = c
  }

  const totalTickets = tickets.length
  const activeTickets = tickets.filter((t) =>
    ['SUBMITTED', 'RECEIVED', 'IN_PROGRESS', 'WAITING'].includes(t.status)
  ).length
  const resolvedTickets = tickets.filter((t) =>
    ['RESOLVED', 'CLOSED'].includes(t.status)
  ).length
  const totalStaff = profiles.filter((p) => p.role === 'staff').length

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar profile={currentProfile} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboardClient
          initialTickets={tickets}
          initialCategories={categories}
          initialProfiles={profiles}
          currentAdminId={user?.id || 'admin-id'}
          adminProfile={currentProfile}
        />
      </main>
    </div>
  )
}
