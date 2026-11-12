'use client'

// ==============================================================================
// 👑 กล่องจัดการผู้ใช้งานและบทบาท (Admin User Management)
// ครูใหญ่สามารถเปลี่ยนหมวก (Role) ให้คนในระบบเป็น user, staff หรือ admin ได้ทันที
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Shield, Briefcase, Check, Loader2 } from 'lucide-react'

export default function UserRoleManager({ initialProfiles = [], currentAdminId }) {
  const supabase = createClient()
  const [profiles, setProfiles] = useState(initialProfiles)
  const [loadingId, setLoadingId] = useState(null)

  const handleRoleChange = async (userId, newRole) => {
    setLoadingId(userId)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, role: newRole } : p))
      )
    } catch (err) {
      alert('ไม่สามารถเปลี่ยนบทบาทได้: ' + err.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-slate-800 text-base">จัดการผู้ใช้งานและสิทธิ์ (User Roles)</h2>
          <p className="text-xs text-slate-400 mt-0.5">แต่งตั้งบทบาทเพื่อเปิดสิทธิ์เข้าถึงห้อง Staff หรือ Admin</p>
        </div>
        <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
          {profiles.length} บัญชี
        </span>
      </div>

      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
        {profiles.map((p) => {
          const isSelf = p.id === currentAdminId
          const isLoading = loadingId === p.id

          return (
            <div key={p.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                  {p.full_name?.charAt(0) || p.email?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      {p.full_name || 'ไม่ระบุชื่อ'}
                    </span>
                    {isSelf && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded font-medium">
                        บัญชีของคุณ
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block">{p.email}</span>
                </div>
              </div>

              {/* เมนูเปลี่ยนบทบาท (Role Selector) */}
              <div className="flex items-center gap-1.5">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <select
                    value={p.role}
                    disabled={isSelf}
                    onChange={(e) => handleRoleChange(p.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="user">User (ผู้ใช้ทั่วไป)</option>
                    <option value="staff">Staff (เจ้าหน้าที่)</option>
                    <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                  </select>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

