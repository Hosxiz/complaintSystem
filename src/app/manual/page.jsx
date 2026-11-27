'use client'

// ==============================================================================
// 📖 หน้าคู่มือการใช้งานระบบ SCI-TECH VOICE (User Manual & Help Center)
// ออกแบบสไตล์ Modern Official Knowledge Base สำหรับทุกกลุ่มผู้ใช้งาน
// ==============================================================================
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Search,
  User,
  GraduationCap,
  Shield,
  HelpCircle,
  FileText,
  Printer,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  MessageSquare,
  Clock,
  Layers,
  Sparkles,
  Download,
  Filter,
  EyeOff,
  Star,
  Activity,
  Send,
  Building2,
} from 'lucide-react'

// รายการหัวข้อคู่มือการใช้งาน
const MANUAL_SECTIONS = [
  // 🎓 หมวด 1: นักศึกษา / บุคคลทั่วไป
  {
    id: 'student-create',
    role: 'student',
    category: 'นักศึกษา / ประชาชน',
    title: '1. ขั้นตอนการส่งเรื่องร้องเรียน / ร้องทุกข์',
    description: 'วิธีการกรอกคำร้อง การเลือกสาขาวิชา และการเลือกความคุ้มครองข้อมูลส่วนตัว',
    steps: [
      {
        step: 1,
        title: 'เข้าสู่หน้าแจ้งเรื่องร้องทุกข์',
        desc: 'คลิกปุ่ม "ร้องเรียน/งานบริการต่างๆ" ที่มุมขวาบน หรือกดส่งเรื่องด่วนได้จากหน้าหลัก',
      },
      {
        step: 2,
        title: 'เลือกประเภทความคุ้มครอง (สำคัญมาก)',
        desc: 'ท่านสามารถเลือกส่งแบบ "เปิดเผยตัวตน" หรือแบบ "ไม่เปิดเผยตัวตน (Anonymous)" ซึ่งระบบจะไม่บันทึกชื่อ นามสกุล และอีเมลของท่านในระบบสาธารณะ',
      },
      {
        step: 3,
        title: 'ระบุสาขาวิชาและหมวดหมู่ที่เกี่ยวข้อง',
        desc: 'เลือก 1 ใน 9 หลักสูตรสาขาวิชาของคณะวิทยาศาสตร์และเทคโนโลยี เพื่อให้เรื่องส่งตรงถึงอาจารย์ผู้รับผิดชอบอย่างรวดเร็ว',
      },
      {
        step: 4,
        title: 'กรอกรายละเอียดและแนบหลักฐาน',
        desc: 'พิมพ์ข้อเท็จจริง วันเวลา สถานที่ และสามารถแนบไฟล์ภาพถ่ายหรือเอกสารประกอบ จากนั้นกด "ยืนยันการส่งเรื่อง"',
      },
    ],
    tips: 'เมื่อส่งเรื่องสำเร็จ ระบบจะแสดง "รหัสคำร้อง (Ticket Code)" เช่น ST-2026-0891 ให้ท่านจดบันทึกหรือถ่ายภาพหน้าจอไว้เพื่อใช้ติดตามเรื่อง',
    warning: 'กรุณาหลีกเลี่ยงการใช้ถ้อยคำหยาบคาย หรือการใส่ร้ายที่ไม่เป็นความจริงตามข้อบังคับมหาวิทยาลัย',
  },
  {
    id: 'student-track',
    role: 'student',
    category: 'นักศึกษา / ประชาชน',
    title: '2. การติดตามสถานะคำร้อง (Track Ticket)',
    description: 'ตรวจสอบความคืบหน้าและการดำเนินงานของเจ้าหน้าที่ได้ตลอด 24 ชั่วโมง',
    steps: [
      {
        step: 1,
        title: 'ไปยังช่องติดตามเรื่อง',
        desc: 'ไปที่หน้าหลัก (Home) แล้วเลื่อนลงมาที่แถบ "ตรวจสอบสถานะเรื่องร้องเรียน" หรือคลิกเมนู "ติดตามเรื่อง" ด้านบน',
      },
      {
        step: 2,
        title: 'กรอกรหัสคำร้อง (Ticket Code)',
        desc: 'พิมพ์รหัสคำร้องที่ท่านได้รับตอนแจ้งเรื่อง (เช่น ST-2026-XXXX) แล้วกดปุ่ม "ค้นหาเรื่อง"',
      },
      {
        step: 3,
        title: 'ดูสถานะปัจจุบันและความคืบหน้า',
        desc: 'ระบบจะแสดงไทม์ไลน์สถานะ วันเวลาที่รับเรื่อง และเจ้าหน้าที่ผู้รับผิดชอบ',
      },
    ],
    statuses: [
      { name: 'รอรับเรื่อง (Submitted / Received)', color: 'bg-amber-100 text-amber-800 border-amber-300', desc: 'เรื่องถูกส่งเข้าสู่ระบบแล้ว รอเจ้าหน้าที่ตรวจสอบเบื้องต้น' },
      { name: 'กำลังดำเนินการ (In Progress)', color: 'bg-blue-100 text-blue-800 border-blue-300', desc: 'เจ้าหน้าที่รับเรื่องและอยู่ระหว่างประสานงานแก้ไขปัญหา' },
      { name: 'รอดำเนินการเพิ่มเติม (Waiting)', color: 'bg-orange-100 text-orange-800 border-orange-300', desc: 'อาจมีการขอเอกสารหรือข้อมูลเพิ่มเติมจากผู้ร้องเรียน' },
      { name: 'เสร็จสิ้น (Resolved / Closed)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', desc: 'ปัญหาได้รับการแก้ไขหรือได้ข้อสรุปเรียบร้อยแล้ว' },
    ],
  },
  {
    id: 'student-chat-rating',
    role: 'student',
    category: 'นักศึกษา / ประชาชน',
    title: '3. การพูดคุยโต้ตอบและการประเมินความพึงพอใจ',
    description: 'ช่องทางสื่อสารสองทางกับเจ้าหน้าที่ผู้ดูแลและการให้คะแนนบริการ',
    steps: [
      {
        step: 1,
        title: 'ห้องสนทนาในหน้าติดตามเรื่อง',
        desc: 'ท่านสามารถพิมพ์ส่งข้อความหรือสอบถามความคืบหน้ากับเจ้าหน้าที่ผ่านกล่องข้อความใต้รายละเอียดคำร้อง',
      },
      {
        step: 2,
        title: 'ให้คะแนนความพึงพอใจ (1 - 5 ดาว)',
        desc: 'เมื่อเรื่องถูกปรับสถานะเป็น "เสร็จสิ้น" จะมีกล่องประเมินผลปรากฏขึ้น เพื่อให้ท่านประเมินความรวดเร็วและความใส่ใจของเจ้าหน้าที่',
      },
    ],
    tips: 'คะแนนความพึงพอใจจะถูกนำไปประมวลผลเป็นสถิติภาพรวมเพื่อพัฒนาคุณภาพการให้บริการของคณะฯ',
  },

  // 🧑‍🏫 หมวด 2: เจ้าหน้าที่ / อาจารย์
  {
    id: 'staff-workspace',
    role: 'staff',
    category: 'อาจารย์ / เจ้าหน้าที่',
    title: '4. การใช้งานห้องปฏิบัติงานเจ้าหน้าที่ ',
    description: 'จัดการกระดานคำร้อง ปรับเปลี่ยนสถานะ และบันทึกการประสานงาน',
    steps: [
      {
        step: 1,
        title: 'เข้าสู่ระบบด้วยบัญชีเจ้าหน้าที่ (@scitech.dusit.ac.th)',
        desc: 'ล็อกอินเข้าสู่ระบบ จะถูกนำมาที่หน้าห้องทำงาน Staff โดยอัตโนมัติ',
      },
      {
        step: 2,
        title: 'เลือกสลับมุมมอง กระดาน  หรือ รายการ ',
        desc: 'มุมมอแรก ช่วยให้ลากย้ายการ์ดเปลี่ยนสถานะได้อย่างรวดเร็ว ส่วน List View เหมาะกับการดูตารางสรุปคำร้องปริมาณมาก',
      },
      {
        step: 3,
        title: 'การตอบกลับและประสานงาน',
        desc: 'คลิกที่บัตรคำร้องเพื่อเปิดหน้าต่างรายละเอียด พิมพ์ตอบกลับผู้ร้องเรียน หรือบันทึกโน้ตภายในสำหรับทีมงาน',
      },
    ],
    warning: 'ห้ามเปิดเผยข้อมูลชื่อผู้ร้องเรียนที่เลือกส่งแบบไม่เปิดเผยตัวตน (Anonymous) ออกนอกระบบเด็ดขาด',
  },
  {
    id: 'staff-filter-analytics',
    role: 'staff',
    category: 'อาจารย์ / เจ้าหน้าที่',
    title: '5. ตัวกรองช่วงเวลา',
    description: 'คัดกรองข้อมูลคำร้องตามวันเวลา และวิเคราะห์แนวโน้มคำร้องแยกตาม 9 สาขาวิชา',
    steps: [
      {
        step: 1,
        title: 'คลิกปุ่ม 3 ขีด กรองช่วงเวลา',
        desc: 'ปุ่มตัวกรองอยู่มุมขวาบนของตาราง สามารถเลือก "วันนี้", "7 วันล่าสุด", "เดือนนี้", "ปีนี้" หรือระบุวันที่เอง',
      },
      {
        step: 2,
        title: 'ดูชาร์ตสถิติและแนวโน้ม (Trend Analytics)',
        desc: 'ชาร์ตจะคำนวณจำนวนคำร้อง แนวโน้มรายวัน และแจกแจงสัดส่วนตาม 9 สาขาวิชาของคณะวิทย์ฯ เพื่อดูว่าสาขาใดมีประเด็นที่ต้องเร่งแก้ไข',
      },
    ],
    tips: 'เมื่อเลือกตัวกรองช่วงเวลา ข้อมูลตัวเลข KPI สถิติความพึงพอใจ และรายการคำร้องจะอัปเดตสัมพันธ์กันทันทีแบบ Real-time',
  },

  // 👑 หมวด 3: ผู้ดูแลระบบ
  {
    id: 'admin-roles',
    role: 'admin',
    category: 'ผู้ดูแลระบบ',
    title: '6. การจัดการสิทธิ์ผู้ใช้งาน (RBAC Management)',
    description: 'กำหนดและปรับเปลี่ยนบทบาทผู้ใช้งานระหว่าง Super Admin, Staff และ Student',
    steps: [
      {
        step: 1,
        title: 'เข้าสู่ระบบด้วยสิทธิ์ Admin',
        desc: 'ไปที่แท็บ "จัดการสิทธิ์และผู้ใช้ (Roles & Users)" ในหน้าศูนย์ควบคุม Admin Overview',
      },
      {
        step: 2,
        title: 'ปรับบทบาทของบุคลากร',
        desc: 'ค้นหาชื่อหรืออีเมลของผู้ใช้ แล้วเลือกบทบาทเป็น "Admin" หรือ "Staff" ตามคำสั่งแต่งตั้งของคณะ',
      },
    ],
    warning: 'การให้สิทธิ์ Admin สูงสุด ควรจำกัดเฉพาะผู้รับผิดชอบระบบสารสนเทศคณะฯ เท่านั้น',
  },
  {
    id: 'admin-categories-deletion',
    role: 'admin',
    category: 'ผู้ดูแลระบบ',
    title: '7. การจัดการหมวดหมู่และการลบคำร้องอย่างปลอดภัย (Audit Log)',
    description: 'เพิ่ม/แก้ไขหมวดหมู่บริการ และระบบลบคำร้องพร้อมบันทึกประวัติความปลอดภัย',
    steps: [
      {
        step: 1,
        title: 'การเพิ่มหรือปิดหมวดหมู่คำร้อง',
        desc: 'ในแท็บ "จัดการหมวดหมู่" สามารถเพิ่มประเภทเรื่องร้องเรียนใหม่ หรือกำหนดเจ้าหน้าที่ผู้ดูแลหลักของหมวดนั้นได้',
      },
      {
        step: 2,
        title: 'การลบคำร้องที่ไม่เหมาะสม (Audit Log Enforced)',
        desc: 'เมื่อมีความจำเป็นต้องลบคำร้อง (เช่น สแปม หรือข้อมูลซ้ำซ้อน) ระบบจะบังคับให้ระบุ "เหตุผลในการลบ" ทุกครั้ง และบันทึกประวัติไว้ใน Audit Log เสมอ ป้องกันการลบโดยพลการ',
      },
    ],
    tips: 'สามารถคลิกดู "ประวัติการลบคำร้อง" เพื่อตรวจสอบย้อนหลังได้ตลอดเวลา',
  },

  // ❓ หมวด 4: คำถามที่พบบ่อย
  {
    id: 'faq-security',
    role: 'faq',
    category: 'คำถามที่พบบ่อย & ความปลอดภัย',
    title: '8. คำถามที่พบบ่อยและนโยบายคุ้มครองข้อมูล (PDPA)',
    faqs: [
      {
        q: 'หากลืมรหัสคำร้อง (Ticket Code) ต้องทำอย่างไร?',
        a: 'หากท่านเข้าสู่ระบบก่อนส่งเรื่อง สามารถดูประวัติคำร้องทั้งหมดได้ในหน้า Dashboard ส่วนตัว แต่หากส่งแบบไม่ระบุตัวตน กรุณาติดต่อหน่วยสารสนเทศคณะฯ เพื่อขอตรวจสอบตามวันเวลาที่แจ้ง',
      },
      {
        q: 'ข้อมูลคำร้องของฉันจะถูกเปิดเผยต่อสาธารณะหรือไม่?',
        a: 'ไม่เปิดเผยครับ ข้อมูลจะถูกเก็บเป็นความลับและเห็นเฉพาะอาจารย์หรือเจ้าหน้าที่ผู้รับผิดชอบงานที่เกี่ยวข้องโดยตรงเท่านั้น',
      },
      {
        q: 'ใช้เวลาดำเนินการนานเท่าไรหลังส่งเรื่อง?',
        a: 'เจ้าหน้าที่จะเข้ามารับเรื่องเบื้องต้นภายใน 24-48 ชั่วโมงทำการ และจะแจ้งความคืบหน้าให้ทราบผ่านระบบติดตามสถานะอย่างต่อเนื่อง',
      },
    ],
  },
]

