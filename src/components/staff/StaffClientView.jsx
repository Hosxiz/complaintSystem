'use client'

// ==============================================================================
// 🧑‍🏫 Staff Portal Client Component (Kanban Board & KPI Dashboard)
// ออกแบบตาม Modern SaaS Helpdesk Ref: รองรับกระดาน Kanban, ตัวกรอง, สถิติ KPI,
// ส่งออกไฟล์รายงาน (Export CSV UTF-8 BOM), ลบคำร้องที่เสร็จแล้ว และบันทึกประวัติการลบ (Audit Logs)
// ==============================================================================
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { STATUS_CONFIG } from '@/lib/tickets/status-config'
import StaffStatusSelector from '@/components/staff/StaffStatusSelector'
import TicketDiscussion from '@/components/tickets/TicketDiscussion'
import DateFilterBurgerDrawer from '@/components/dashboard/DateFilterBurgerDrawer'
import TrendAnalyticsSection from '@/components/dashboard/TrendAnalyticsSection'
import StaffSidebar from '@/components/staff/StaffSidebar'
import { filterTicketsByDate } from '@/lib/utils/date-filter'
import { createClient } from '@/lib/supabase/client'
import {
  Kanban,
  List,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  EyeOff,
  User,
  X,
  Calendar,
  Tag,
  ArrowRight,
  TrendingUp,
  Inbox,
  Sparkles,
  Download,
  Trash2,
  History,
  FileSpreadsheet,
  AlertTriangle,
  Loader2,
  Star,
  Menu,
  LayoutDashboard,
  BarChart3,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'

export default function StaffClientView({ initialTickets = [], staffProfile }) {
  const router = useRouter()
  const supabase = createClient()
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' หรือ 'list'
  const [activeNav, setActiveNav] = useState('dashboard') // 'dashboard' | 'analytics' | 'tickets'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')
  const [customRange, setCustomRange] = useState({ start: '', end: '' })

  // States สำหรับระบบลบคำร้อง & บันทึกประวัติ
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [deletionLogs, setDeletionLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // 🍔 กรองคำร้องตามช่วงเวลา (Burger Drawer Date Filter)
  const dateFilteredTickets = useMemo(() => {
    return filterTicketsByDate(tickets, dateFilter, customRange)
  }, [tickets, dateFilter, customRange])

  // คำนวณสถิติภาพรวม (KPI Stats เหมือนใน Ref)
  const stats = useMemo(() => {
    const total = dateFilteredTickets.length
    const pending = dateFilteredTickets.filter((t) => t.status === 'SUBMITTED' || t.status === 'RECEIVED').length
    const inProgress = dateFilteredTickets.filter((t) => t.status === 'IN_PROGRESS').length
    const waiting = dateFilteredTickets.filter((t) => t.status === 'WAITING').length
    const resolved = dateFilteredTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

    return { total, pending, inProgress, waiting, resolved, resolutionRate }
  }, [dateFilteredTickets])

  // ⭐ คำนวณความพึงพอใจเฉลี่ยและแยกตามแต่ละหมวดหมู่
  const satisfactionData = useMemo(() => {
    const rated = dateFilteredTickets.filter((t) => t.rating && Number(t.rating) > 0)
    const avg =
      rated.length > 0
        ? (rated.reduce((sum, t) => sum + Number(t.rating), 0) / rated.length).toFixed(1)
        : null

    const catMap = {}
    dateFilteredTickets.forEach((t) => {
      const catName = t.category?.name || 'ทั่วไป'
      if (!catMap[catName]) {
        catMap[catName] = { name: catName, total: 0, ratedCount: 0, ratingSum: 0 }
      }
      catMap[catName].total += 1
      if (t.rating && Number(t.rating) > 0) {
        catMap[catName].ratedCount += 1
        catMap[catName].ratingSum += Number(t.rating)
      }
    })

    const catList = Object.values(catMap).map((c) => ({
      ...c,
      avgRating: c.ratedCount > 0 ? (c.ratingSum / c.ratedCount).toFixed(1) : null,
    }))

    return {
      categoryList: catList,
      overallAvg: avg,
      totalRated: rated.length,
    }
  }, [dateFilteredTickets])

  // ดึงรายชื่อหมวดหมู่ทั้งหมดสำหรับทำตัวกรอง
  const categoriesList = useMemo(() => {
    const cats = new Set()
    dateFilteredTickets.forEach((t) => {
      if (t.category?.name) cats.add(t.category.name)
    })
    return Array.from(cats)
  }, [dateFilteredTickets])

  // กรองตั๋วตามการค้นหาและหมวดหมู่
  const filteredTickets = useMemo(() => {
    return dateFilteredTickets.filter((t) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        t.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (!t.is_anonymous && t.complainant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchCategory = selectedCategory === 'ALL' || t.category?.name === selectedCategory

      return matchSearch && matchCategory
    })
  }, [dateFilteredTickets, searchQuery, selectedCategory])

  // คอลัมน์สำหรับกระดาน Kanban 4 สถานะหลัก
  const kanbanColumns = [
    {
      id: 'pending',
      title: 'รอดำเนินการ',
      subtitle: 'Not Started / Pending',
      dotColor: 'bg-amber-500',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      statuses: ['SUBMITTED', 'RECEIVED'],
    },
    {
      id: 'in_progress',
      title: 'กำลังตรวจสอบ',
      subtitle: 'In Progress',
      dotColor: 'bg-blue-500',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      statuses: ['IN_PROGRESS'],
    },
    {
      id: 'waiting',
      title: 'รอข้อมูลเพิ่มเติม',
      subtitle: 'Waiting Info',
      dotColor: 'bg-purple-500',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      statuses: ['WAITING'],
    },
    {
      id: 'resolved',
      title: 'แก้ไขเสร็จสิ้น',
      subtitle: 'Resolved',
      dotColor: 'bg-emerald-500',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      statuses: ['RESOLVED', 'CLOSED'],
    },
  ]

  // เมื่อเจ้าหน้าที่เปลี่ยนสถานะงาน
  const handleStatusChange = (newStatus) => {
    if (!selectedTicket) return
    const updated = { ...selectedTicket, status: newStatus }
    setSelectedTicket(updated)
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  // 📥 ฟังก์ชันส่งออกรายงานเป็นไฟล์ CSV (UTF-8 BOM สำหรับ Microsoft Excel ภาษาไทย)
  const handleExportCSV = () => {
    if (filteredTickets.length === 0) {
      alert('ไม่มีข้อมูลเรื่องร้องเรียนสำหรับส่งออก')
      return
    }

    const headers = [
      'รหัสตั๋ว',
      'วันที่แจ้ง',
      'หัวข้อเรื่องร้องเรียน',
      'หมวดหมู่',
      'สถานะ',
      'ผู้ร้องเรียน',
      'รายละเอียดปัญหา',
    ]

    const rows = filteredTickets.map((t) => {
      const statusInfo = STATUS_CONFIG[t.status] || STATUS_CONFIG.SUBMITTED
      const dateStr = new Date(t.created_at).toLocaleString('th-TH')
      const complainantName = t.is_anonymous
        ? 'ซ่อนตัวตน (Anonymous Whistleblower)'
        : t.complainant?.full_name || 'ผู้ใช้งาน'
      const cleanDesc = (t.description || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')
      const cleanTitle = (t.title || '').replace(/"/g, '""')

      return [
        `"${t.ticket_code}"`,
        `"${dateStr}"`,
        `"${cleanTitle}"`,
        `"${t.category?.name || 'ทั่วไป'}"`,
        `"${statusInfo.label}"`,
        `"${complainantName}"`,
        `"${cleanDesc}"`,
      ].join(',')
    })

    // ใส่ \uFEFF นำหน้าเพื่อให้ Excel เปิดภาษาไทยได้อย่างถูกต้อง
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `รายงานเรื่องร้องเรียน_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 📜 ดึงประวัติการลบคำร้อง (Audit Logs)
  const fetchDeletionLogs = async () => {
    setLoadingLogs(true)
    try {
      const { data, error } = await supabase
        .from('ticket_deletion_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (!error && data) {
        setDeletionLogs(data)
      }
    } catch (err) {
      console.warn('Could not fetch deletion logs:', err.message)
    } finally {
      setLoadingLogs(false)
    }
  }

  // 🗑️ ยืนยันการลบคำร้องที่เสร็จแล้ว พร้อมบันทึก Log
  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return
    setDeleteLoading(true)

    try {
      // 1. บันทึกลง Audit Log ก่อนลบ
      try {
        await supabase.from('ticket_deletion_logs').insert({
          ticket_id: ticketToDelete.id,
          ticket_code: ticketToDelete.ticket_code,
          title: ticketToDelete.title,
          category_name: ticketToDelete.category?.name || 'ทั่วไป',
          deleted_by: staffProfile?.id || null,
          deleted_by_name: staffProfile?.full_name || 'เจ้าหน้าที่',
          reason: deleteReason.trim() || 'คำร้องได้รับการแก้ไขเสร็จสิ้นแล้ว ลบตามนโยบายจัดเก็บข้อมูล',
        })
      } catch (logErr) {
        console.warn('Logging skipped:', logErr.message)
      }

      // 2. ลบคำร้องออกจากตาราง tickets
      const { data, error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketToDelete.id)
        .select()

      if (error) throw error

      if (!data || data.length === 0) {
        throw new Error(
          'ฐานข้อมูลไม่อนุญาตให้ลบ (ติด RLS Policy ใน Supabase) กรุณารันไฟล์ fix_ticket_delete_policy.sql ใน Supabase SQL Editor'
        )
      }

      // 3. อัปเดต UI ทันที
      setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete.id))
      if (selectedTicket?.id === ticketToDelete.id) {
        setSelectedTicket(null)
      }
      setTicketToDelete(null)
      setDeleteReason('')
      alert(`ลบคำร้อง ${ticketToDelete.ticket_code} และบันทึกประวัติเรียบร้อยแล้ว`)
    } catch (err) {
      alert('ไม่สามารถลบคำร้องได้: ' + err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  // 🚪 ฟังก์ชันออกจากระบบ
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // คำร้องรอดำเนินการ 5 รายการล่าสุดสำหรับแสดงบน Dashboard
  const recentPendingTickets = useMemo(() => {
    return dateFilteredTickets
      .filter((t) => ['SUBMITTED', 'RECEIVED'].includes(t.status))
      .slice(0, 5)
  }, [dateFilteredTickets])

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans flex">
      {/* ============================================================================== */}
      {/* 1. Sidebar เมนูนำทางด้านข้างตาม Ref LimeDock (Theme B: ขาว-ฟ้า สวนดุสิต)            */}
      {/* ============================================================================== */}
      <StaffSidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        onExportCsv={handleExportCSV}
        onOpenHistory={() => {
          fetchDeletionLogs()
          setShowHistoryModal(true)
        }}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        pendingCount={stats.pending}
        totalCount={stats.total}
        staffProfile={staffProfile}
        onSignOut={handleSignOut}
      />

      {/* ============================================================================== */}
      {/* 2. Main Workspace (ปรับระยะขอบอัตโนมัติตามสถานะ Sidebar)                           */}
      {/* ============================================================================== */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-[76px]' : 'lg:pl-64'
        }`}
      >
        {/* TopBar แถบนำทางด้านบน */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* ปุ่มเปิดเมนูด้านข้างบนมือถือ (Hamburger Button) */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition shadow-2xs cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb & Section Name */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                <span>Staff Portal</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-blue-600 font-extrabold">
                  {activeNav === 'dashboard'
                    ? 'Dashboard'
                    : activeNav === 'analytics'
                    ? 'Analytics'
                    : 'Tickets'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {activeNav === 'dashboard' && 'แดชบอร์ดภาพรวม (Overview)'}
                {activeNav === 'analytics' && 'สถิติและแนวโน้มคำร้อง (Trend Analytics)'}
                {activeNav === 'tickets' && 'กระดานจัดการและคัดกรองคำร้อง (Ticket Board)'}
              </h2>
            </div>
          </div>

          {/* Top Right Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🍔 ตัวกรองวันที่ (Burger Drawer Filter) */}
            <DateFilterBurgerDrawer
              activeFilter={dateFilter}
              onSelectFilter={setDateFilter}
              customRange={customRange}
              onCustomRangeChange={setCustomRange}
            />

            {/* สลับมุมมอง Kanban / List เมื่ออยู่ในหน้า tickets */}
            {activeNav === 'tickets' && (
              <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === 'kanban'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>กระดาน</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>ตาราง</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* ============================================================================== */}
        {/* 3. ส่วนเนื้อหาหลักตามแท็บที่เลือกใน Sidebar                                        */}
        {/* ============================================================================== */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ---------------- 3.1 VIEW: DASHBOARD (ภาพรวม) ---------------- */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header ทักทายเจ้าหน้าที่ */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Staff Operational Desk
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    ยินดีต้อนรับ, {staffProfile?.full_name || 'เจ้าหน้าที่'} 👋
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    ศูนย์ปฏิบัติการจัดการเรื่องร้องเรียน คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต
                  </p>
                </div>

                <button
                  onClick={() => setActiveNav('tickets')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition self-start sm:self-auto cursor-pointer"
                >
                  <Kanban className="w-4 h-4" />
                  <span>เปิดกระดานจัดการเคส</span>
                </button>
              </div>

              {/* สรุปสถิติ KPI การ์ด 4 ช่อง */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ทั้งหมด */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                  <div className="flex items-center justify-between text-slate-500 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">เรื่องทั้งหมด</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Inbox className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900">{stats.total}</div>
                    <div className="text-xs text-slate-500 mt-0.5">เคสที่ได้รับแจ้งในระบบ</div>
                  </div>
                </div>

                {/* รอดำเนินการ */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-amber-300 transition">
                  <div className="flex items-center justify-between text-amber-600 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">รอดำเนินการ</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-amber-600">{stats.pending}</div>
                    <div className="text-xs text-slate-500 mt-0.5">รอเจ้าหน้าที่เริ่มลงมือ</div>
                  </div>
                </div>

                {/* กำลังตรวจสอบ/แก้ไข */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-300 transition">
                  <div className="flex items-center justify-between text-blue-600 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">กำลังดำเนินการ</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-blue-600">{stats.inProgress}</div>
                    <div className="text-xs text-slate-500 mt-0.5">อยู่ระหว่างการแก้ปัญหา</div>
                  </div>
                </div>

                {/* แก้ไขสำเร็จแล้ว */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition">
                  <div className="flex items-center justify-between text-emerald-600 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">แก้ไขสำเร็จแล้ว</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-emerald-600">{stats.resolved}</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {stats.resolutionRate}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">อัตราการปิดเรื่องสำเร็จ</div>
                  </div>
                </div>
              </div>

              {/* สรุปความพึงพอใจการให้บริการแยกตามหมวดหมู่ */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      ความพึงพอใจการให้บริการแยกตามแต่ละหมวดหมู่ (Satisfaction by Category)
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/70">
                    <span className="text-xs font-semibold text-amber-800">คะแนนเฉลี่ยรวม:</span>
                    <span className="text-sm font-black text-amber-600">
                      {satisfactionData.overallAvg ? `⭐ ${satisfactionData.overallAvg} / 5.0` : 'ยังไม่มีการประเมิน'}
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">
                      ({satisfactionData.totalRated} เคส)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {satisfactionData.categoryList.map((cat) => (
                    <div
                      key={cat.name}
                      className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-2 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-800 truncate" title={cat.name}>
                          {cat.name}
                        </span>
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-amber-600">
                          {cat.avgRating ? `⭐ ${cat.avgRating} / 5` : 'รอประเมิน'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{
                            width: cat.avgRating ? `${(Number(cat.avgRating) / 5) * 100}%` : '0%',
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>ประเมินแล้ว: <b>{cat.ratedCount}</b></span>
                        <span>ทั้งหมด: <b>{cat.total}</b> เคส</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* รายการคำร้องรอดำเนินการล่าสุด (Quick Pending Queue) */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      คำร้องที่รอดำเนินการล่าสุด (Recent Pending Queue)
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveNav('tickets')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>ดูทั้งหมดบนกระดาน</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {recentPendingTickets.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    ไม่มีคำร้องค้างรอดำเนินการในขณะนี้ 🎉
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentPendingTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          setSelectedTicket(ticket)
                          setActiveNav('tickets')
                        }}
                        className="py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-blue-600 shrink-0">
                            {ticket.ticket_code}
                          </span>
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {ticket.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0 hidden sm:inline-block">
                            {ticket.category?.name || 'ทั่วไป'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {new Date(ticket.created_at).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------------- 3.2 VIEW: ANALYTICS (สถิติและแนวโน้ม) ---------------- */}
          {activeNav === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <TrendAnalyticsSection tickets={dateFilteredTickets} />
            </div>
          )}

          {/* ---------------- 3.3 VIEW: TICKETS (กระดานจัดการคำร้อง) ---------------- */}
          {activeNav === 'tickets' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* กล่องค้นหา, ตัวกรองหมวดหมู่, และตัวควบคุม */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                {/* ค้นหา */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ค้นหาตามรหัสตั๋ว, หัวข้อเรื่อง, หรือชื่อผู้ร้องเรียน..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* ตัวกรองหมวดหมู่, ส่งออกรายงาน, และดูประวัติการลบ */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option value="ALL">ทุกหมวดหมู่ ({tickets.length})</option>
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 📥 ปุ่มส่งออกรายงาน CSV */}
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    title="ส่งออกรายงานเป็นไฟล์ Excel (CSV ภาษาไทยสมบูรณ์)"
                  >
                    <Download className="w-4 h-4" />
                    <span>ส่งออกรายงาน ({filteredTickets.length})</span>
                  </button>

                  {/* 📜 ปุ่มเปิดดูประวัติการลบ */}
                  <button
                    onClick={() => {
                      setShowHistoryModal(true)
                      fetchDeletionLogs()
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                    title="ดูบันทึกประวัติการลบคำร้อง (Audit Log)"
                  >
                    <History className="w-4 h-4" />
                    <span>ประวัติการลบ</span>
                  </button>
                </div>
              </div>

              {/* แสดงผลกระดาน Kanban หรือ รายการตาราง */}
              {viewMode === 'kanban' ? (
                /* ============================================================================== */
                /* กระดาน Kanban 4 คอลัมน์                                                       */
                /* ============================================================================== */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                  {kanbanColumns.map((col) => {
                    const colTickets = filteredTickets.filter((t) =>
                      col.statuses.includes(t.status)
                    )

                    return (
                      <div
                        key={col.id}
                        className="bg-slate-100/70 rounded-3xl p-3 border border-slate-200/60 space-y-3 min-h-[500px] flex flex-col"
                      >
                        {/* Header ของแต่ละคอลัมน์ */}
                        <div className="flex items-center justify-between px-2 pt-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                            <h3 className="font-extrabold text-sm text-slate-800">
                              {col.title}
                            </h3>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-black border ${col.badgeColor}`}
                          >
                            {colTickets.length}
                          </span>
                        </div>

                        {/* การ์ดคำร้องในคอลัมน์ */}
                        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-0.5">
                          {colTickets.length === 0 ? (
                            <div className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                              <span>ไม่มีคำร้องในสถานะนี้</span>
                            </div>
                          ) : (
                            colTickets.map((ticket) => {
                              const isResolved =
                                ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'

                              return (
                                <div
                                  key={ticket.id}
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-2.5 group relative"
                                >
                                  {/* รหัสตั๋ว & หมวดหมู่ */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                      {ticket.ticket_code}
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[120px]">
                                      {ticket.category?.name || 'ทั่วไป'}
                                    </span>
                                  </div>

                                  {/* หัวข้อเรื่อง */}
                                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                                    {ticket.title}
                                  </h4>

                                  {/* ข้อมูลผู้ร้องเรียน & วันที่ */}
                                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                                      {ticket.is_anonymous ? (
                                        <>
                                          <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                          <span className="truncate text-slate-400 italic">
                                            ไม่ระบุตัวตน
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                          <span className="truncate font-medium text-slate-700">
                                            {ticket.complainant?.full_name || 'ผู้ใช้งาน'}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 shrink-0">
                                      {new Date(ticket.created_at).toLocaleDateString('th-TH', {
                                        day: 'numeric',
                                        month: 'short',
                                      })}
                                    </span>
                                  </div>

                                  {/* แสดงคะแนนรีวิวหากเคสนี้ได้รับการประเมินแล้ว */}
                                  {ticket.rating && (
                                    <div className="flex items-center gap-1 text-[11px] text-amber-600 font-extrabold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 w-fit">
                                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                      <span>{ticket.rating} ดาว</span>
                                    </div>
                                  )}

                                  {/* ปุ่มลบคำร้อง (แสดงเฉพาะเคสที่ปิดแล้ว) */}
                                  {isResolved && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setTicketToDelete(ticket)
                                      }}
                                      title="ลบคำร้องที่เสร็จสิ้นแล้ว"
                                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              )
                            })
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                /* ============================================================================== */
                /* มุมมองตาราง (List View)                                                        */
                /* ============================================================================== */
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-3 px-4">รหัสตั๋ว</th>
                          <th className="py-3 px-4">หัวข้อเรื่อง</th>
                          <th className="py-3 px-4">หมวดหมู่</th>
                          <th className="py-3 px-4">สถานะ</th>
                          <th className="py-3 px-4">ผู้ร้องเรียน</th>
                          <th className="py-3 px-4">ความพึงพอใจ</th>
                          <th className="py-3 px-4">วันที่แจ้ง</th>
                          <th className="py-3 px-4 text-right">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredTickets.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                              ไม่พบข้อมูลเรื่องร้องเรียนที่ตรงตามเงื่อนไข
                            </td>
                          </tr>
                        ) : (
                          filteredTickets.map((t) => {
                            const statusInfo =
                              STATUS_CONFIG[t.status] || STATUS_CONFIG.SUBMITTED
                            const isResolved =
                              t.status === 'RESOLVED' || t.status === 'CLOSED'

                            return (
                              <tr
                                key={t.id}
                                onClick={() => setSelectedTicket(t)}
                                className="hover:bg-slate-50/80 cursor-pointer transition"
                              >
                                <td className="py-3 px-4 font-mono font-bold text-blue-600">
                                  {t.ticket_code}
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                                  {t.title}
                                </td>
                                <td className="py-3 px-4 text-slate-600">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold">
                                    {t.category?.name || 'ทั่วไป'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${statusInfo.color}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${statusInfo.badgeDot}`}
                                    />
                                    {statusInfo.label}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  {t.is_anonymous ? (
                                    <span className="text-slate-400 italic text-xs">
                                      ไม่ระบุตัวตน
                                    </span>
                                  ) : (
                                    <span className="font-medium text-slate-800">
                                      {t.complainant?.full_name || 'ผู้ใช้งาน'}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {t.rating ? (
                                    <span className="text-amber-600 font-extrabold text-xs">
                                      ⭐ {t.rating} / 5
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 text-xs">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-slate-500 text-xs whitespace-nowrap">
                                  {new Date(t.created_at).toLocaleDateString('th-TH')}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  {isResolved && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setTicketToDelete(t)
                                      }}
                                      title="ลบคำร้องที่เสร็จแล้ว"
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

{/* ============================================================================== */}
      {/* 6. Slide-over Detail Drawer: หน้าต่างเปิดจากขวาเพื่อจัดการเคสและสนทนา             */}
      {/* ============================================================================== */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTicket(null)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-blue-600 bg-blue-100/60 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {selectedTicket.ticket_code}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold border bg-white border-slate-200 text-slate-600">
                  {selectedTicket.category?.name || 'หมวดหมู่ทั่วไป'}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title & Complainant Info */}
              <div className="space-y-3">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                  {selectedTicket.title}
                </h2>

                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs flex-1">
                    {selectedTicket.is_anonymous ? (
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <EyeOff className="w-4 h-4 text-slate-500" />
                        <span>ผู้ร้องเรียน: <b>ซ่อนตัวตน (Anonymous Whistleblower)</b></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>
                          ผู้ร้องเรียน: <b>{selectedTicket.complainant?.full_name || 'ผู้ใช้งาน'}</b>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 shrink-0">
                    แจ้งเมื่อ:{' '}
                    <b>
                      {new Date(selectedTicket.created_at).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </b>
                  </div>
                </div>
              </div>

              {/* Status Selector Box */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                <div className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                  ปรับสถานะการดำเนินงาน:
                </div>
                <StaffStatusSelector
                  ticketId={selectedTicket.id}
                  currentStatus={selectedTicket.status}
                  onStatusChanged={handleStatusChange}
                />
              </div>

              {/* ⭐ ความพึงพอใจจากผู้ร้องเรียน (ถ้ามี) */}
              {selectedTicket.rating && (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span>คะแนนประเมินการบริการ:</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= selectedTicket.rating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-black text-amber-800 ml-1">
                        {selectedTicket.rating} / 5
                      </span>
                    </div>
                  </div>
                  {selectedTicket.rating_feedback && (
                    <div className="p-2.5 bg-white/90 rounded-xl border border-amber-100 text-xs text-slate-700 italic">
                      "{selectedTicket.rating_feedback}"
                    </div>
                  )}
                </div>
              )}

              {/* 🗑️ กล่องลบคำร้องที่เสร็จแล้ว (เฉพาะ RESOLVED หรือ CLOSED เท่านั้น!) */}
              {(selectedTicket.status === 'RESOLVED' || selectedTicket.status === 'CLOSED') && (
                <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>ลบคำร้องที่เสร็จสิ้นแล้ว</span>
                    </h4>
                    <p className="text-[11px] text-red-700/80 mt-0.5">
                      คำร้องนี้ได้รับการแก้ไขเสร็จสิ้นแล้ว เจ้าหน้าที่สามารถลบเพื่อจัดเก็บข้อมูล
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTicketToDelete(selectedTicket)
                      setDeleteReason('')
                    }}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบคำร้องนี้</span>
                  </button>
                </div>
              )}

              {/* Issue Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  รายละเอียดที่ได้รับแจ้ง
                </h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Discussion & Chat Section (Public + Internal Note) */}
              <div className="pt-2 border-t border-slate-100">
                <TicketDiscussion ticketId={selectedTicket.id} currentRole="staff" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 7. Modal ยืนยันการลบคำร้อง พร้อมระบุเหตุผล (Audit Log Input)                      */}
      {/* ============================================================================== */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">ยืนยันการลบคำร้องเรียน</h3>
                <p className="text-xs text-slate-500 font-mono">รหัส: {ticketToDelete.ticket_code}</p>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 leading-relaxed">
              ⚠️ การลบนี้จะเป็นการลบอย่างถาวร (รวมทั้งข้อความสนทนาและไฟล์แนบ)
              ระบบจะบันทึกประวัติการลบและชื่อของคุณเพื่อความโปร่งใส
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ระบุเหตุผลในการลบ (สำหรับบันทึกใน Audit Log)
              </label>
              <textarea
                rows={2}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="เช่น คำร้องเสร็จสิ้นสมบูรณ์แล้ว, จัดเก็บข้อมูลประจำเดือน..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยืนยันลบคำร้อง</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 8. Modal ประวัติการลบคำร้อง (Deletion Audit Logs)                                */}
      {/* ============================================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">ประวัติการลบคำร้องเรียน (Audit Logs)</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              เก็บบันทึกประวัติอย่างโปร่งใส ตรวจสอบได้ว่าใครเป็นผู้ลบคำร้อง เมื่อใด และด้วยเหตุผลใด
            </p>

            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl">
              {loadingLogs ? (
                <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span>กำลังโหลดประวัติการลบ...</span>
                </div>
              ) : deletionLogs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  ยังไม่มีประวัติการลบคำร้องเรียนในระบบ
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">รหัสตั๋ว</th>
                      <th className="py-2.5 px-3">หัวข้อเรื่อง</th>
                      <th className="py-2.5 px-3">ผู้ลบ</th>
                      <th className="py-2.5 px-3">เหตุผล</th>
                      <th className="py-2.5 px-3">วันที่ลบ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {deletionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600">
                          {log.ticket_code}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 max-w-[180px] truncate">
                          {log.title}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-medium">
                          {log.deleted_by_name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 max-w-[180px] truncate">
                          {log.reason || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-medium whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('th-TH')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
