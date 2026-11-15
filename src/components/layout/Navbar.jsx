'use client'

// ==============================================================================
// 🧭 แถบนำทางด้านบน (Navbar) - ปรับปรุงสิทธิ์การเข้าถึงแต่ละห้องอย่างเข้มงวด
// ==============================================================================
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ChangePasswordModal from '@/components/auth/ChangePasswordModal'
import EditProfileModal from '@/components/auth/EditProfileModal'
import {
  ShieldCheck,
  LogOut,
  User,
  LayoutDashboard,
  Wrench,
  ShieldAlert,
  KeyRound,
  UserPen,
} from 'lucide-react'

export default function Navbar({ profile }) {
  const router = useRouter()
  const supabase = createClient()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [displayName, setDisplayName] = useState(
    profile?.full_name || profile?.email?.split('@')[0] || 'ผู้ใช้งาน'
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const role = profile?.role || 'user'

  return (
    <>
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href={role === 'staff' ? '/staff' : role === 'admin' ? '/admin' : '/dashboard'}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm tracking-tight block">
                  Complaint System
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">
                  ระบบรับเรื่องร้องเรียน
                </span>
              </div>
            </Link>

            {/* 🚪 เมนูนำทางแบบแยกสิทธิ์ชัดเจน (Strict Role Separation) */}
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              
              {/* 1. เฉพาะ User ทั่วไป และ Admin เท่านั้นที่เห็นหน้าส่งเรื่อง (/dashboard) */}
              {role !== 'staff' && (
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>ส่งและติดตามเรื่อง (User)</span>
                </Link>
              )}

              {/* 2. เฉพาะ Staff และ Admin เท่านั้นที่เข้าห้องทำงานเจ้าหน้าที่ (/staff) */}
              {(role === 'staff' || role === 'admin') && (
                <Link
                  href="/staff"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 transition flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>ห้องทำงานเจ้าหน้าที่ (Staff)</span>
                </Link>
              )}

              {/* 3. เฉพาะ Admin เท่านั้นที่เข้าศูนย์ควบคุมระบบ (/admin) */}
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100/80 transition flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                  <span>ศูนย์ควบคุม (Admin)</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition"
              title="คลิกเพื่อแก้ไขชื่อ"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-slate-700 block leading-tight hover:text-blue-600">
                  {displayName}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider ${
                    role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : role === 'staff'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {role}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
              title="แก้ไขชื่อ - นามสกุล"
            >
              <UserPen className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition"
              title="เปลี่ยนรหัสผ่าน"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <EditProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentName={displayName}
        onNameUpdated={(newName) => {
          setDisplayName(newName)
          window.location.reload()
        }}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  )
}
