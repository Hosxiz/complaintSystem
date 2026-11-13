'use client'

// ==============================================================================
// 🏠 หน้าแรกของเว็บไซต์ (Landing Page)
// ==============================================================================
import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Building2,
  Laptop,
  Users2,
  ArrowRight,
} from 'lucide-react'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between selection:bg-teal-200">
      <div>
        {/* ============================================================================== */}
        {/* 1. Header (Topbar)                                                             */}
        {/* ============================================================================== */}
        <header className="bg-[#0052cc] text-white sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white">
                  Complaint<span className="text-teal-300">Sys</span>
                </span>
              </Link>
              <span className="hidden sm:inline-block h-5 w-[1px] bg-blue-300/40" />
              <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-blue-100">
                SDU SCI-TECH
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-blue-100 hover:text-white transition flex items-center gap-1.5"
              >
                <span>ยื่นเรื่องร้องเรียน (Submit a ticket)</span>
              </Link>

              <Link
                href="/login"
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs sm:text-sm font-semibold rounded-lg transition"
              >
                เข้าสู่ระบบ (Login)
              </Link>
            </div>
          </div>
        </header>

        {/* ============================================================================== */}
        {/* 2. Hero Section: ภาพตึก + Gradient Overlay ชัดเจนตรงตาม Ref                    */}
        {/* ============================================================================== */}
        <section
          className="relative py-24 sm:py-32 px-4 flex flex-col items-center justify-center text-center bg-cover bg-center bg-no-repeat shadow-inner"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 82, 204, 0.88), rgba(0, 101, 255, 0.80), rgba(0, 168, 132, 0.85)), url('/hero-building.jpg')`,
          }}
        >
          <div className="relative z-10 max-w-4xl w-full mx-auto space-y-3 px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md whitespace-nowrap">
              ศูนย์รับเรื่องร้องเรียนและข้อเสนอแนะ
            </h1>
            <p className="text-blue-50 text-sm sm:text-base font-medium drop-shadow-sm">
              คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต
            </p>

            {/* กล่องค้นหา (Search Box) */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full max-w-xl mx-auto flex items-center bg-white rounded-lg shadow-2xl p-1.5 border border-white/40 focus-within:ring-4 focus-within:ring-teal-400/40 transition"
            >
              <div className="pl-3.5 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ค้นหาคำถาม, หมวดหมู่, หรือรหัสเคส (เช่น TK-2026-XXXX)..."
                className="w-full px-3 py-2.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00a884] hover:bg-[#008f70] text-white font-bold text-xs uppercase tracking-wider rounded-md transition shadow-md shrink-0"
              >
                Search
              </button>
            </form>


          </div>
        </section>

        {/* ============================================================================== */}
        {/* 3. Section การ์ดหมวดหมู่ช่วยเหลือ (Browse our Help Desk)                        */}
        {/* ============================================================================== */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              เรื่องไหนบ้างที่คุณสามารถแจ้งกับเราได้
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">
              ค้นหาข้อมูลและส่งเรื่องร้องเรียนแยกตามหน่วยงานที่รับผิดชอบ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* การ์ดที่ 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center space-y-4 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">อาคารสถานที่ & สิ่งอำนวยความสะดวก</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                แจ้งปัญหาก๊อกน้ำรั่ว, แอร์ไม่เย็น, หลอดไฟดับ, โต๊ะเก้าอี้ชำรุด หรืออุปกรณ์ภายในอาคารเสียหาย
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 pt-2"
              >
                <span>แจ้งเรื่องหมวดนี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* การ์ดที่ 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center space-y-4 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition">
                <Laptop className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">ระบบสารสนเทศ & อุปกรณ์ไอที</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                คอมพิวเตอร์เปิดไม่ติด, อินเทอร์เน็ต Wi-Fi ขัดข้อง, โปรเจคเตอร์ในห้องเรียน หรือระบบเครือข่าย
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 pt-2"
              >
                <span>แจ้งเรื่องหมวดนี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* การ์ดที่ 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition text-center space-y-4 group">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
                <Users2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">การให้บริการ & ข้อเสนอแนะ</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ข้อเสนอแนะในการปรับปรุงการให้บริการ ความสุภาพ ความรวดเร็ว หรือพฤติกรรมที่ไม่เหมาะสม
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 pt-2"
              >
                <span>แจ้งเรื่องหมวดนี้</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================================== */}
        {/* 4. แบนเนอร์ด้านล่าง                                                             */}
        {/* ============================================================================== */}
        <section className="bg-slate-100 border-t border-slate-200/80 py-12 px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h3 className="text-lg font-bold text-slate-800">ต้องการความช่วยเหลือด่วน หรือสอบถามข้อมูลเพิ่มเติม?</h3>
              <p className="text-xs text-slate-500 mt-1">
                หมดกังวลเรื่องข้อมูลตกหล่น ตรวจสอบความคืบหน้าการแก้ไขได้ตลอดเวลาด้วยรหัสอ้างอิง (Tracking ID) ส่วนตัว
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold rounded-xl shadow-md transition shrink-0"
            >
              เริ่มต้นส่งเรื่องร้องเรียนทันที
            </Link>
          </div>
        </section>
      </div>

      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-400">
        Copyright © 2026 Complaint Management System. All rights reserved.
      </footer>
    </div>
  )
}
