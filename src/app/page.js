// ==============================================================================
// 🏠 หน้าแรกของเว็บไซต์ (Landing Page)
// ==============================================================================
import Link from 'next/link'
import { ShieldCheck, ArrowRight, FileText, Lock, Users, CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-6xl w-full mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base block tracking-tight">
              Complaint System
            </span>
            <span className="text-[11px] text-slate-400 font-medium block">
              ระบบรับเรื่องร้องเรียนโปร่งใส ปลอดภัย
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/20 transition"
        >
          เข้าสู่ระบบ
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>รองรับโหมดซ่อนตัวตน (Anonymous Whistleblower)</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          ส่งเรื่องร้องเรียนง่าย <br className="hidden sm:block" />
          <span className="text-blue-600">ติดตามผลได้จริง</span> ปลอดภัยทุกขั้นตอน
        </h1>

        <p className="text-slate-500 text-base max-w-2xl mx-auto leading-relaxed">
          ระบบบริหารจัดการเรื่องร้องเรียนระดับองค์กร พร้อมการคัดกรอง ติดตามด้วย Tracking Code 
          และแบ่งสิทธิ์ชัดเจนระหว่างผู้ร้องเรียน เจ้าหน้าที่ และผู้ดูแลระบบ
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
          >
            <span>เริ่มต้นส่งเรื่องร้องเรียน</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-2xl transition"
          >
            ติดตามเรื่องด้วย Tracking Code
          </Link>
        </div>

        {/* จุดเด่น 3 ข้อ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 text-left">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <Lock className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">ปลอดภัย & ซ่อนตัวตน</h3>
            <p className="text-xs text-slate-500 mt-1">
              เจ้าหน้าที่ผู้ปฏิบัติงานจะไม่สามารถมองเห็นชื่อของคุณเมื่อเลือกโหมด Anonymous
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <FileText className="w-6 h-6 text-emerald-600 mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">รหัสลับ Tracking Code</h3>
            <p className="text-xs text-slate-500 mt-1">
              ติดตามความคืบหน้าของปัญหาได้ตลอดเวลาผ่านรหัสตั๋วและรหัสติดตาม
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <Users className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="font-bold text-slate-800 text-sm">แชท 2 ช่องทาง</h3>
            <p className="text-xs text-slate-500 mt-1">
              คุยตอบกลับกับเจ้าหน้าที่ได้โดยตรง พร้อมระบบบันทึกปรึกษาภายในทีม
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-4 py-8 text-center text-xs text-slate-400 border-t border-slate-200">
        © 2026 Complaint Management System. Built with Next.js, Tailwind CSS & Supabase.
      </footer>
    </div>
  )
}
