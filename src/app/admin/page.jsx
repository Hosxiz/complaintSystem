// ==============================================================================
// 👑 หน้า Admin Portal Server Page (/admin) - รวมครบทุกฟีเจอร์สำหรับ Admin
// ==============================================================================
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 🚀 ดึงข้อมูลทุกตารางพร้อมกันแบบคู่ขนาน (Parallel Promise.all) เพื่อลดความหน่วง
  const [profileRes, ticketsRes, profilesRes, categoriesRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('tickets')
      .select(`
        id, ticket_code, title, description, status, is_anonymous, category_id, created_at, rating, rating_feedback, rated_at, category:categories(name), complainant:profiles!tickets_user_id_fkey(full_name, email)
      `)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('name'),
  ])

  const profile = profileRes.data

  // ป้องกันผู้ที่ไม่ใช่ Admin แอบเข้าหน้านี้
  if (profile?.role !== 'admin') {
    redirect(profile?.role === 'staff' ? '/staff' : '/dashboard')
  }

  const tickets = ticketsRes.data || []
  const profiles = profilesRes.data || []
  const categories = categoriesRes.data || []

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar profile={profile} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboardClient
          initialTickets={tickets}
          initialCategories={categories}
          initialProfiles={profiles}
          currentAdminId={user.id}
          adminProfile={profile}
        />
      </main>
    </div>
  )
}
