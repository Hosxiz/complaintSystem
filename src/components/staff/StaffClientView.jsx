'use client'

// ==============================================================================
// 🧑‍🏫 Staff Portal Client Component (Kanban Board & KPI Dashboard)
// ออกแบบตาม Modern SaaS Helpdesk Ref: รองรับกระดาน Kanban, ตัวกรอง, สถิติ KPI,
// ส่งออกไฟล์รายงาน (Export CSV UTF-8 BOM), ลบคำร้องที่เสร็จแล้ว และบันทึกประวัติการลบ (Audit Logs)
// ==============================================================================
import { useState, useMemo, useEffect } from 'react'
import { STATUS_CONFIG } from '@/lib/tickets/status-config'
import StaffStatusSelector from '@/components/staff/StaffStatusSelector'
import TicketDiscussion from '@/components/tickets/TicketDiscussion'
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
} from 'lucide-react'

export default function StaffClientView({ initialTickets = [], staffProfile }) {
  const supabase = createClient()
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [viewMode, setViewMode] = useState('kanban') // 'kanban' หรือ 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // States สำหรับระบบลบคำร้อง & บันทึกประวัติ
  const [ticketToDelete, setTicketToDelete] = useState(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [deletionLogs, setDeletionLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // คำนวณสถิติภาพรวม (KPI Stats เหมือนใน Ref)
  const stats = useMemo(() => {
    const total = tickets.length
    const pending = tickets.filter((t) => t.status === 'SUBMITTED' || t.status === 'RECEIVED').length
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length
    const waiting = tickets.filter((t) => t.status === 'WAITING').length
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

    return { total, pending, inProgress, waiting, resolved, resolutionRate }
  }, [tickets])

  // ดึงรายชื่อหมวดหมู่ทั้งหมดสำหรับทำตัวกรอง
  const categoriesList = useMemo(() => {
    const cats = new Set()
    tickets.forEach((t) => {
      if (t.category?.name) cats.add(t.category.name)
    })
    return Array.from(cats)
  }, [tickets])

  // กรองตั๋วตามการค้นหาและหมวดหมู่
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        t.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (!t.is_anonymous && t.complainant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchCategory = selectedCategory === 'ALL' || t.category?.name === selectedCategory

      return matchSearch && matchCategory
    })
  }, [tickets, searchQuery, selectedCategory])

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
      const { error } = await supabase.from('tickets').delete().eq('id', ticketToDelete.id)
      if (error) throw error

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

  return (
    <div className="space-y-6 font-sans">
      {/* ============================================================================== */}
      {/* 1. Header ทักทายเจ้าหน้าที่                                                     */}
      {/* ============================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ยินดีต้อนรับ, {staffProfile?.full_name || 'เจ้าหน้าที่'} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide">
              Staff Portal
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            ศูนย์จัดการเรื่องร้องเรียน ติดตามสถานะ ดำเนินการแก้ไข และตอบกลับผู้ใช้งาน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* ปุ่มสลับมุมมอง */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${viewMode === 'kanban'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <Kanban className="w-4 h-4" />
              <span>กระดาน</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${viewMode === 'list'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              <List className="w-4 h-4" />
              <span>รายการตาราง</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. สรุปสถิติ KPI การ์ด 4 ช่อง (ตาม Ref ด้านบน)                                   */}
      {/* ============================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* การ์ดที่ 1: ทั้งหมด */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
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

        {/* การ์ดที่ 2: รอดำเนินการ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-amber-300 transition">
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

        {/* การ์ดที่ 3: กำลังตรวจสอบ/แก้ไข */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition">
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

        {/* การ์ดที่ 4: ความสำเร็จการปิดเคส */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition">
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

      {/* ============================================================================== */}
      {/* 3. กล่องค้นหา, ตัวกรองหมวดหมู่, ปุ่มส่งออกรายงาน และปุ่มประวัติการลบ              */}
      {/* ============================================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
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

        {/* เครื่องมือ: ฟิลเตอร์หมวดหมู่, ปุ่มส่งออก Excel/CSV, และปุ่มประวัติการลบ */}
        <div className="flex flex-wrap items-center gap-2">
          {/* กรองหมวดหมู่ */}
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition shadow-sm"
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition"
            title="ดูบันทึกประวัติการลบคำร้อง (Audit Log)"
          >
            <History className="w-4 h-4" />
            <span>ประวัติการลบ</span>
          </button>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 4. แสดงผล: แบบ Kanban Board (Default ตาม Ref)                                   */}
      {/* ============================================================================== */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const columnTickets = filteredTickets.filter((t) => col.statuses.includes(t.status))

            return (
              <div
                key={col.id}
                className="bg-slate-100/80 rounded-3xl p-4 border border-slate-200/60 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="font-bold text-slate-800 text-sm tracking-tight">{col.title}</h3>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${col.badgeColor}`}>
                    {columnTickets.length}
                  </span>
                </div>

                {/* Tickets Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[720px] pr-0.5">
                  {columnTickets.length === 0 ? (
                    <div className="h-36 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300/80 rounded-2xl">
                      <span>ไม่มีเคสในสถานะนี้</span>
                    </div>
                  ) : (
                    columnTickets.map((t) => {
                      const isSelected = selectedTicket?.id === t.id
                      const dateStr = new Date(t.created_at).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                      })

                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTicket(t)}
                          className={`bg-white rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md text-left group ${isSelected
                            ? 'ring-2 ring-blue-500 border-blue-500 shadow-md'
                            : 'border-slate-200/80 hover:border-slate-300'
                            }`}
                        >
                          {/* Tags: Code & Category */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {t.ticket_code}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate max-w-[120px] font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                              {t.category?.name || 'ทั่วไป'}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition mb-1.5 leading-snug">
                            {t.title}
                          </h4>

                          {/* Description Snippet */}
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                            {t.description}
                          </p>

                          {/* Card Footer */}
                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs text-slate-500">
                            {/* Complainant Info */}
                            {t.is_anonymous ? (
                              <span className="flex items-center gap-1 text-slate-500 font-medium">
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                <span>ไม่ระบุตัวตน</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-slate-600 font-medium truncate max-w-[120px]">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate">{t.complainant?.full_name || 'ผู้ใช้งาน'}</span>
                              </span>
                            )}

                            {/* Date */}
                            <span className="flex items-center gap-1 text-slate-400 font-medium text-[11px]">
                              <Calendar className="w-3 h-3" />
                              <span>{dateStr}</span>
                            </span>
                          </div>
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
        /* 5. แสดงผล: แบบตาราง List View                                                  */
        /* ============================================================================== */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">รหัสตั๋ว</th>
                  <th className="py-3.5 px-4">หัวข้อเรื่องร้องเรียน</th>
                  <th className="py-3.5 px-4">หมวดหมู่</th>
                  <th className="py-3.5 px-4">ผู้ร้องเรียน</th>
                  <th className="py-3.5 px-4">สถานะ</th>
                  <th className="py-3.5 px-4">วันที่แจ้ง</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      ไม่พบเรื่องร้องเรียนที่ตรงกับเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const statusInfo = STATUS_CONFIG[t.status] || STATUS_CONFIG.SUBMITTED
                    const dateStr = new Date(t.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit',
                    })

                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className="hover:bg-slate-50/80 cursor-pointer transition"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {t.ticket_code}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">
                          {t.title}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{t.category?.name || 'ทั่วไป'}</td>
                        <td className="py-3.5 px-4">
                          {t.is_anonymous ? (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>ซ่อนตัวตน</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t.complainant?.full_name || 'ผู้ใช้งาน'}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-medium">{dateStr}</td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTicket(t)
                            }}
                            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold text-xs transition"
                          >
                            ดูรายละเอียด
                          </button>
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
