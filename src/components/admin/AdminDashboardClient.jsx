'use client'

// ==============================================================================
// 👑 Admin Dashboard Client Component (Refined Tasklify Pro Style)
// สไตล์ Executive Dashboard: การ์ด KPI 4 ช่อง, แท็บสลับหน้าจอ (คิวงาน / หมวดหมู่ / สิทธิ์ผู้ใช้)
// ==============================================================================
import { useState } from 'react'
import AdminTicketQueue from '@/components/admin/AdminTicketQueue'
import CategoryManager from '@/components/admin/CategoryManager'
import UserRoleManager from '@/components/admin/UserRoleManager'
import {
  ShieldCheck,
  Users,
  FileText,
  Clock,
  TrendingUp,
  Inbox,
  FolderTree,
  UserCog,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

export default function AdminDashboardClient({
  initialTickets = [],
  initialCategories = [],
  initialProfiles = [],
  currentAdminId,
  adminProfile,
}) {
  const [activeTab, setActiveTab] = useState('tickets') // 'tickets' | 'categories' | 'roles'

  const totalTickets = initialTickets.length
  const pendingTickets = initialTickets.filter((t) =>
    ['SUBMITTED', 'RECEIVED'].includes(t.status)
  ).length
  const inProgressTickets = initialTickets.filter((t) =>
    ['IN_PROGRESS', 'WAITING'].includes(t.status)
  ).length
  const resolvedTickets = initialTickets.filter((t) =>
    ['RESOLVED', 'CLOSED'].includes(t.status)
  ).length
  const totalStaff = initialProfiles.filter((p) => p.role === 'staff').length
  const resolutionRate =
    totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0

  return (
    <div className="space-y-6 font-sans">
      {/* ============================================================================== */}
      {/* 1. Header ทักทายผู้ดูแลระบบ                                                     */}
      {/* ============================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Executive Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ศูนย์ควบคุมระบบ (Admin Overview)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            ติดตามภาพรวมเรื่องร้องเรียนทั้งสถาบัน มหาวิทยาลัยสวนดุสิต และบริหารจัดการทรัพยากร
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
            {adminProfile?.full_name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="pr-2">
            <span className="text-xs font-bold text-slate-800 block">
              {adminProfile?.full_name || 'ผู้ดูแลระบบ'}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block">
              ● ผู้ดูแลระบบสูงสุด (Super Admin)
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. สรุปสถิติ KPI การ์ด 4 ช่อง (ตาม Ref Tasklify Pro ด้านบน)                      */}
      {/* ============================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* การ์ดที่ 1: สตาฟปฏิบัติการ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition group">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">เจ้าหน้าที่</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{totalStaff}</div>
            <div className="text-xs text-slate-500 mt-0.5">บุคลากรที่ได้รับสิทธิ์ Staff</div>
          </div>
        </div>

        {/* การ์ดที่ 2: เรื่องทั้งหมดในระบบ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition group">
          <div className="flex items-center justify-between text-blue-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">เรื่องทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">{totalTickets}</div>
            <div className="text-xs text-slate-500 mt-0.5">เรื่องร้องเรียนทั้งหมด</div>
          </div>
        </div>

        {/* การ์ดที่ 3: กำลังดำเนินการ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-amber-300 transition group">
          <div className="flex items-center justify-between text-amber-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">อยู่ระหว่างแก้ปัญหา</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-600">{inProgressTickets + pendingTickets}</div>
            <div className="text-xs text-slate-500 mt-0.5">รอดำเนินการ {pendingTickets} / กำลังซ่อม {inProgressTickets}</div>
          </div>
        </div>

        {/* การ์ดที่ 4: อัตราความสำเร็จ (Target Percentage Completed) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition group">
          <div className="flex items-center justify-between text-emerald-600 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">อัตราความสำเร็จ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{resolutionRate}%</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {resolvedTickets} สำเร็จ
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">เป้าหมายความพึงพอใจการแก้ไข</div>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 3. แท็บสลับหน้าจอ (Segmented Tabs Controller)                                    */}
      {/* ============================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'tickets'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>คิวคัดกรองคำร้อง ({initialTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'categories'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>จัดการหมวดหมู่ ({initialCategories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'roles'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>จัดการสิทธิ์บุคลากร ({initialProfiles.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-medium px-2 hidden sm:block">
          ระบบควบคุมสำหรับผู้ดูแลระบบ มหาวิทยาลัยสวนดุสิต
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 4. แสดงผลตามแท็บที่เลือก                                                        */}
      {/* ============================================================================== */}
      <div className="transition-all duration-300">
        {activeTab === 'tickets' && (
          <div className="animate-in fade-in duration-200">
            <AdminTicketQueue
              initialTickets={initialTickets}
              categories={initialCategories}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="animate-in fade-in duration-200">
            <CategoryManager initialCategories={initialCategories} />
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="animate-in fade-in duration-200">
            <UserRoleManager
              initialProfiles={initialProfiles}
              currentAdminId={currentAdminId}
            />
          </div>
        )}
      </div>
    </div>
  )
}
