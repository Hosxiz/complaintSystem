'use client'

// ==============================================================================
// 🚪 หน้าเข้าสู่ระบบ & สมัครสมาชิก (Responsive Mobile-First + Desktop Sliding Overlay)
// Mobile: Clean Vertical Stack พร้อม Segmented Tab Controller ด้านบน (ใช้ง่ายด้วยนิ้วเดียว)
// Desktop (lg+): Full-screen Sliding Blue Overlay Door Animation ตามสไตล์ต้นฉบับ
// ==============================================================================
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Mail, KeyRound, X } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // 'signin' หรือ 'signup'
  const [mode, setMode] = useState('signin')

  // Verify email prompt modal state
  const [showVerifyEmailModal, setShowVerifyEmailModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')

  // ตรวจจับ Query Parameter เช่น /login?mode=signup เพื่อสลับแท็บไปสมัครสมาชิกอัตโนมัติ
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const requestedMode = params.get('mode') || params.get('tab')
      if (requestedMode === 'signup' || requestedMode === 'register') {
        setMode('signup')
      }
    }
  }, [])

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

        setRegisteredEmail(email.trim())
        setShowVerifyEmailModal(true)
        setMode('signin')
        setEmail('')
        setPassword('')
        setFullName('')
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

  const handleMicrosoftLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile openid',
        },
      })
      if (error) throw error
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถเข้าสู่ระบบด้วย Microsoft ได้')
      setLoading(false)
    }
  }

  // 📧 ฟังก์ชันส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของผู้ใช้
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return

    setForgotLoading(true)
    setForgotError('')
    setForgotSuccess('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })

      if (error) throw error

      setForgotSuccess(
        'ระบบได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาเปิดกล่องจดหมายของคุณ (หรือโฟลเดอร์ Junk/Spam)'
      )
    } catch (err) {
      setForgotError(err.message || 'ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้ กรุณาตรวจสอบอีเมลอีกครั้ง')
    } finally {
      setForgotLoading(false)
    }
  }

  const isSignUp = mode === 'signup'

  return (
    <div className="min-h-screen w-full bg-[#F0F2F6] flex items-center justify-center p-0 lg:p-6 font-sans relative">
      {/* 🏠 ปุ่มกลับสู่หน้าหลัก (Fixed Back to Home Button) */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2 bg-white/90 hover:bg-white text-slate-700 hover:text-blue-600 rounded-xl text-xs font-bold shadow-md hover:shadow-lg border border-slate-200/80 backdrop-blur-md transition-all duration-200 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>กลับสู่หน้าหลัก</span>
      </Link>

      {/* Container หลัก: บนมือถือเป็น full-width อิสระ / บนจอใหญ่เป็น Bento Card หรูหรา */}
      <div className="relative w-full min-h-screen lg:min-h-0 lg:h-[860px] lg:max-h-[92vh] max-w-[1400px] bg-white lg:rounded-3xl shadow-none lg:shadow-2xl overflow-hidden flex flex-col lg:flex-row">

        {/* ============================================================================== */}
        {/* 📱 ส่วนหัวบนมือถือ (Mobile Header Banner - แสดงเฉพาะจอเล็ก < lg)                 */}
        {/* ============================================================================== */}
        <div className="lg:hidden w-full bg-[#020617] px-6 py-8 text-white relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-600/30 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md">
                <img src="/logo.png" alt="SCI-TECH Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                SCI-TECH <span className="text-blue-400">VOICE</span>
              </span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>หน้าหลัก</span>
            </Link>
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

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-sm transition"
                >
                  <div className="flex items-center gap-2.5">
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-sm transition"
                >
                  <div className="flex items-center gap-2.5">
                    <MicrosoftIcon />
                    <span>เข้าสู่ระบบด้วย Microsoft (SDU Mail)</span>
                  </div>
                </button>
              </div>

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
                  ยินดีต้อนรับกลับมา
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

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-sm transition"
                >
                  <div className="flex items-center gap-2.5">
                    <GoogleIcon />
                    <span>Continue with Google</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between shadow-sm transition"
                >
                  <div className="flex items-center gap-2.5">
                    <MicrosoftIcon />
                    <span>เข้าสู่ระบบด้วย Microsoft (SDU Mail)</span>
                  </div>
                </button>
              </div>

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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      รหัสผ่าน (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(true)
                        setForgotEmail(email || '')
                        setForgotError('')
                        setForgotSuccess('')
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition hover:underline"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
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

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-lg shadow-blue-500/20">
                <img src="/logo.png" alt="SCI-TECH Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                SCI-TECH <span className="text-blue-400">VOICE</span>
              </span>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-sm transition group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </div>

          <div className="relative z-10 my-auto py-10 space-y-4 max-w-lg transition-all duration-500">
            {isSignUp ? (
              <>
                <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.15] text-white">
                  ระบบรับเรื่องร้องเรียน ติดตาม <br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200 bg-clip-text text-transparent">
                    แก้ไขปัญหา ได้อย่างเป็นระบบ
                  </span>
                </h2>
                <p className="text-slate-300 text-sm font-normal leading-relaxed">
                  เริ่มต้นเป็นส่วนหนึ่งในการแจ้งปัญหาเพื่อการพัฒนาองค์กร พร้อมระบบติดตามสถานะ
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-[1.15] text-white">
                  Welcome <br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200 bg-clip-text text-transparent">
                    คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต
                  </span>
                </h2>
                <p className="text-slate-300 text-sm font-normal leading-relaxed">
                  เข้าสู่ระบบเพื่อแจ้งเรื่องร้องเรียน เสนอไอเดีย หรือติดตามความคืบหน้าเรื่องที่คุณส่งไว้                </p>
              </>
            )}
          </div>

          <div className="relative z-10 text-xs text-slate-400">
            Copyright © 2026 Complaint Management System. All rights reserved.
          </div>
        </div>

      </div>

      {/* ============================================================================== */}
      {/* 📧 Modal ลืมรหัสผ่าน (Forgot Password Modal)                                    */}
      {/* ============================================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 relative">
            {/* ปุ่มปิด Modal */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* หัวข้อ Modal */}
            <div className="space-y-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                ลืมรหัสผ่าน?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                กรอกอีเมลที่คุณใช้สมัครสมาชิก ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังกล่องจดหมายของคุณทันที
              </p>
            </div>

            {/* กล่องแจ้งเตือน Error */}
            {forgotError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* กล่องแจ้งเตือน Success */}
            {forgotSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {!forgotSuccess ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    อีเมลที่ลงทะเบียนไว้
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังส่ง...</span>
                      </>
                    ) : (
                      <span>ส่งลิงก์รีเซ็ต</span>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition"
                >
                  เข้าใจแล้ว ปิดหน้าต่างนี้
                </button>
              </div>
            )}

            <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-500">
              <Link
                href="/"
                className="inline-flex items-center gap-1 hover:text-blue-600 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับสู่หน้าหลัก</span>
              </Link>
            </div>
          </div>
        </div>
      )}
      {/* ============================================================================== */}
      {/* 📧 Modal แจ้งเตือนยืนยันอีเมลหลังสมัครสมาชิก (Verify Email Prompt Modal)        */}
      {/* ============================================================================== */}
      {showVerifyEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 text-center relative">
            <button
              type="button"
              onClick={() => setShowVerifyEmailModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-blue-100">
              <Mail className="w-8 h-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                กรุณาตรวจสอบและยืนยันอีเมล
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ระบบได้ส่งลิงก์สำหรับยืนยันตัวตนไปยังอีเมล:
              </p>
              <div className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 break-all">
                {registeredEmail}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                กรุณาเปิดกล่องจดหมายของคุณ (หรือโฟลเดอร์ Junk/Spam) และคลิกลิงก์ยืนยัน เพื่อเปิดใช้งานบัญชีของคุณก่อนเข้าสู่ระบบ
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowVerifyEmailModal(false)
                setMode('signin')
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
            >
              เข้าใจแล้ว ไปยังหน้าเข้าสู่ระบบ
            </button>
          </div>
        </div>
      )}
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

function MicrosoftIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}
