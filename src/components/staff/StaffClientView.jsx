'use client'

// ==============================================================================
// 🧑‍🏫 Staff Portal Client Component
// แสดงรายการเคสที่ได้รับมอบหมาย, ดูรายละเอียด, สลับสถานะ และคุยผ่าน TicketDiscussion
// ==============================================================================
import { useState } from 'react'
import { STATUS_CONFIG } from '@/lib/tickets/status-config'
import StaffStatusSelector from '@/components/staff/StaffStatusSelector'
import TicketDiscussion from '@/components/tickets/TicketDiscussion'
import { Inbox, EyeOff, User, Clock, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function StaffClientView({ initialTickets = [], staffProfile }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState(initialTickets[0] || null)

  const handleStatusChange = (newStatus) => {
    if (!selectedTicket) return
    const updated = { ...selectedTicket, status: newStatus }
    setSelectedTicket(updated)
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* คอลัมน์ซ้าย (5 ส่วน): รายการเคสที่ตนเองได้รับมอบหมาย */}
      <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-slate-800 text-base">งานที่ได้รับมอบหมาย</h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold">
            {tickets.length} เคส
          </span>
        </div>

        {tickets.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="text-sm font-medium">ยังไม่มีเคสที่ได้รับมอบหมาย</p>
            <p className="text-xs text-slate-400 mt-1">เมื่อครูใหญ่มอบหมายงาน เคสจะแสดงที่นี่ทันที</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {tickets.map((t) => {
              const statusInfo = STATUS_CONFIG[t.status] || STATUS_CONFIG.SUBMITTED
              const isSelected = selectedTicket?.id === t.id
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-4 rounded-2xl border cursor-pointer transition text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {t.ticket_code}
                    </span>
                    <span
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{t.title}</h3>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>{t.category?.name || 'หมวดหมู่ทั่วไป'}</span>
                    {t.is_anonymous ? (
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>ไม่ระบุตัวตน</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-600">
                        <User className="w-3.5 h-3.5" />
                        <span>{t.complainant?.full_name || 'ผู้ใช้งาน'}</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* คอลัมน์ขวา (7 ส่วน): รายละเอียดเคสที่เลือก + เครื่องมือจัดการ */}
      <div className="lg:col-span-7 space-y-6">
        {selectedTicket ? (
          <>
            {/* กล่องรายละเอียดเคส */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-blue-600 block">
                    {selectedTicket.ticket_code}
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                    {selectedTicket.title}
                  </h1>
                </div>

                {/* กล่องแสดงตัวตนผู้ร้องเรียน (Enforce Anonymous Rule!) */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  {selectedTicket.is_anonymous ? (
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <EyeOff className="w-4 h-4 text-slate-500" />
                      <span>ผู้ร้องเรียน: <b>ซ่อนตัวตน (Anonymous)</b></span>
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
              </div>

              {/* ปรับสถานะงาน */}
              <div className="pt-1 pb-2">
                <StaffStatusSelector
                  ticketId={selectedTicket.id}
                  currentStatus={selectedTicket.status}
                  onStatusChanged={handleStatusChange}
                />
              </div>

              {/* รายละเอียดปัญหา */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  รายละเอียดที่ได้รับแจ้ง
                </h3>
                <p className="text-sm text-slate-700 bg-slate-50/70 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>
            </div>

            {/* กล่องแชทสนทนา (มีทั้ง Public และ Internal Note) */}
            <TicketDiscussion ticketId={selectedTicket.id} currentRole="staff" />
          </>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center text-slate-400">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-1" />
            <h3 className="font-bold text-slate-700 text-base">เลือกเคสจากรายการด้านซ้าย</h3>
            <p className="text-xs text-slate-400 mt-1">เพื่อดูรายละเอียด ปรับสถานะ หรือตอบกลับข้อความ</p>
          </div>
        )}
      </div>
    </div>
  )
}

