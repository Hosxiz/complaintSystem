'use client'

// ==============================================================================
// 🛠️ กล่องเปลี่ยนสถานะงานสำหรับคุณครู (Staff Status Updater)
// คุณครูสามารถปรับสถานะ: กำลังดำเนินการ (IN_PROGRESS), รอข้อมูล (WAITING), เสร็จสิ้น (RESOLVED)
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Loader2 } from 'lucide-react'

export default function StaffStatusSelector({ ticketId, currentStatus, onStatusChanged }) {
  const supabase = createClient()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (newStatus) => {
    if (newStatus === status) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId)

      if (error) throw error

      setStatus(newStatus)
      if (onStatusChanged) onStatusChanged(newStatus)
    } catch (err) {
      alert('ไม่สามารถอัปเดตสถานะได้: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const options = [
    { value: 'IN_PROGRESS', label: 'กำลังดำเนินการ', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'WAITING', label: 'รอข้อมูลเพิ่มจากผู้ใช้', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'RESOLVED', label: 'แก้ไขเสร็จสิ้นแล้ว', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">ปรับสถานะงาน:</span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleUpdate(opt.value)}
          disabled={loading}
          className={`px-3 py-1 text-xs font-semibold rounded-lg border transition flex items-center gap-1 ${
            status === opt.value
              ? `${opt.color} ring-2 ring-blue-500`
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          {loading && status === opt.value ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : status === opt.value ? (
            <Check className="w-3 h-3 text-current" />
          ) : null}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

