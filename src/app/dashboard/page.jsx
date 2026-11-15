// ==============================================================================
// 🧑‍💼 หน้า Dashboard สำหรับ User (Force Dynamic Render for Next.js 16)
// ==============================================================================
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import NewTicketForm from '@/components/tickets/NewTicketForm'
import TicketTracker from '@/components/tickets/TicketTracker'
import UserTicketList from '@/components/tickets/UserTicketList'
import { STATUS_CONFIG } from '@/lib/tickets/status-config'
import { Inbox, FileText, CheckCircle2, Clock } from 'lucide-react'

export default async function UserDashboard() {
  const supabase = await createClient()

  // 1. ตรวจสอบผู้ใช้จริงจาก Supabase Session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const currentProfile = profile || {
    full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ผู้ใช้งาน',
    email: user?.email || 'user@example.com',
    role: 'user',
  }

  // 2. ดึงรายการตั๋วของ User คนนี้จาก Supabase
  let tickets = []
  if (user) {
    const { data } = await supabase
      .from('tickets')
      .select(`
        id,
        ticket_code,
        tracking_code,
        title,
        description,
        status,
        is_anonymous,
        created_at,
        category:categories(name),
        attachments:ticket_attachments(id, file_name, file_url, mime_type, file_size_bytes)
      `)
      .order('created_at', { ascending: false })

    if (data) tickets = data
  }

  // 3. ดึงหมวดหมู่จริงจากตาราง categories (UUID จริงจาก Database!)
  let categories = []
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  if (dbCategories && dbCategories.length > 0) {
    categories = dbCategories
  }

  const totalTickets = tickets.length
  const activeTickets = tickets.filter((t) =>
    ['SUBMITTED', 'RECEIVED', 'IN_PROGRESS', 'WAITING'].includes(t.status)
  ).length
  const resolvedTickets = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar profile={currentProfile} />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ยินดีต้อนรับ, {currentProfile.full_name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            ศูนย์รวมการยื่นเรื่องร้องเรียนและติดตามผลการดำเนินงาน
          </p>
        </div>

        {/* การ์ดสถิติ 3 ใบ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">เรื่องที่ส่งทั้งหมด</span>
              <span className="text-2xl font-bold text-slate-800">{totalTickets}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">กำลังดำเนินการ</span>
              <span className="text-2xl font-bold text-slate-800">{activeTickets}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">แก้ไขเสร็จสิ้นแล้ว</span>
              <span className="text-2xl font-bold text-slate-800">{resolvedTickets}</span>
            </div>
          </div>
        </div>

        {/* 2 คอลัมน์ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ซ้าย: ตารางเคสของฉัน */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-slate-600" />
                  <h2 className="font-bold text-slate-800 text-base">เรื่องร้องเรียนของฉัน</h2>
                </div>
                <span className="text-xs text-slate-400">{tickets.length} รายการ</span>
              </div>

              <UserTicketList initialTickets={tickets} />
            </div>

            {/* กล่องค้นหาด้วย Tracking Code */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-4">
              <TicketTracker />
            </div>
          </div>

          {/* ขวา: ฟอร์มส่งเรื่องใหม่ */}
          <div className="lg:col-span-5 sticky top-24">
            <NewTicketForm categories={categories} />
          </div>
        </div>
      </main>
    </div>
  )
}
