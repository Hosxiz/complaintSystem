// ==============================================================================
// 🧑‍🏫 หน้า Staff Portal Server Page (/staff)
// ดึงตั๋วทั้งหมดในระบบมาแสดงในกองกลาง (Staff Shared Pool) พร้อมข้อมูลผู้ร้องเรียน
// ==============================================================================
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  // 2. ดึง Profile และ ตั๋วทั้งหมดพร้อมกันแบบคู่ขนาน (Parallel Fetching with Promise.all เพื่อความเร็วสูงสุด)
  const [profileRes, ticketsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
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
        rating,
        rating_feedback,
        rated_at,
        category:categories(name),
        complainant:profiles!tickets_user_id_fkey(full_name, email),
        attachments:ticket_attachments(id, file_name, file_url, mime_type, file_size_bytes)
      `)
      .order('created_at', { ascending: false }),
  ])

  const profile = profileRes.data

  // ต้องเป็น Staff หรือ Admin เท่านั้นถึงจะเข้าห้องนี้ได้
  if (profile?.role !== 'staff' && profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const tickets = ticketsRes.data || []

  return (
    <div className="min-h-screen bg-slate-50">
      <StaffClientView initialTickets={tickets} staffProfile={profile} />
    </div>
  )
}
