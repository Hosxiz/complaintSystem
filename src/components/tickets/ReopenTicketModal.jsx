'use client'

// ==============================================================================
// 🛡️ Modal ยืนยันการขอเปิดเรื่องใหม่พร้อมหลักฐาน (Re-open with Proof Modal)
// บังคับให้ผู้ใช้ระบุเหตุผล + แนบรูปถ่ายหลักฐานยืนยัน เพื่อป้องกันการกดแกล้งเจ้าหน้าที่
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  RotateCcw,
  X,
  Camera,
  Paperclip,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

export default function ReopenTicketModal({ isOpen, ticket, onClose, onSuccess }) {
  const supabase = createClient()
  const [reason, setReason] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen || !ticket) return null

  const handleFileChange = (e) => {
    setErrorMsg('')
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // ตรวจสอบขนาดไฟล์ไม่เกิน 10MB
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('ขนาดไฟล์รูปภาพต้องไม่เกิน 10 MB')
        return
      }

      // ตรวจสอบว่าเป็นรูปภาพเท่านั้น
      if (!file.type.startsWith('image/')) {
        setErrorMsg('กรุณาแนบไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)')
        return
      }

      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // ตรวจสอบความถูกต้อง (Security Validation Gate)
    if (!reason.trim()) {
      setErrorMsg('กรุณาระบุรายละเอียดหรือจุดที่ยังพบปัญหา')
      return
    }

    if (!selectedFile) {
      setErrorMsg('กรุณาแนบรูปภาพถ่ายหลักฐานยืนยันว่าปัญหายังไม่ได้รับการแก้ไข')
      return
    }

    setLoading(true)

    try {
      // 1. ตรวจสอบสิทธิ์ผู้ใช้
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // 2. อัปโหลดรูปภาพหลักฐานเข้า Storage Bucket 'evidence-attachments'
      const fileExt = selectedFile.name.split('.').pop()
      const filePath = `${ticket.id}/reopen_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('evidence-attachments')
        .upload(filePath, selectedFile)

      let publicUrl = ''
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('evidence-attachments')
          .getPublicUrl(filePath)
        publicUrl = publicUrlData?.publicUrl || ''

        // บันทึกลงตาราง ticket_attachments
        await supabase.from('ticket_attachments').insert({
          ticket_id: ticket.id,
          file_name: selectedFile.name,
          file_url: publicUrl,
          file_size_bytes: selectedFile.size,
          mime_type: selectedFile.type,
        })
      }

      // 3. ส่งข้อความแจ้งเตือนลงในกล่องแชทของตั๋วอัตโนมัติ
      const chatMessage = `🔄 [ผู้ร้องเรียนขอยื่นเปิดเรื่องใหม่]\nเหตุผล: ${reason.trim()}\n📎 แนบหลักฐานยืนยัน: ${selectedFile.name}`
      await supabase.from('ticket_messages').insert({
        ticket_id: ticket.id,
        sender_id: user?.id || ticket.user_id,
        message: chatMessage,
        is_internal: false,
      })

      // 4. อัปเดตสถานะตั๋วกลับเป็น 'IN_PROGRESS'
      const { error: updateError } = await supabase
        .from('tickets')
        .update({
          status: 'IN_PROGRESS',
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticket.id)

      if (updateError) throw updateError

      // 5. แจ้งเตือนสำเร็จ และอัปเดตสถานะบนหน้าจอ
      const updatedTicket = { ...ticket, status: 'IN_PROGRESS' }
      if (onSuccess) onSuccess(updatedTicket)
      handleClose()
      alert('ส่งคำขอเปิดเรื่องใหม่พร้อมหลักฐานเรียบร้อยแล้ว เจ้าหน้าที่จะเร่งดำเนินการตรวจสอบครับ')
    } catch (err) {
      setErrorMsg('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถส่งคำขอได้'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    handleRemoveFile()
    setErrorMsg('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-amber-600">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">ขอยื่นเปิดเรื่องใหม่อีกครั้ง</h3>
              <p className="text-xs text-slate-500 font-mono">รหัสตั๋ว: {ticket.ticket_code}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Alert */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">กรุณาแนบหลักฐานยืนยัน:</span>
            เพื่อป้องกันการร้องเรียนซ้ำซ้อนและช่วยให้เจ้าหน้าที่ตรวจสอบได้ตรงจุด กรุณาระบุรายละเอียดและถ่ายรูปจุดที่ยังพบปัญหาแนบมาด้วยครับ
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* เหตุผลที่ขอเปิดเรื่องใหม่ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. ระบุจุดที่ยังพบปัญหา หรือเหตุผลที่ขอเปิดเรื่องใหม่ <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น แอร์ห้อง 401 ช่างซ่อมแล้วแต่ยังมีน้ำหยดและไม่มีลมเย็นออกมา..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
          </div>

          {/* แนบรูปภาพหลักฐานยืนยัน */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. แนบรูปถ่ายหลักฐานยืนยัน <span className="text-red-500">* (บังคับแนบรูป)</span>
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
                <img
                  src={previewUrl}
                  alt="หลักฐานที่แนบ"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                />
                <div className="flex-1 truncate">
                  <span className="text-xs font-semibold text-slate-800 block truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 hover:bg-slate-200 rounded-xl text-slate-500 transition"
                  title="ลบรูปภาพนี้"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/30 rounded-2xl cursor-pointer text-xs text-slate-500 transition">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 shadow-sm">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="font-bold text-slate-700 block">คลิกเพื่ออัปโหลดรูปถ่ายหลักฐาน</span>
                  <span className="text-[11px] text-slate-400">รองรับไฟล์ JPG, PNG, WebP (สูงสุด 10MB)</span>
                </div>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังส่งข้อมูลและหลักฐาน...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>ยืนยันขอเปิดเรื่องใหม่</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
