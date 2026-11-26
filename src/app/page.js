'use client'

// ==============================================================================
// 🏛️ หน้าแรกของเว็บไซต์ (Landing Page - อิงสไตล์ทางการตาม Ref ศูนย์ดำรงธรรม 1567)
// คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต (SCI-TECH VOICE)
// ==============================================================================
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { STATUS_CONFIG } from '@/lib/tickets/status-config'
import TicketDiscussion from '@/components/tickets/TicketDiscussion'
import TicketRatingWidget from '@/components/tickets/TicketRatingWidget'
import {
  Search,
  Building2,
  Laptop,
  Users2,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  MessageSquare,
  LogIn,
  User,
  Eye,
  EyeOff,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  ShieldCheck,
  FileText,
  Sparkles,
  HelpCircle,
  MessageCircle,
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  // States สำหรับการค้นหาและติดตามเรื่องร้องเรียน
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchResult, setSearchResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  // States สำหรับผู้ใช้ & กล่องเข้าสู่ระบบด้านขวา
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // ตรวจสอบสถานะการเข้าสู่ระบบ
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (profile) setUserProfile(profile)
      }
    }
    checkUser()
  }, [])

  // ฟังก์ชันค้นหาและติดตามตั๋วแบบ Realtime (รองรับทั้งผู้ใช้งานทั่วไปและ Guest ที่ไม่ได้ล็อกอิน)
  const handleTrackSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setErrorMsg('')
    setSearchResult(null)

    try {
      const cleanKey = searchQuery.trim()

      // 1. ลองดึงผ่าน RPC function 'track_ticket' (ปลอดภัย 100% สำหรับ Guest)
      let foundData = null
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('track_ticket', {
          search_code: cleanKey,
        })
        if (!rpcError && rpcData) {
          foundData = rpcData
        }
      } catch (rpcErr) {
        console.warn('RPC track_ticket fallback:', rpcErr)
      }

      // 2. ถ้า RPC ไม่พบหรือไม่พร้อม ให้ใช้ Direct Query
      if (!foundData) {
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            id,
            ticket_code,
            tracking_code,
            title,
            description,
            status,
            created_at,
            rating,
            rating_feedback,
            rated_at,
            category:categories(name)
          `)
          .or(`ticket_code.ilike.${cleanKey},tracking_code.ilike.${cleanKey}`)
          .maybeSingle()

        if (error) throw error
        foundData = data
      }

      if (!foundData) {
        throw new Error(`ไม่พบข้อมูลเรื่องร้องเรียนสำหรับรหัส "${cleanKey}" กรุณาตรวจสอบรหัสตั๋วหรือ Tracking Code อีกครั้ง`)
      }

      setSearchResult(foundData)
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการค้นหา')
    } finally {
      setLoading(false)
    }
  }

  // ฟังก์ชันเข้าสู่ระบบด่วนผ่านการ์ดด้านขวา (Quick Login)
  const handleQuickLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }

    setLoginLoading(true)
    setLoginError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      })

      if (error) {
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง')
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push('/admin')
        } else if (profile?.role === 'staff') {
          router.push('/staff')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setLoginLoading(false)
    }
  }

  // ออกจากระบบ
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setUserProfile(null)
    router.refresh()
  }

  const currentStatusInfo = searchResult
    ? STATUS_CONFIG[searchResult.status] || STATUS_CONFIG.SUBMITTED
    : null

  return (
    <div className="min-h-screen bg-slate-50/70 font-sans flex flex-col justify-between text-slate-800">
      <div>
        {/* ============================================================================== */}
        {/* 1. Header (Navbar) สไตล์ทางการ ตาม Ref เมนูศูนย์ดำรงธรรม                         */}
        {/* ============================================================================== */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            {/* โลโก้และชื่อระบบ */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 bg-amber-50/80 border border-amber-200/60 rounded-2xl flex items-center justify-center p-1 shadow-xs group-hover:scale-105 transition-transform">
                  <Image
                    src="/logo.png"
                    alt="SCI-TECH Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-base sm:text-lg font-black tracking-tight text-[#0052cc] block leading-tight">
                    SCI-TECH <span className="text-amber-500">VOICE</span>
                  </span>
                  <span className="text-[11px] text-slate-500 block font-medium leading-tight">
                    คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต
                  </span>
                </div>
              </Link>
            </div>

            {/* เมนูนำทางตรงกลางและด้านขวาตาม Ref */}
            <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-600">
              <Link
                href="/dashboard"
                className="hover:text-blue-700 transition"
              >
                ร้องเรียน/ร้องทุกข์
              </Link>
              <Link
                href="/dashboard"
                className="hover:text-blue-700 transition"
              >
                ข้อเสนอแนะ
              </Link>
              <a
                href="#track-section"
                className="hover:text-blue-700 transition"
              >
                ติดตามเรื่อง
              </a>
              <a
                href="#categories-section"
                className="hover:text-blue-700 transition"
              >
                หมวดหมู่บริการ
              </a>
              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-blue-700 transition">
                <span>คู่มือการใช้งาน</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </nav>

            {/* ปุ่มทางลัดหลัก */}
            <div className="flex items-center gap-2.5">
              {currentUser ? (
                <Link
                  href={
                    userProfile?.role === 'admin'
                      ? '/admin'
                      : userProfile?.role === 'staff'
                        ? '/staff'
                        : '/dashboard'
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>เข้าสู่ห้องทำงาน ({userProfile?.role || 'User'})</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <span>ร้องเรียน/งานบริการต่างๆ</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* ============================================================================== */}
        {/* 2. Hero Section: แบ่งฝั่งซ้าย (ข้อความ + ค้นหา) และฝั่งขวา (กล่องล็อกอินตาม Ref) */}
        {/* ============================================================================== */}
        <section
          id="track-section"
          className="relative py-12 lg:py-16 px-4 bg-gradient-to-br from-white via-blue-50/20 to-slate-100/60 border-b border-slate-200/70"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* ---------------- ฝั่งซ้าย (60%): ข้อความนำ + กล่องค้นหาติดตามคำร้อง ---------------- */}
            <div className="lg:col-span-7 space-y-6">
              {/* ตราประจำระบบ 1567 Style Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-black tracking-wide uppercase">
                  SCI-TECH VOICE • รับฟังทุกเสียง 24 ชั่วโมง
                </span>
              </div>

              {/* ข้อความหลักตัวโตแบบ Ref ศูนย์ดำรงธรรม */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  บริการด้วยใจ <br />
                  <span className="text-[#0052cc]">เพื่อชาววิทย์-เทคโนฯ สวนดุสิต</span>
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                  ศูนย์รับเรื่องร้องเรียน ร้องทุกข์ และข้อเสนอแนะ คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต
                  ติดตามสถานะการดำเนินงานได้อย่างโปร่งใส รวดเร็ว และเป็นธรรม
                </p>
              </div>

              {/* กล่องค้นหาและติดตามสถานะคำร้อง (Track Ticket Box) */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span>ค้นหาและติดตามสถานะเรื่องร้องเรียน (ไม่ต้องเข้าสู่ระบบ)</span>
                </span>

                <form
                  onSubmit={handleTrackSearch}
                  className="flex items-center bg-white rounded-2xl shadow-sm p-1.5 border border-slate-200 focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-100 transition max-w-xl"
                >
                  <div className="pl-3.5 text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="กรอกรหัสตั๋ว เช่น TK-2026-X8Y2 หรือ Tracking Code..."
                    className="w-full px-3 py-2.5 text-slate-800 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-[#00a884] hover:bg-[#008f70] disabled:bg-teal-300 text-white font-bold text-xs rounded-xl transition shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังค้นหา...</span>
                      </>
                    ) : (
                      <span>ติดตามเรื่อง</span>
                    )}
                  </button>
                </form>

                {/* แจ้งเตือนข้อผิดพลาดถ้าไม่พบ */}
                {errorMsg && (
                  <div className="max-w-xl p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between gap-2 shadow-2xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{errorMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMsg('')}
                      className="p-1 hover:bg-rose-100 rounded-lg text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* การ์ดผลลัพธ์การติดตามตั๋วแบบ Realtime */}
              {searchResult && currentStatusInfo && (
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-md border border-slate-200 p-6 text-left space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                          {searchResult.ticket_code}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {searchResult.category?.name || 'หมวดหมู่ทั่วไป'}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900 mt-1.5">
                        {searchResult.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${currentStatusInfo.color}`}>
                        {currentStatusInfo.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setSearchResult(null)}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
                        title="ปิดผลการค้นหา"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* คำอธิบายสถานะ */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-0.5">
                    <span className="font-bold text-slate-800 block">สถานะปัจจุบัน:</span>
                    <p>{currentStatusInfo.description}</p>
                  </div>

                  {/* รายละเอียด */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      รายละเอียดเรื่องที่แจ้ง:
                    </h4>
                    <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {searchResult.description}
                    </div>
                  </div>

                  {/* ⭐ ประเมินความพึงพอใจการให้บริการเมื่อเคสเสร็จสิ้น */}
                  {['RESOLVED', 'CLOSED'].includes(searchResult.status) && (
                    <TicketRatingWidget
                      ticket={searchResult}
                      onRated={(updatedTicket) => setSearchResult(updatedTicket)}
                    />
                  )}

                  {/* ส่วนการสนทนากับเจ้าหน้าที่ */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    {currentUser ? (
                      <TicketDiscussion ticketId={searchResult.id} currentRole="user" />
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                          <MessageSquare className="w-4 h-4 text-blue-600" />
                          <span>ประวัติการตอบกลับจากเจ้าหน้าที่:</span>
                        </div>

                        {searchResult.messages && searchResult.messages.length > 0 ? (
                          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                            {searchResult.messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`p-3 rounded-2xl text-xs space-y-1 ${msg.sender_role === 'staff' || msg.sender_role === 'admin'
                                  ? 'bg-blue-50/80 border border-blue-100 text-slate-800'
                                  : 'bg-slate-100 border border-slate-200/60 text-slate-700'
                                  }`}
                              >
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                  <span className={msg.sender_role === 'staff' ? 'text-blue-700' : 'text-slate-600'}>
                                    {msg.sender_name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    {new Date(msg.created_at).toLocaleString('th-TH')}
                                  </span>
                                </div>
                                <p className="leading-relaxed">{msg.message}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-400 text-xs">
                            ยังไม่มีข้อความตอบกลับในเคสนี้
                          </div>
                        )}

                        <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2 text-blue-900">
                            <LogIn className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>ต้องการส่งข้อความสนทนาตอบกลับเจ้าหน้าที่?</span>
                          </div>
                          <Link
                            href="/login"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition shrink-0"
                          >
                            เข้าสู่ระบบ (Login)
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ---------------- ฝั่งขวา (40%): กล่องล็อกอินตรงตาม Ref เป๊ะๆ ---------------- */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-slate-200/90 space-y-6">
                {currentUser ? (
                  /* แสดงข้อมูลผู้ใช้เมื่อล็อกอินแล้ว */
                  <div className="space-y-5 text-center py-4">
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-black text-xl mx-auto shadow-xs">
                      {userProfile?.full_name?.slice(0, 2).toUpperCase() || 'US'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        ยินดีต้อนรับ, {userProfile?.full_name || currentUser.email}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        บทบาท: <span className="font-bold text-blue-600 uppercase">{userProfile?.role || 'User'}</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Link
                        href={
                          userProfile?.role === 'admin'
                            ? '/admin'
                            : userProfile?.role === 'staff'
                              ? '/staff'
                              : '/dashboard'
                        }
                        className="w-full py-3 bg-[#0052cc] hover:bg-[#0041a8] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>ไปยังห้องทำงานของฉัน</span>
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="w-full py-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition"
                      >
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                ) : (
                  /* กล่องฟอร์มล็อกอินตาม Ref */
                  <>
                    <div className="border-b-2 border-amber-400 pb-2">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                        เข้าสู่ระบบเพื่อส่งเรื่องร้องเรียน
                      </h2>
                    </div>

                    {loginError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <form onSubmit={handleQuickLogin} className="space-y-4">
                      {/* ชื่อผู้ใช้งาน / อีเมล */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 block">
                          ชื่อผู้ใช้งาน หรือ อีเมล
                        </label>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="เช่น student@mail.dusit.ac.th"
                          className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                      </div>

                      {/* รหัสผ่าน */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 block">
                            รหัสผ่าน
                          </label>
                          <Link
                            href="/login"
                            className="text-[11px] text-blue-600 hover:underline font-medium"
                          >
                            ลืมรหัสผ่าน?
                          </Link>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="กรอกรหัสผ่านของคุณ"
                            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* ปุ่มเข้าสู่ระบบ */}
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full py-3 bg-[#0052cc] hover:bg-[#0041a8] disabled:bg-blue-300 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loginLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>กำลังตรวจสอบ...</span>
                          </>
                        ) : (
                          <span>เข้าสู่ระบบ</span>
                        )}
                      </button>
                    </form>

                    {/* หรือแบ่งคั่น */}
                    <div className="relative flex items-center justify-center">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-white px-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider absolute">
                        หรือ
                      </span>
                    </div>

                    {/* ปุ่มทางเลือก (เข้าสู่ระบบด้วย ThaID / บัญชีนักศึกษา) */}
                    <div className="space-y-2">
                      <Link
                        href="/login"
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>เข้าสู่ระบบด้วย SDU Account / Google Account</span>
                      </Link>
                    </div>

                    {/* สมัครสมาชิกใหม่ */}
                    <div className="text-center pt-1 border-t border-slate-100">
                      <span className="text-xs text-slate-500">
                        ยังไม่เคยลงทะเบียน ?{' '}
                        <Link
                          href="/login"
                          className="font-bold text-blue-600 hover:underline"
                        >
                          ลงทะเบียนผู้ใช้งานใหม่
                        </Link>
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================================== */}
        {/* 3. Section การ์ดหมวดหมู่ช่วยเหลือ (Browse our Services)                          */}
        {/* ============================================================================== */}
        <section id="categories-section" className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              เรื่องไหนบ้างที่คุณสามารถแจ้งกับเราได้
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
              บริการครอบคลุมทุกด้านเพื่ออำนวยความสะดวกแก่นักศึกษา คณาจารย์ และบุคลากร
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* การ์ดที่ 1 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-center space-y-4 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition shadow-2xs">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">อาคารสถานที่ & สิ่งอำนวยความสะดวก</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                แจ้งปัญหาก๊อกน้ำรั่ว, แอร์ไม่เย็น, หลอดไฟดับ, โต๊ะเก้าอี้ชำรุด หรืออุปกรณ์ภายในอาคารคณะฯ เสียหาย
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 pt-1"
              >
                <span>แจ้งเรื่องหมวดนี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* การ์ดที่ 2 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-center space-y-4 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition shadow-2xs">
                <Laptop className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">ระบบสารสนเทศ & อุปกรณ์ไอที</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                คอมพิวเตอร์ห้องปฏิบัติการ, สัญญาณ Wi-Fi ขัดข้อง, โปรเจกเตอร์ หรือระบบห้องแล็บวิทยาศาสตร์
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-800 pt-1"
              >
                <span>แจ้งเรื่องหมวดนี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* การ์ดที่ 3 */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition text-center space-y-4 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition shadow-2xs">
                <Users2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">การให้บริการ & ข้อเสนอแนะทั่วไป</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ข้อเสนอแนะในการปรับปรุงการให้บริการ ความรวดเร็ว หรือการสนับสนุนทางวิชาการและกิจกรรมนักศึกษา
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 pt-1"
              >
                <span>แจ้งเรื่องหมวดนี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================================== */}
      {/* 4. Footer สไตล์ทางการ ตาม Ref ศูนย์ดำรงธรรมเป๊ะๆ (Image 2)                         */}
      {/* ============================================================================== */}
      <footer className="bg-white border-t border-slate-200 pt-14 pb-8 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-100">
          {/* คอลัมน์ที่ 1: ตราสัญลักษณ์และอัตลักษณ์คณะ */}
          <div className="lg:col-span-3 space-y-3.5">
            <div className="w-16 h-16 bg-white border border-slate-200/80 rounded-2xl p-1.5 flex items-center justify-center shadow-xs">
              <Image
                src="/logo.png"
                alt="SDU Faculty Seal"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-sm leading-snug">
                คณะวิทยาศาสตร์และเทคโนโลยี
              </h4>
              <p className="text-slate-500 text-[11px] font-medium leading-tight mt-0.5">
                มหาวิทยาลัยสวนดุสิต
              </p>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/60">
                มาร่วมเป็นส่วนหนึ่งในการ บำบัดทุกข์ บำรุงสุข เพื่อชาวสวนดุสิต
              </span>
            </div>
          </div>

          {/* คอลัมน์ที่ 2: เกี่ยวกับคณะวิทยาศาสตร์และเทคโนโลยี */}
          <div className="lg:col-span-3 space-y-2.5">
            <h5 className="font-black text-slate-900 text-xs tracking-wider uppercase">
              เกี่ยวกับคณะวิทยาศาสตร์ฯ
            </h5>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <a href="" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>โครงสร้างและผู้บริหารคณะ</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
              <li>
                <a href="" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>9 หลักสูตรสาขาวิชา</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
              <li>
                <a href="" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>ข่าวสาร/กิจกรรมของคณะ</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
              <li>
                <a href="" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>คำสั่ง/ประกาศคณะ</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
              <li>
                <a href="" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>สรุปผลการดำเนินงาน</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
            </ul>
          </div>

          {/* คอลัมน์ที่ 3: บริการและข้อมูลอื่นๆ */}
          <div className="lg:col-span-3 space-y-2.5">
            <h5 className="font-black text-slate-900 text-xs tracking-wider uppercase">
              บริการและข้อมูลอื่นๆ
            </h5>
            <ul className="space-y-1.5 text-slate-500">
              <li>
                <a href="https://dusit.ac.th" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>เว็บไซต์มหาวิทยาลัยสวนดุสิต</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
              <li>
                <a href="https://arit.dusit.ac.th" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>สำนักวิทยบริการและเทคโนโลยีสารสนเทศ</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
              <li>
                <a href="https://sdu.ac.th" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>แบบสำรวจความพึงพอใจการให้บริการ</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
              <li>
                <a href="https://sdu.ac.th" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>กองพัฒนานักศึกษา</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
              <li>
                <a href="https://sci.dusit.ac.th" target="_blank" rel="noreferrer" className="hover:text-blue-600 flex items-center gap-1 transition">
                  <span>นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
                  <ExternalLink className="w-3 h-3 text-slate-300" />
                </a>
              </li>
            </ul>
          </div>

          {/* คอลัมน์ที่ 4: ติดต่อเรา */}
          <div className="lg:col-span-3 space-y-2.5">
            <h5 className="font-black text-slate-900 text-xs tracking-wider uppercase">
              ติดต่อเรา
            </h5>
            <div className="space-y-2 text-slate-500 text-[11px] leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  - <br />
                  -
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>-</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>-</span>
              </div>
            </div>
          </div>
        </div>

        {/* บรรทัดล่างสุด ลิขสิทธิ์ */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            Copyright © 2026 SCI-TECH VOICE คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-600 cursor-pointer">นโยบายความเป็นส่วนตัว</span>
            <span>•</span>
            <span className="hover:text-slate-600 cursor-pointer">ข้อกำหนดการใช้งาน</span>
          </div>
        </div>
      </footer>

      {/* ============================================================================== */}
      {/* 5. Floating Quick Action Widget (ตาม Ref "แจ้งเรื่องน้องสิงห์" มุมขวาล่าง)         */}
      {/* ============================================================================== */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <a
          href="#track-section"
          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-lg transition flex items-center gap-2 border border-amber-300"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>ติดตามเรื่องด่วน</span>
        </a>

        <Link
          href="/dashboard"
          className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition hover:scale-105"
          title="ติดต่อแจ้งเรื่อง"
        >
          <MessageCircle className="w-6 h-6" />
        </Link>
      </div>
    </div>
  )
}
