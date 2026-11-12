'use client'

// ==============================================================================
// 🚪 หน้าเข้าสู่ระบบ & สมัครสมาชิก (Responsive Mobile-First + Desktop Sliding Overlay)
// Mobile: Clean Vertical Stack พร้อม Segmented Tab Controller ด้านบน (ใช้ง่ายด้วยนิ้วเดียว)
// Desktop (lg+): Full-screen Sliding Blue Overlay Door Animation ตามสไตล์ต้นฉบับ
// ==============================================================================
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // 'signin' หรือ 'signup'
  const [mode, setMode] = useState('signin')

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        })

        if (error) throw error

        if (data?.session) {
          setSuccessMsg('สร้างบัญชีสำเร็จ! กำลังเข้าสู่ระบบ...')
          window.location.href = '/dashboard'
        } else {
          setSuccessMsg('สมัครสมาชิกสำเร็จ! กรุณาสลับไปเข้าสู่ระบบ')
          setMode('signin')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        })

        if (error) throw error

        setSuccessMsg('เข้าสู่ระบบสำเร็จ!')
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้')
      setLoading(false)
    }
  }

  const isSignUp = mode === 'signup'

  return (
    <div className="min-h-screen w-full bg-[#F0F2F6] flex items-center justify-center p-0 lg:p-6 font-sans">
      {/* Container หลัก: บนมือถือเป็น full-width อิสระ / บนจอใหญ่เป็น Bento Card หรูหรา */}
      <div className="relative w-full min-h-screen lg:min-h-0 lg:h-[860px] lg:max-h-[92vh] max-w-[1400px] bg-white lg:rounded-3xl shadow-none lg:shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* ============================================================================== */}
        {/* 📱 ส่วนหัวบนมือถือ (Mobile Header Banner - แสดงเฉพาะจอเล็ก < lg)                 */}
        {/* ============================================================================== */}
        <div className="lg:hidden w-full bg-[#020617] px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-600/30 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Complaint<span className="text-blue-500">Sys</span>
              </span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-white relative z-10 leading-snug">
            ระบบรับเรื่องร้องเรียนโปร่งใส ปลอดภัย
          </h2>
          <p className="text-xs text-slate-400 mt-1 relative z-10">
            แพลตฟอร์มบริหารจัดการเรื่องร้องทุกข์ระดับองค์กร
          </p>

          {/* สวิตช์สลับแท็บ เข้าสู่ระบบ / สมัครใหม่ บนมือถือ (กดง่ายด้วยนิ้วโป้ง) */}
          <div className="mt-6 flex bg-slate-800/80 p-1 rounded-xl relative z-10 border border-slate-700/60">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${!isSignUp ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
              Sign In (เข้าสู่ระบบ)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${isSignUp ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
            >
              Sign Up (สมัครใหม่)
            </button>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* 💻 เลเยอร์ที่ 1: พื้นที่ฟอร์ม (Desktop แบ่งซ้าย-ขวา / Mobile สลับแสดงเดี่ยว)       */}
        {/* ============================================================================== */}
        <div className="w-full flex-1 flex flex-col lg:flex-row">

          {/* ฟอร์ม SIGN UP (สมัครใหม่) */}
          <div
            className={`w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white ${isSignUp ? 'flex' : 'hidden lg:flex'
              }`}
          >
            <div
              className={`w-full max-w-[380px] space-y-4 transition-opacity duration-500 ${isSignUp ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
              <div className="text-center space-y-1 hidden lg:block">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Create an account
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Sign up to start submitting complaints safely
                </p>
              </div>

              {errorMsg && isSignUp && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && isSignUp && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-sm transition"
              >
                <div className="flex items-center gap-2.5">
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </div>

              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-3 text-slate-400 font-medium">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล (Full Name)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ใส่ชื่อ-สกุล"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมล (Email Address)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (อย่างน้อย 6 ตัวอักษร)"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'สร้างบัญชีผู้ใช้ (Sign Up)'}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  มีบัญชีอยู่แล้ว?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setErrorMsg('')
                      setSuccessMsg('')
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    เข้าสู่ระบบ (Sign in)
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* ฟอร์ม SIGN IN (เข้าสู่ระบบ) */}
          <div
            className={`w-full lg:w-1/2 h-full flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white ${!isSignUp ? 'flex' : 'hidden lg:flex'
              }`}
          >
            <div
              className={`w-full max-w-[380px] space-y-4 transition-opacity duration-500 ${!isSignUp ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
              <div className="text-center space-y-1 hidden lg:block">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome back!
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Sign in to your account to continue
                </p>
              </div>

              {errorMsg && !isSignUp && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && !isSignUp && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-sm transition"
              >
                <div className="flex items-center gap-2.5">
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </div>

              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px]">
                  <span className="bg-white px-3 text-slate-400 font-medium">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมล (Email Address)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'เข้าสู่ระบบ (Sign In)'}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  ยังไม่มีบัญชีผู้ใช้?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setErrorMsg('')
                      setSuccessMsg('')
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    สมัครสมาชิกใหม่ (Sign up)
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================================== */}
        {/* 💻 เลเยอร์ที่ 2: ผ้าม่านสีน้ำเงิน (แสดงเฉพาะบนจอใหญ่ Desktop lg+)                  */}
        {/* ============================================================================== */}
        <div
          className={`hidden lg:flex absolute top-0 bottom-0 w-1/2 bg-[#020617] text-white overflow-hidden p-12 xl:p-16 flex-col justify-between z-30 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isSignUp ? 'translate-x-full' : 'translate-x-0'
            }`}
        >
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/35 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 -right-24 w-80 h-80 bg-blue-500/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-blue-700/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-45 bg-[radial-gradient(circle_at_70%_50%,rgba(37,99,235,0.5)_0%,rgba(2,6,23,0.98)_70%)] pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Complaint<span className="text-blue-500">Sys</span>
            </span>
          </div>

          <div className="relative z-10 my-auto py-10 space-y-4 max-w-lg transition-all duration-500">
            {isSignUp ? (
              <>
                <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.15] text-white">
                  ร่วมสร้างสังคมที่ปลอดภัย <br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200 bg-clip-text text-transparent">
                    ส่งเรื่องง่าย ได้ผลจริง
                  </span>
                </h2>
                <p className="text-slate-300 text-sm font-normal leading-relaxed">
                  เริ่มต้นเป็นส่วนหนึ่งในการแจ้งปัญหาเพื่อการพัฒนาองค์กร พร้อมระบบติดตามสถานะแบบโปร่งใส
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.15] text-white">
                  ระบบรับเรื่องร้องเรียน <br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200 bg-clip-text text-transparent">
                    โปร่งใส ตรวจสอบได้
                  </span>
                </h2>
                <p className="text-slate-300 text-sm font-normal leading-relaxed">
                  แพลตฟอร์มบริหารจัดการเรื่องร้องทุกข์ระดับองค์กร พร้อมโหมดซ่อนตัวตน (Anonymous Whistleblower) ปลอดภัยทุกการติดตาม
                </p>
              </>
            )}
          </div>

          <div className="relative z-10 text-xs text-slate-400">
            Copyright © 2026 Complaint Management System. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}
