'use client'

// ==============================================================================
// 🍔 Burger Menu Drawer สำหรับกรองช่วงเวลา (Date Filter Slide-over Drawer)
// ออกแบบตาม Option A: เมนู 3 ขีด สไลด์ออกมาด้านข้าง ไม่เกะกะหน้าจอหลัก
// ==============================================================================
import { useState } from 'react'
import {
  Menu,
  X,
  Calendar,
  Clock,
  RotateCcw,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { DATE_FILTER_PRESETS } from '@/lib/utils/date-filter'

export default function DateFilterBurgerDrawer({
  activeFilter = 'ALL',
  customRange = { startDate: '', endDate: '' },
  onFilterChange,
  totalMatching = 0,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(customRange.startDate || '')
  const [tempEndDate, setTempEndDate] = useState(customRange.endDate || '')

  const currentPreset =
    DATE_FILTER_PRESETS.find((p) => p.id === activeFilter) || DATE_FILTER_PRESETS[0]

  const handleSelectPreset = (presetId) => {
    if (presetId === 'CUSTOM') {
      onFilterChange('CUSTOM', {
        startDate: tempStartDate,
        endDate: tempEndDate,
      })
    } else {
      onFilterChange(presetId, { startDate: '', endDate: '' })
      setIsOpen(false)
    }
  }

  const handleApplyCustom = (e) => {
    e.preventDefault()
    onFilterChange('CUSTOM', {
      startDate: tempStartDate,
      endDate: tempEndDate,
    })
    setIsOpen(false)
  }

  const handleReset = () => {
    setTempStartDate('')
    setTempEndDate('')
    onFilterChange('ALL', { startDate: '', endDate: '' })
    setIsOpen(false)
  }

  return (
    <>
      {/* 🍔 ปุ่ม Hamburger Menu สำหรับเปิด Drawer ตัวกรอง */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-sm hover:shadow transition group"
        title="คลิกเพื่อเปิดเมนูกรองช่วงเวลา (Date Filter)"
      >
        <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Menu className="w-4 h-4" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-none">
            ช่วงเวลา
          </span>
          <span className="text-xs font-bold text-slate-800 block mt-0.5">
            {currentPreset.label.split(' ')[0]}
          </span>
        </div>
        {activeFilter !== 'ALL' && (
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse ml-0.5" />
        )}
      </button>

      {/* 🚪 Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-slate-200/80">
            {/* Header ของ Drawer */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    กรองช่วงเวลาข้อมูล
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    เลือกช่วงเวลาเพื่อวิเคราะห์และคำนวณ Dashboard
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition shadow-sm hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* บอดี้ของ Drawer */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* สรุปข้อมูลที่กรองได้ */}
              <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-blue-700 font-semibold block">
                    ตัวกรองปัจจุบัน:
                  </span>
                  <span className="text-xs font-bold text-blue-900">
                    {currentPreset.label}
                  </span>
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-white text-blue-600 rounded-xl shadow-sm border border-blue-200">
                  {totalMatching} เรื่อง
                </span>
              </div>

              {/* รายการ Presets ช่วงเวลา */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  เลือกช่วงเวลาสำเร็จรูป (Presets)
                </label>

                <div className="space-y-1.5">
                  {DATE_FILTER_PRESETS.map((preset) => {
                    const isSelected = activeFilter === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.id)}
                        className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span
                            className={`text-xs font-bold block ${
                              isSelected ? 'text-white' : 'text-slate-800'
                            }`}
                          >
                            {preset.label}
                          </span>
                          <span
                            className={`text-[11px] block ${
                              isSelected ? 'text-blue-100' : 'text-slate-400'
                            }`}
                          >
                            {preset.desc}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-2" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ฟอร์มเลือกวันที่เอง (Custom Date Range) */}
              {activeFilter === 'CUSTOM' && (
                <form
                  onSubmit={handleApplyCustom}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 animate-in fade-in duration-200"
                >
                  <span className="text-xs font-bold text-slate-800 block">
                    ระบุช่วงวันที่ที่ต้องการ
                  </span>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                        ตั้งแต่วันที่:
                      </label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                        ถึงวันที่:
                      </label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>นำตัวกรองไปใช้</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Footer ของ Drawer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตเป็นทั้งหมด</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
