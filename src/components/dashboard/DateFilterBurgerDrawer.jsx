'use client'

// ==============================================================================
// 🍔 Burger Menu Drawer สำหรับกรองช่วงเวลา (Date Filter Slide-over Drawer)
// แก้ไข: ใช้ React Portal เพื่อหลุดออกจาก Context ของ Header (backdrop-blur / sticky)
// และรองรับ props ทั้ง onSelectFilter, onFilterChange, customRange ได้อย่างสมบูรณ์
// ==============================================================================
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Menu,
  X,
  RotateCcw,
  CheckCircle2,
  Filter,
  ArrowRight,
} from 'lucide-react'
import { DATE_FILTER_PRESETS } from '@/lib/utils/date-filter'

export default function DateFilterBurgerDrawer({
  activeFilter = 'ALL',
  onSelectFilter,
  onFilterChange,
  customRange = {},
  onCustomRangeChange,
  totalMatching,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // ดึงค่า startDate / endDate ให้รองรับทั้งคีย์ { startDate, endDate } และ { start, end }
  const initialStart = customRange?.startDate || customRange?.start || ''
  const initialEnd = customRange?.endDate || customRange?.end || ''

  const [tempStartDate, setTempStartDate] = useState(initialStart)
  const [tempEndDate, setTempEndDate] = useState(initialEnd)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Sync เมื่อ props เปลี่ยน
  useEffect(() => {
    setTempStartDate(customRange?.startDate || customRange?.start || '')
    setTempEndDate(customRange?.endDate || customRange?.end || '')
  }, [customRange])

  // ป้องกันการ scroll ของหน้าหลังเมื่อเปิด Drawer
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const currentPreset =
    DATE_FILTER_PRESETS.find((p) => p.id === activeFilter) || DATE_FILTER_PRESETS[0]

  // จัดการเมื่อเลือก Preset
  const handleSelectPreset = (presetId) => {
    if (onSelectFilter) onSelectFilter(presetId)
    if (onFilterChange) {
      onFilterChange(presetId, {
        startDate: tempStartDate,
        endDate: tempEndDate,
        start: tempStartDate,
        end: tempEndDate,
      })
    }

    if (presetId !== 'CUSTOM') {
      setIsOpen(false)
    }
  }

  // จัดการเมื่อกดยืนยันช่วงวันที่กำหนดเอง
  const handleApplyCustom = (e) => {
    e.preventDefault()
    const rangeData = {
      startDate: tempStartDate,
      endDate: tempEndDate,
      start: tempStartDate,
      end: tempEndDate,
    }

    if (onCustomRangeChange) onCustomRangeChange(rangeData)
    if (onSelectFilter) onSelectFilter('CUSTOM')
    if (onFilterChange) onFilterChange('CUSTOM', rangeData)

    setIsOpen(false)
  }

  // รีเซ็ตตัวกรองทั้งหมด
  const handleReset = () => {
    setTempStartDate('')
    setTempEndDate('')
    const resetRange = { startDate: '', endDate: '', start: '', end: '' }
    if (onCustomRangeChange) onCustomRangeChange(resetRange)
    if (onSelectFilter) onSelectFilter('ALL')
    if (onFilterChange) onFilterChange('ALL', resetRange)
    setIsOpen(false)
  }

  // 🚪 เนื้อหา Drawer (สไลด์จากขวา)
  const drawerContent = isOpen && mounted ? (
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop สีเข้มโปร่งแสง ปิด Drawer เมื่อกดที่ว่าง */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-over Container เกาะขอบขวาเต็มความสูงจอ 100vh */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-slate-200">
        {/* Header ของ Drawer */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                กรองช่วงเวลาข้อมูล
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เลือกช่วงเวลาเพื่อวิเคราะห์และคำนวณ Dashboard
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body ของ Drawer - scroll ได้อิสระ */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white">
          {/* แถบสรุปตัวกรองปัจจุบัน */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                ตัวกรองปัจจุบัน
              </span>
              <span className="text-sm font-black text-slate-800 mt-0.5 block">
                {currentPreset.label}
              </span>
            </div>
            {totalMatching !== undefined && (
              <span className="text-xs font-black px-3 py-1.5 bg-blue-600 text-white rounded-xl shadow-xs">
                {totalMatching} เรื่อง
              </span>
            )}
          </div>

          {/* รายการ Presets ช่วงเวลา */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              เลือกช่วงเวลาสำเร็จรูป (Presets)
            </label>

            <div className="space-y-2">
              {DATE_FILTER_PRESETS.map((preset) => {
                const isSelected = activeFilter === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                    }`}
                  >
                    <div className="space-y-0.5 pr-2">
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
                      <CheckCircle2 className="w-5 h-5 text-white shrink-0 ml-2" />
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
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3.5 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  ระบุช่วงวันที่ที่ต้องการ
                </span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-md">
                  Custom
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 mb-1 block">
                    ตั้งแต่วันที่:
                  </label>
                  <input
                    type="date"
                    value={tempStartDate}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                    required
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
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>นำตัวกรองไปใช้</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer ของ Drawer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตเป็นทั้งหมด</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      {/* 🍔 ปุ่ม Hamburger Menu สำหรับเปิด Drawer ตัวกรอง */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-xs hover:shadow transition group cursor-pointer"
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

      {/* Render Drawer หลุดออกไปนอก Hierarchy ด้วย React Portal */}
      {mounted && typeof document !== 'undefined'
        ? createPortal(drawerContent, document.body)
        : null}
    </>
  )
}
