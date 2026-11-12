'use client'

// ==============================================================================
// 👤 โมดอลแก้ไขโปรไฟล์ & เปลี่ยนชื่อ (Edit Profile Modal)
// ผู้ใช้งานสามารถเปลี่ยนชื่อ-นามสกุลจริงของตัวเองได้ทันที และอัปเดตลงตาราง profiles
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'

export default function EditProfileModal({ isOpen, onClose, currentName, onNameUpdated }) {
  const supabase = createClient()
  const [fullName, setFullName] = useState(currentName || '')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleUpdateName = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!fullName.trim()) {
      setErrorMsg('กรุณากรอกชื่อ-นามสกุล')
      return
    }

    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('ไม่พบข้อมูลการเข้าสู่ระบบ')

      // 1. อัปเดตลงตาราง profiles ใน Database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 2. อัปเดต user_metadata ใน auth
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      })

      setSuccessMsg('แก้ไขชื่อเรียบร้อยแล้ว!')
      if (onNameUpdated) onNameUpdated(fullName.trim())

      setTimeout(() => {
        setSuccessMsg('')
        onClose()
      }, 1200)
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถแก้ไขชื่อได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">แก้ไขข้อมูลโปรไฟล์</h3>
            <p className="text-xs text-slate-400">เปลี่ยนชื่อ-นามสกุลที่ใช้แสดงในระบบ</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อ - นามสกุล ใหม่ *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="เช่น นายพีรณัฐ ใจดี"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl text-xs transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

