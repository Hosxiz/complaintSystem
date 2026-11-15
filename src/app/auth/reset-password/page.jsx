'use client'

// ==============================================================================
// 🔑 หน้าตั้งรหัสผ่านใหม่ (Reset Password Page)
// ผู้ใช้จะถูกพามาที่หน้านี้หลังจากคลิกลิงก์รีเซ็ตรหัสผ่านจากอีเมล
// ==============================================================================
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (password.length < 6) {
      setErrorMsg('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('รหัสผ่านทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')
      return
    }

    setLoading(true)

    try {
      // อัปเดตรหัสผ่านใหม่ให้กับผู้ใช้ปัจจุบันที่ผ่านการยืนยันจากลิงก์อีเมลแล้ว
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      setSuccessMsg('เปลี่ยนรหัสผ่านใหม่สำเร็จแล้ว! กำลังพาท่านเข้าสู่ระบบ...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ ลิงก์อาจหมดอายุแล้ว กรุณาขอลืมรหัสผ่านใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      {/* 🏠 ปุ่มกลับสู่หน้าหลัก (ด้านบน) */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition group py-2 px-3 rounded-xl hover:bg-white shadow-sm hover:shadow"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>กลับสู่หน้าหลัก</span>
        </Link>
        <Link
          href="/login"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          เข้าสู่ระบบ
        </Link>
      </div>

      {/* 🔐 กล่องฟอร์มตั้งรหัสผ่านใหม่ */}
      <div className="w-full max-w-md mx-auto my-auto">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              ตั้งรหัสผ่านใหม่
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              กรุณากำหนดรหัสผ่านใหม่สำหรับเข้าใช้งานระบบ
            </p>
          </div>

          {/* แจ้งเตือน Error */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* แจ้งเตือน Success */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รหัสผ่านใหม่ (New Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ยืนยันรหัสผ่านใหม่ (Confirm New Password)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!successMsg}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกรหัสผ่านใหม่...</span>
                </>
              ) : (
                <span>บันทึกรหัสผ่านใหม่</span>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ยกเลิกและกลับสู่หน้าหลัก</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 py-2">
        Copyright © 2026 Complaint Management System. All rights reserved.
      </footer>
    </div>
  )
}