export default function ManualPage() {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'student' | 'staff' | 'admin' | 'faq'
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSectionId, setActiveSectionId] = useState('student-create')

  // กรองเนื้อหาตาม Tab และ Search Query
  const filteredSections = useMemo(() => {
    return MANUAL_SECTIONS.filter((section) => {
      const matchTab = activeTab === 'all' || section.role === activeTab
      if (!matchTab) return false

      if (!searchQuery.trim()) return true

      const q = searchQuery.toLowerCase()
      const matchTitle = section.title.toLowerCase().includes(q)
      const matchDesc = section.description?.toLowerCase().includes(q)
      const matchSteps = section.steps?.some(
        (s) => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
      )
      const matchFaqs = section.faqs?.some(
        (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      )

      return matchTitle || matchDesc || matchSteps || matchFaqs
    })
  }, [activeTab, searchQuery])

  // สั่งพิมพ์หน้าคู่มือ (Print / Save as PDF)
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* ============================================================================== */}
      {/* 1. Header แถบนำทางด้านบน                                                        */}
      {/* ============================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
              title="กลับหน้าหลัก"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-black text-slate-900 tracking-tight block leading-tight">
                  ศูนย์รวมคู่มือการใช้งาน
                </span>
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  SCI-TECH VOICE Knowledge Base
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              title="พิมพ์หรือบันทึกเป็นไฟล์ PDF"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">พิมพ์ / บันทึก PDF</span>
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              ไปยังระบบหลัก
            </Link>
          </div>
        </div>
      </header>

      {/* ============================================================================== */}
      {/* 2. Hero Section ค้นหาและแนะนำคู่มือ                                              */}
      {/* ============================================================================== */}
      <section className="bg-gradient-to-b from-blue-900 via-slate-900 to-[#020617] text-white pt-12 pb-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden print:hidden">
        {/* Glow Background Effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>คู่มือการใช้งานระบบรับเรื่องร้องเรียน คณะวิทยาศาสตร์และเทคโนโลยี</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            เรียนรู้การใช้งานระบบ <span className="text-amber-400">SCI-TECH VOICE</span> อย่างมั่นใจ
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            คำแนะนำทีละขั้นตอนสำหรับนักศึกษา ประชาชน คณาจารย์ และเจ้าหน้าที่ เพื่อการจัดการคำร้องที่รวดเร็ว โปร่งใส และปลอดภัย
          </p>

          {/* กล่องค้นหาคู่มือแบบ Real-time */}
          <div className="max-w-2xl mx-auto pt-3">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ค้นหาเรื่องที่ต้องการ เช่น 'ส่งคำร้อง', 'ติดตามเรื่อง', 'ไม่เปิดเผยตัวตน', 'RBAC'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 rounded-2xl border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition text-sm font-sans backdrop-blur-md shadow-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg text-white transition"
                >
                  ล้างคำค้น
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================================== */}
      {/* 3. Role Filter Tabs (แถบสลับกลุ่มผู้ใช้)                                         */}
      {/* ============================================================================== */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar">
            {[
              { id: 'all', label: 'คู่มือทั้งหมด', icon: BookOpen },
              { id: 'student', label: 'นักศึกษา / บุคคลทั่วไป', icon: GraduationCap },
              { id: 'staff', label: 'อาจารย์ / เจ้าหน้าที่', icon: User },
              { id: 'admin', label: 'ผู้ดูแลระบบ (Admin)', icon: Shield },
              { id: 'faq', label: 'คำถามที่พบบ่อย (FAQ)', icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon
              const isSelected = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 4. Two-Column Layout (เมนูสารบัญซ้าย + เนื้อหาคู่มือขวา)                         */}
      {/* ============================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 📑 คอลัมน์ซ้าย: สารบัญหัวข้อ (Sticky Index Sidebar) */}
          <aside className="lg:col-span-4 sticky top-36 hidden lg:block space-y-4 print:hidden">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
                สารบัญหัวข้อคู่มือ ({filteredSections.length} หัวข้อ)
              </span>

              <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-1">
                {filteredSections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`block p-2.5 rounded-xl text-xs font-semibold transition leading-snug ${activeSectionId === sec.id
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-3 border-blue-600 pl-3'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      {sec.category}
                    </span>
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick Contact Card */}
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-3xl shadow-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">ต้องการความช่วยเหลือเพิ่มเติม?</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                หน่วยงานบริการเทคโนโลยีสารสนเทศ คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต
              </p>
              <div className="pt-1 text-[11px] text-blue-300 font-mono">
                📞 โทรศัพท์: -
              </div>
            </div>
          </aside>

          {/* 📖 คอลัมน์ขวา: รายละเอียดเนื้อหาคู่มือ (Content Section) */}
          <div className="lg:col-span-8 space-y-8">
            {filteredSections.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">
                  ไม่พบหัวข้อคู่มือที่ตรงกับคำค้นหา &quot;{searchQuery}&quot;
                </h3>
                <p className="text-xs text-slate-400">
                  ลองเปลี่ยนคำค้นหา หรือกดล้างคำค้นเพื่อดูหัวข้อคู่มือทั้งหมด
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                >
                  แสดงหัวข้อทั้งหมด
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6 scroll-mt-36"
                >
                  {/* Section Header */}
                  <div className="border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 uppercase">
                        {sec.category}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {sec.title}
                    </h2>
                    {sec.description && (
                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        {sec.description}
                      </p>
                    )}
                  </div>

                  {/* Steps (ถ้ามี) */}
                  {sec.steps && (
                    <div className="space-y-3.5">
                      {sec.steps.map((st) => (
                        <div
                          key={st.step}
                          className="flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 transition"
                        >
                          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {st.step}
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {st.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ตารางอธิบายสถานะคำร้อง (สำหรับหมวดติดตามเรื่อง) */}
                  {sec.statuses && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        ตารางความหมายของสถานะคำร้อง:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {sec.statuses.map((stat, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1"
                          >
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md inline-block border ${stat.color}`}
                            >
                              {stat.name}
                            </span>
                            <p className="text-[11px] text-slate-600 leading-normal">
                              {stat.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* รายการ FAQs (ถ้ามี) */}
                  {sec.faqs && (
                    <div className="space-y-3">
                      {sec.faqs.map((faq, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                        >
                          <div className="flex items-start gap-2">
                            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {faq.q}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                            {faq.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tips Box กล่องคำแนะนำสีฟ้า */}
                  {sec.tips && (
                    <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3 text-blue-900">
                      <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <strong className="font-bold block mb-0.5 text-blue-950">
                          คำแนะนำเพิ่มเติม (Tip):
                        </strong>
                        {sec.tips}
                      </div>
                    </div>
                  )}

                  {/* Warning Box กล่องข้อควรระวังสีเหลือง */}
                  {sec.warning && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-amber-950">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs leading-relaxed">
                        <strong className="font-bold block mb-0.5 text-amber-900">
                          ข้อควรระวัง (Caution):
                        </strong>
                        {sec.warning}
                      </div>
                    </div>
                  )}
                </section>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ============================================================================== */}
      {/* 5. Footer ปิดท้ายหน้าคู่มือ                                                     */}
      {/* ============================================================================== */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยสวนดุสิต — ระบบรับเรื่องร้องเรียน SCI-TECH VOICE</p>
          <p className="text-[11px] text-slate-400">
            เอกสารคู่มือการใช้งานเวอร์ชัน 1.2 • จัดทำเพื่อสนับสนุนการให้บริการตามมาตรฐานธรรมาภิบาล
          </p>
        </div>
      </footer>
    </div>
  )
}
