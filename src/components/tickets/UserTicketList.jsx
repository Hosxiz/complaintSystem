'use client'

// ==============================================================================
// 📋 รายการเรื่องร้องเรียนของผู้ใช้ (User Tickets with Detail & Chat Drawer)
// คลิกที่การ์ดเพื่อเปิดดูรายละเอียดความคืบหน้า และแชทคุยกับเจ้าหน้าที่ได้ทันที
// ==============================================================================
import { useState } from 'react'
import { STATUS_CONFIG } from '@/lib/tickets/status-config'
import TicketDiscussion from '@/components/tickets/TicketDiscussion'
import ReopenTicketModal from '@/components/tickets/ReopenTicketModal'
import { createClient } from '@/lib/supabase/client'
import {
  Inbox,
  EyeOff,
  ChevronRight,
  X,
  Calendar,
  MessageSquare,
  RotateCcw,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react'

export default function UserTicketList({ initialTickets = [] }) {
  const supabase = createClient()
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showReopenModal, setShowReopenModal] = useState(false)

  // จัดการเมื่อเปิดเรื่องใหม่สำเร็จจาก Modal
  const handleReopenSuccess = (updatedTicket) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t))
    )
    setSelectedTicket(updatedTicket)
  }

  if (tickets.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400">
        <Inbox className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
        <p className="text-sm font-medium">ยังไม่มีเรื่องร้องเรียน</p>
        <p className="text-xs text-slate-400 mt-1">ส่งเรื่องแรกของคุณผ่านฟอร์มทางขวาได้เลย</p>
      </div>
    )
  }

  const selectedStatusInfo = selectedTicket
    ? STATUS_CONFIG[selectedTicket.status] || STATUS_CONFIG.SUBMITTED
    : null

  return (
    <div>
      {/* รายการการ์ดเรื่องร้องเรียน */}
      <div className="divide-y divide-slate-100 mt-1">
        {tickets.map((t) => {
          const statusInfo = STATUS_CONFIG[t.status] || STATUS_CONFIG.SUBMITTED
          const isSelected = selectedTicket?.id === t.id

          return (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`p-4 rounded-2xl cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group my-1.5 border ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                  : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/70'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {t.ticket_code}
                  </span>
                  {t.is_anonymous && (
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                      <EyeOff className="w-3 h-3 text-slate-400" />
                      <span>ซ่อนตัวตน</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-medium">{t.category?.name || 'หมวดหมู่ทั่วไป'}</span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition">
                  {t.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    <span>{new Date(t.created_at).toLocaleDateString('th-TH')}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className={`text-xs px-3 py-1 rounded-full font-bold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className="hidden sm:inline-flex items-center text-xs text-blue-600 font-semibold group-hover:translate-x-0.5 transition gap-0.5">
                  <span>เปิดดูแชท</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Slide-over Detail & Chat Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedTicket(null)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-xl w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-600 bg-blue-100/60 px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {selectedTicket.ticket_code}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${selectedStatusInfo?.color}`}>
                  {selectedStatusInfo?.label}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title & Metadata */}
              <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
                  {selectedTicket.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>
                    หมวดหมู่: <b>{selectedTicket.category?.name || 'ทั่วไป'}</b>
                  </span>
                  <span>•</span>
                  <span>
                    วันที่ส่ง: <b>{new Date(selectedTicket.created_at).toLocaleDateString('th-TH')}</b>
                  </span>
                  {selectedTicket.is_anonymous && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">โหมดซ่อนตัวตน 🥷</span>
                    </>
                  )}
                </div>
              </div>

              {/* Status Explanation Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">สถานะปัจจุบัน: {selectedStatusInfo?.label}</span>
                <p>{selectedStatusInfo?.description}</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  รายละเอียดที่ส่งแจ้ง
                </h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Re-open Button if RESOLVED */}
              {selectedTicket.status === 'RESOLVED' && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-amber-800">
                    <span className="font-bold block">ยังพบปัญหาอยู่หรือไม่?</span>
                    หากยังไม่เรียบร้อย สามารถกดขอเปิดเรื่องใหม่เพื่อให้เจ้าหน้าที่ตรวจสอบต่อได้
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReopenModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ขอเปิดเรื่องใหม่ (พร้อมแนบหลักฐาน)</span>
                  </button>
                </div>
              )}

              {/* Discussion & Chat Box (Public Channel) */}
              <div className="pt-2 border-t border-slate-100">
                <TicketDiscussion ticketId={selectedTicket.id} currentRole="user" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🛡️ Modal ยืนยันการขอเปิดเรื่องใหม่พร้อมแนบหลักฐาน */}
      <ReopenTicketModal
        isOpen={showReopenModal}
        ticket={selectedTicket}
        onClose={() => setShowReopenModal(false)}
        onSuccess={handleReopenSuccess}
      />
    </div>
  )
}

