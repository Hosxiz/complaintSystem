'use client'

// ==============================================================================
// 🔑 โมดอลเปลี่ยนรหัสผ่าน (Change Password Modal) สำหรับผู้ใช้งานทุกบทบาท
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'

export default function ChangePasswordModal({ isOpen, onClose }) {
  const supabase = createClient()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (newPassword.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('รหัสผ่านทั้งสองช่องไม่ตรงกัน')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setSuccessMsg('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว!')
      setTimeout(() => {
        setNewPassword('')
        setConfirmPassword('')
        setSuccessMsg('')
        onClose()
      }, 1500)
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
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
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">เปลี่ยนรหัสผ่านใหม่</h3>
            <p className="text-xs text-slate-400">อัปเดตรหัสผ่านสำหรับเข้าสู่ระบบ</p>
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

        <form onSubmit={handleUpdatePassword} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสผ่านใหม่</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="•••••••• (อย่างน้อย 6 ตัวอักษร)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
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
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

