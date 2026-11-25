'use client'

// ==============================================================================
// 📊 Trend Charts & Visual Analytics Component (Dashboard วิเคราะห์แนวโน้ม)
// ชาร์ตแท่งและสถิติภาพรวม: แนวโน้มตามวัน/สัปดาห์, สัดส่วนสถานะ และเรื่องร้องเรียนแยกตาม 9 สาขาวิชา
// ==============================================================================
import { useMemo } from 'react'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  GraduationCap,
  Sparkles,
  Calendar,
  Layers,
} from 'lucide-react'
import { FACULTY_MAJORS } from '@/lib/constants/majors'

export default function TrendAnalyticsSection({ tickets = [] }) {
  // 1. คำนวณแนวโน้มเรื่องร้องเรียนย้อนหลัง 7 วันล่าสุด (Daily Volume Trend)
  const last7DaysTrend = useMemo(() => {
    const days = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })

      const count = tickets.filter((t) => {
        if (!t.created_at) return false
        return t.created_at.startsWith(dateStr)
      }).length

      days.push({ dateStr, label, count })
    }

    const maxCount = Math.max(...days.map((d) => d.count), 1)
    return { days, maxCount }
  }, [tickets])

  // 2. คำนวณสัดส่วนสถานะเรื่องร้องเรียน (Status Distribution)
  const statusCounts = useMemo(() => {
    const total = tickets.length || 1
    const pending = tickets.filter((t) => ['SUBMITTED', 'RECEIVED'].includes(t.status)).length
    const inProgress = tickets.filter((t) => ['IN_PROGRESS', 'WAITING'].includes(t.status)).length
    const resolved = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status)).length

    return {
      pending: { count: pending, percent: Math.round((pending / total) * 100) },
      inProgress: { count: inProgress, percent: Math.round((inProgress / total) * 100) },
      resolved: { count: resolved, percent: Math.round((resolved / total) * 100) },
    }
  }, [tickets])

  // 3. คำนวณเรื่องร้องเรียนแยกตาม 9 สาขาวิชาของคณะวิทย์ฯ สวนดุสิต
  const majorStats = useMemo(() => {
    const stats = FACULTY_MAJORS.map((major) => {
      const count = tickets.filter((t) => {
        // ตรวจสอบจากฟิลด์ major หรือจากเนื้อหา description
        return (
          t.major === major ||
          (t.description && t.description.includes(major))
        )
      }).length

      return { major, count }
    }).sort((a, b) => b.count - a.count)

    const maxMajorCount = Math.max(...stats.map((s) => s.count), 1)
    return { stats, maxMajorCount }
  }, [tickets])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 📈 การ์ดที่ 1: กราฟแท่งแนวโน้มจำนวนเรื่องที่แจ้ง (Daily Trend Chart) */}
      <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                แนวโน้มเรื่องร้องเรียน (Daily Trend)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500">
              จำนวนเคสที่ถูกส่งเข้ามาในระบบรายวัน (ย้อนหลัง 7 วัน)
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
            รวม {tickets.length} เรื่อง
          </span>
        </div>

        {/* กราฟแท่ง CSS/SVG Responsive */}
        <div className="pt-4 pb-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2">
            {last7DaysTrend.days.map((day) => {
              const heightPercent =
                day.count > 0 ? (day.count / last7DaysTrend.maxCount) * 100 : 6
              const isToday =
                day.dateStr === new Date().toISOString().split('T')[0]

              return (
                <div
                  key={day.dateStr}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <span className="text-[11px] font-bold text-slate-600 group-hover:text-blue-600 transition">
                    {day.count}
                  </span>

                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ${
                        isToday
                          ? 'bg-gradient-to-t from-blue-600 to-sky-400 shadow-md shadow-blue-500/20'
                          : day.count > 0
                          ? 'bg-gradient-to-t from-indigo-500 to-blue-400 group-hover:from-blue-600 group-hover:to-blue-400'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  <span
                    className={`text-[10px] font-medium text-center truncate max-w-full ${
                      isToday ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* สัดส่วนสถานะ 3 สี */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 bg-amber-50/70 rounded-2xl border border-amber-100">
            <span className="text-[10px] text-amber-700 font-bold block">รอดำเนินการ</span>
            <span className="text-base font-black text-amber-900">
              {statusCounts.pending.count} ({statusCounts.pending.percent}%)
            </span>
          </div>

          <div className="p-2.5 bg-blue-50/70 rounded-2xl border border-blue-100">
            <span className="text-[10px] text-blue-700 font-bold block">กำลังตรวจสอบ/ซ่อม</span>
            <span className="text-base font-black text-blue-900">
              {statusCounts.inProgress.count} ({statusCounts.inProgress.percent}%)
            </span>
          </div>

          <div className="p-2.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <span className="text-[10px] text-emerald-700 font-bold block">แก้ไขสำเร็จแล้ว</span>
            <span className="text-base font-black text-emerald-900">
              {statusCounts.resolved.count} ({statusCounts.resolved.percent}%)
            </span>
          </div>
        </div>
      </div>

      {/* 🎓 การ์ดที่ 2: สถิติแยกตามสาขาวิชา (Complaints by Major) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3.5 flex flex-col justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              จำแนกตามสาขาวิชา
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            สัดส่วนเรื่องร้องเรียนของ 9 สาขาในคณะวิทย์ฯ
          </p>
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
          {majorStats.stats.map((item, idx) => {
            const shortName = item.major.replace('สาขาวิชา', '')
            const barWidth =
              item.count > 0 ? (item.count / majorStats.maxMajorCount) * 100 : 4

            return (
              <div key={item.major} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium truncate max-w-[190px]" title={item.major}>
                    <span className="text-[10px] text-slate-400 font-bold mr-1">#{idx + 1}</span>
                    {shortName}
                  </span>
                  <span className="font-black text-slate-900 text-[11px]">
                    {item.count} เรื่อง
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.count > 0
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        : 'bg-slate-200'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
