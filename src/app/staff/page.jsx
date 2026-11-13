// ==============================================================================
// 🧑‍🏫 หน้า Staff Portal Server Page (/staff)
// ดึงตั๋วทั้งหมดในระบบมาแสดงในกองกลาง (Staff Shared Pool) พร้อมข้อมูลผู้ร้องเรียน
// ==============================================================================
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import StaffClientView from '@/components/staff/StaffClientView'

export default async function StaffPage() {
  const supabase = await createClient()

  // 1. ตรวจสอบผู้ใช้จริง
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. ดึง Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // ต้องเป็น Staff หรือ Admin เท่านั้นถึงจะเข้าห้องนี้ได้
  if (profile?.role !== 'staff' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  // 3. 🎯 ดึงตั๋วทั้งหมดในระบบมาแสดงในกองกลาง (Staff Shared Pool)
  const { data: tickets = [] } = await supabase
    .from('tickets')
    .select(`
      id,
      ticket_code,
      title,
      description,
      status,
      is_anonymous,
      assigned_staff_id,
      created_at,
      category:categories(name),
      complainant:profiles!tickets_user_id_fkey(full_name, email)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar profile={profile} />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <StaffClientView initialTickets={tickets} staffProfile={profile} />
      </main>
    </div>
  )
}
