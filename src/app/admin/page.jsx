// ==============================================================================
// 👑 หน้า Admin Portal Server Page (/admin) - รวมครบทุกฟีเจอร์สำหรับ Admin
// ==============================================================================
export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import UserRoleManager from '@/components/admin/UserRoleManager'
import AdminTicketQueue from '@/components/admin/AdminTicketQueue'
import CategoryManager from '@/components/admin/CategoryManager'
import { ShieldCheck, Users, FileText, CheckCircle2, Clock } from 'lucide-react'

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
      id, ticket_code, title, description, status, is_anonymous, category_id, created_at, category:categories(name), complainant:profiles!tickets_user_id_fkey(full_name, email)
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

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ศูนย์ควบคุมระบบ (Admin Dashboard)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            ภาพรวมเรื่องร้องเรียนทั้งระบบ จัดหมวดหมู่ และแต่งตั้งสิทธิ์เจ้าหน้าที่
          </p>
        </div>

        {/* 1. สถิติตัวเลข 4 ช่อง */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">เรื่องทั้งหมดในระบบ</span>
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
              <span className="text-xs text-slate-400 font-semibold block">แก้ไขเสร็จสิ้น</span>
              <span className="text-2xl font-bold text-slate-800">{resolvedTickets}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold block">เจ้าหน้าที่ (Staff)</span>
              <span className="text-2xl font-bold text-slate-800">{totalStaff}</span>
            </div>
          </div>
        </div>

        {/* 2. คิวคัดกรองและปรับเปลี่ยนหมวดหมู่เคส */}
        <AdminTicketQueue initialTickets={tickets} categories={categories} />

        {/* 3. จัดการหมวดหมู่ (เพิ่ม / ลบ หมวดหมู่เรื่องร้องเรียน) */}
        <CategoryManager initialCategories={categories} />

        {/* 4. แต่งตั้งสิทธิ์ผู้ใช้งาน (User Roles) */}
        <UserRoleManager initialProfiles={profiles} currentAdminId={user?.id || 'admin-id'} />
      </main>
    </div>
  )
}
