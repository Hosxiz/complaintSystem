'use client'

// ==============================================================================
// 🗂️ กล่องคัดกรองและปรับเปลี่ยนหมวดหมู่เคสสำหรับ Admin (Admin Category Manager)
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STATUS_CONFIG } from '@/lib/tickets/status-config'
import { Filter, EyeOff, User, CheckCircle2, Loader2 } from 'lucide-react'

export default function AdminTicketQueue({ initialTickets = [], categories = [] }) {
  const supabase = createClient()
  const [tickets, setTickets] = useState(initialTickets)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [loadingTicketId, setLoadingTicketId] = useState(null)

  // ฟังก์ชันเปลี่ยนหมวดหมู่เคส
  const handleCategoryChange = async (ticketId, newCatId) => {
    setLoadingTicketId(ticketId)
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ category_id: newCatId || null })
        .eq('id', ticketId)

      if (error) throw error

      const catName = categories.find((c) => c.id === newCatId)?.name || 'ทั่วไป'
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, category_id: newCatId, category: { name: catName } } : t
        )
      )
    } catch (err) {
      alert('ไม่สามารถเปลี่ยนหมวดหมู่ได้: ' + err.message)
    } finally {
      setLoadingTicketId(null)
    }
  }

  // ตัวกรองเคสตามหมวดหมู่และสถานะ
  const filteredTickets = tickets.filter((t) => {
    const matchCat = filterCategory ? t.category_id === filterCategory : true
    const matchStatus = filterStatus ? t.status === filterStatus : true
    return matchCat && matchStatus
  })

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-slate-800 text-base">รายการเรื่องร้องเรียนทั้งหมดในระบบ</h2>
          <p className="text-xs text-slate-400 mt-0.5">คัดกรอง และจัดหมวดหมู่ให้ถูกต้อง</p>
        </div>

        {/* ตัวกรอง (Filters) */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
          >
            <option value="">ทุกสถานะ</option>
            {Object.keys(STATUS_CONFIG).map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
        {filteredTickets.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">ไม่พบรายการเรื่องร้องเรียนตามที่เลือก</p>
        ) : (
          filteredTickets.map((t) => {
            const statusInfo = STATUS_CONFIG[t.status] || STATUS_CONFIG.SUBMITTED
            const isLoading = loadingTicketId === t.id

            return (
              <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600">{t.ticket_code}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {t.is_anonymous ? (
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                        <EyeOff className="w-3 h-3" /> Anonymous
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <User className="w-3 h-3" /> {t.complainant?.full_name || t.complainant?.email}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">{t.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                </div>

                {/* เมนูเปลี่ยนหมวดหมู่สำหรับ Admin */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span className="text-xs text-slate-400">หมวดหมู่:</span>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    <select
                      value={t.category_id || ''}
                      onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                      className="text-xs font-medium px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- ไม่ระบุหมวดหมู่ --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

