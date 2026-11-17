'use client'

// ==============================================================================
// 📝 ฟอร์มเขียนจดหมายร้องเรียน (User Ticket Form)
// รองรับ: กรอกเรื่อง, หมวดหมู่, รายละเอียด, แนบไฟล์หลักฐาน (Upload Storage), โหมด Anonymous
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateTicketCode, generateTrackingCode } from '@/lib/tickets/code-generator'
import { FACULTY_MAJORS } from '@/lib/constants/majors'
import { Send, EyeOff, CheckCircle2, Copy, AlertCircle, Paperclip, X, GraduationCap } from 'lucide-react'

export default function NewTicketForm({ categories = [] }) {
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [major, setMajor] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isCertified, setIsCertified] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successData, setSuccessData] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // จำกัดขนาดไฟล์ไม่เกิน 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('ขนาดไฟล์ต้องไม่เกิน 10 MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      // 1. ตรวจสอบ User
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนส่งเรื่องร้องเรียน')
      }

      // 2. ตรวจสอบความถูกต้องของข้อมูล
      if (!major.trim()) {
        throw new Error('กรุณาเลือกสาขาวิชาที่เกี่ยวข้อง')
      }

      if (!isCertified) {
        throw new Error('กรุณากดยอมรับว่าข้อมูลและเรื่องที่ร้องเรียนเป็นความจริงทุกประการก่อนส่ง')
      }

      // 3. เสก Ticket Code และ Tracking Code
      const ticketCode = generateTicketCode()
      const trackingCode = generateTrackingCode()

      // 4. จัดรูปแบบเนื้อหาคำร้อง รวมสาขาวิชา และช่องทางติดต่อ
      const majorText = `🎓 สาขาวิชา: ${major}`
      const contactText = contactInfo.trim() ? `\n📞 ช่องทางติดต่อเพิ่มเติม: ${contactInfo.trim()}` : ''
      const fullDescription = `${majorText}\n\n${description.trim()}${contactText}`

      // 5. บันทึกตั๋วลง Database (พร้อมรองรับ fallback หากยังไม่มีคอลัมน์ major)
      const ticketPayload = {
        ticket_code: ticketCode,
        tracking_code: trackingCode,
        user_id: user.id,
        category_id: categoryId || null,
        title: title.trim(),
        description: fullDescription,
        is_anonymous: isAnonymous,
        status: 'SUBMITTED',
      }

      let ticket = null
      let ticketError = null

      const resWithMajor = await supabase
        .from('tickets')
        .insert({ ...ticketPayload, major: major.trim() })
        .select()
        .single()

      if (resWithMajor.error && resWithMajor.error.message?.includes('major')) {
        // Fallback กรณีตาราง tickets ใน Supabase ยังไม่ได้รันคำสั่งเพิ่มคอลัมน์ major
        const resFallback = await supabase
          .from('tickets')
          .insert(ticketPayload)
          .select()
          .single()
        ticket = resFallback.data
        ticketError = resFallback.error
      } else {
        ticket = resWithMajor.data
        ticketError = resWithMajor.error
      }

      if (ticketError) throw ticketError

      // 4. ถ้ามีไฟล์แนบ ให้อัปโหลดเข้า Supabase Storage Bucket 'evidence-attachments'
      if (selectedFile && ticket) {
        const fileExt = selectedFile.name.split('.').pop()
        const filePath = `${ticket.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('evidence-attachments')
          .upload(filePath, selectedFile)

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('evidence-attachments')
            .getPublicUrl(filePath)

          // บันทึกลงตาราง ticket_attachments
          await supabase.from('ticket_attachments').insert({
            ticket_id: ticket.id,
            file_name: selectedFile.name,
            file_url: publicUrlData.publicUrl,
            file_size_bytes: selectedFile.size,
            mime_type: selectedFile.type,
          })
        }
      }

      // 5. ส่งสำเร็จ
      setSuccessData({
        ticketCode,
        trackingCode,
      })
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการส่งเรื่อง')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (successData) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-sm border border-emerald-100 text-center animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ส่งเรื่องร้องเรียนสำเร็จ!</h2>
        <p className="text-gray-500 text-sm mb-6">
          ระบบได้รับเรื่องของคุณแล้ว กรุณาบันทึกรหัสลับเหล่านี้ไว้เพื่อติดตามสถานะ
        </p>

        <div className="bg-gray-50 p-4 rounded-2xl text-left space-y-3 mb-6 border border-gray-100">
          <div>
            <span className="text-xs text-gray-400 block font-medium">รหัสเคส (Ticket ID)</span>
            <span className="text-lg font-bold text-gray-700">{successData.ticketCode}</span>
          </div>

          <div className="pt-2 border-t border-gray-200">
            <span className="text-xs text-emerald-600 block font-semibold">
              🔑 รหัสลับติดตามเคส (Tracking Code)
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-mono font-bold text-emerald-700 tracking-wider">
                {successData.trackingCode}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(successData.trackingCode)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setSuccessData(null)
            setTitle('')
            setMajor('')
            setCategoryId('')
            setDescription('')
            setContactInfo('')
            setSelectedFile(null)
            setIsAnonymous(false)
            setIsCertified(false)
            window.location.reload()
          }}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition"
        >
          กลับสู่หน้าหลัก
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-800">ส่งเรื่องร้องเรียนใหม่</h2>
        <p className="text-xs text-slate-400 mt-0.5">แจ้งปัญหาเพื่อให้เจ้าหน้าที่ช่วยตรวจสอบและแก้ไข</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            หัวข้อเรื่องร้องเรียน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น แอร์ห้อง 401 เปิดไม่ติด, ก๊อกน้ำรั่ว"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 🎓 สาขาวิชาที่เกี่ยวข้อง (บังคับเลือก *) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>สาขาวิชา</span>
              <span className="text-red-500 font-bold">*</span>
            </span>
            <span className="text-[10px] text-slate-400 font-normal">คณะวิทย์ฯ สวนดุสิต</span>
          </label>
          <select
            required
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          >
            <option value="">-- กรุณาเลือกสาขาวิชา (บังคับ) --</option>
            {FACULTY_MAJORS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- เลือกหมวดหมู่ที่เกี่ยวข้อง --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            รายละเอียดปัญหา <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายตำแหน่ง สิ่งที่เกิดขึ้น หรือรายละเอียดเพิ่มเติม..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 📞 ช่องทางติดต่อกลับเพิ่มเติม (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ช่องทางการติดต่อเพิ่มเติม (หากสะดวก)
          </label>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="เช่น เบอร์โทรศัพท์ 08X-XXX-XXXX หรือ LINE ID"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            เพื่อให้เจ้าหน้าที่ติดต่อประสานงานได้อย่างรวดเร็วและราบรื่น
          </p>
        </div>

        {/* 📎 แนบไฟล์รูปภาพหลักฐาน (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            แนบไฟล์รูปถ่ายหลักฐาน (ถ้ามี)
          </label>
          {selectedFile ? (
            <div className="flex items-center justify-between p-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-blue-700">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
                <span className="text-[10px] text-blue-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-blue-100 rounded-lg text-blue-500 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 rounded-xl cursor-pointer text-xs text-slate-500 transition">
              <Paperclip className="w-4 h-4 text-slate-400" />
              <span>คลิกเพื่อแนบรูปภาพ (สูงสุด 10MB)</span>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* 🥷 สวิตช์ซ่อนตัวตน */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800">
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>โหมดซ่อนตัวตน (Anonymous Mode)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                เจ้าหน้าที่ (Staff) จะมองไม่เห็นชื่อหรืออีเมลของคุณ
              </p>
            </div>
          </label>
        </div>

        {/* ⚖️ ข้อตกลงยืนยันความถูกต้องของข้อมูล (Mandatory Certification) */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isCertified
              ? 'bg-blue-50/70 border-blue-200 text-blue-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}
        >
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={isCertified}
              onChange={(e) => setIsCertified(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="font-bold text-xs block leading-tight">
                ข้าพเจ้าขอยืนยันว่าเรื่องที่ร้องเรียนนี้ เป็นความจริงทุกประการ{' '}
                <span className="text-red-500">*</span>
              </span>
              <p className="text-[11px] opacity-80 leading-normal">
                หากพบว่าเป็นการจงใจแจ้งข้อมูลเท็จ บิดเบือน หรือมีเจตนากลั่นแกล้งผู้อื่น
                อาจมีความผิดตามระเบียบและกฎหมายที่เกี่ยวข้อง
              </p>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isCertified}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งเรื่องร้องเรียน'}
        </button>
      </form>
    </div>
  )
}
