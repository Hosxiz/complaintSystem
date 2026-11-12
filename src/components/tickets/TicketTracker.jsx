'use client'

// ==============================================================================
// 🔍 หน้าจอติดตามสถานะตั๋ว (Track by Ticket Code หรือ Tracking Code)
// มีปุ่มขอเปิดเรื่องใหม่ (Re-open) เมื่อเคสจบแบบ RESOLVED แต่เด็กยังไม่พอใจ
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STATUS_CONFIG } from '@/lib/tickets/status-config'
import { Search, RotateCcw, AlertCircle, CheckCircle, Clock, MessageSquare } from 'lucide-react'

export default function TicketTracker() {
  const supabase = createClient()
  const [searchKey, setSearchKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [reopenLoading, setReopenLoading] = useState(false)

  // ฟังก์ชันค้นหาตั๋วด้วย Ticket Code หรือ Tracking Code
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchKey.trim()) return

    setLoading(true)
    setErrorMsg('')
    setTicket(null)

    try {
      const cleanKey = searchKey.trim()

      // ค้นหาว่าตรงกับ ticket_code หรือ tracking_code หรือไม่
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_code,
          tracking_code,
          title,
          description,
          status,
          created_at,
          category:categories(name)
        `)
        .or(`ticket_code.eq.${cleanKey},tracking_code.eq.${cleanKey}`)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        throw new Error('ไม่พบข้อมูลเรื่องร้องเรียน กรุณาตรวจสอบรหัสอีกครั้ง')
      }

      setTicket(data)
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการค้นหา')
    } finally {
      setLoading(false)
    }
  }

  // 🔄 ปุ่มวิเศษ: "ขอเปิดเรื่องใหม่ (Re-open)"
  const handleReopen = async () => {
    if (!ticket) return
    setReopenLoading(true)

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: 'IN_PROGRESS' })
        .eq('id', ticket.id)

      if (error) throw error

      // อัปเดตสถานะบนหน้าจอทันที
      setTicket((prev) => ({ ...prev, status: 'IN_PROGRESS' }))
    } catch (err) {
      alert('ไม่สามารถเปิดเรื่องใหม่ได้: ' + err.message)
    } finally {
      setReopenLoading(false)
    }
  }

  const currentStatusInfo = ticket ? STATUS_CONFIG[ticket.status] || STATUS_CONFIG.SUBMITTED : null

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">ติดตามเรื่องร้องเรียน</h1>
        <p className="text-gray-500 text-sm mt-1">
          กรอกรหัสตั๋ว (Ticket ID) หรือรหัสลับ (Tracking Code) เพื่อดูความคืบหน้า
        </p>
      </div>

      {/* กล่องค้นหา */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="เช่น TK-2026-X8Y2 หรือ TRK-8F2A-99B1"
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl text-sm transition"
          >
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ผลลัพธ์ข้อมูลตั๋ว */}
      {ticket && currentStatusInfo && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          {/* ส่วนหัวตั๋ว */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <span className="text-xs font-mono font-bold text-gray-400 block">
                {ticket.ticket_code}
              </span>
              <h2 className="text-xl font-bold text-gray-800 mt-0.5">{ticket.title}</h2>
              <span className="inline-block mt-1 text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                หมวดหมู่: {ticket.category?.name || 'ทั่วไป'}
              </span>
            </div>

            {/* ป้ายสถานะ */}
            <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold ${currentStatusInfo.color}`}>
              {currentStatusInfo.label}
            </div>
          </div>

          {/* คำอธิบายสถานะ */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600">
            <span className="font-semibold block text-slate-800 mb-0.5">สถานะปัจจุบัน:</span>
            {currentStatusInfo.description}
          </div>

          {/* รายละเอียดปัญหาที่เคยส่ง */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">รายละเอียดปัญหา:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100 whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* 🔄 ปุ่มขอเปิดเรื่องใหม่ (เฉพาะเมื่อสถานะเป็น RESOLVED) */}
          {ticket.status === 'RESOLVED' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-amber-800">
                <span className="font-bold block">ยังพบปัญหาอยู่หรือไม่?</span>
                หากปัญหายังไม่ได้รับการแก้ไขอย่างถูกต้อง คุณสามารถกดขอเปิดเรื่องใหม่ได้
              </div>
              <button
                type="button"
                onClick={handleReopen}
                disabled={reopenLoading}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {reopenLoading ? 'กำลังส่งคำขอ...' : 'ขอเปิดเรื่องใหม่ (Re-open)'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

