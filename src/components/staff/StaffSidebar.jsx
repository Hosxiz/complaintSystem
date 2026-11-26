'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard,
  BarChart3,
  Kanban,
  FileSpreadsheet,
  History,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Shield,
  Sparkles,
} from 'lucide-react'

export default function StaffSidebar({
  activeNav = 'dashboard', // 'dashboard' | 'analytics' | 'tickets'
  onSelectNav,
  onExportCsv,
  onOpenHistory,
  mobileOpen = false,
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  pendingCount = 0,
  totalCount = 0,
  staffProfile,
  onOpenProfile,
  onOpenPassword,
  onSignOut,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 shadow-sm flex flex-col transition-all duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[76px]' : 'lg:w-64'}
          w-72
        `}
      >
        {/* 1. Header with Logo & Collapse Toggle */}
        <div className="h-18 px-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-amber-50/80 border border-amber-200/60 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/logo.png"
                alt="SCI-TECH Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-slate-900 tracking-tight block truncate">
                    SCI-TECH VOICE
                  </span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Staff Portal
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle (< / >) */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'ขยายแถบเมนู' : 'พับแถบเมนู'}
            className="hidden lg:flex w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 items-center justify-center transition shadow-xs"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Group 1: OVERVIEW */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 mb-2 text-[11px] font-black tracking-wider text-slate-400 uppercase">
                Overview (ภาพรวม)
              </div>
            ) : (
              <div className="w-6 h-0.5 bg-slate-200 mx-auto mb-3" />
            )}

            <nav className="space-y-1">
              {/* Dashboard */}
              <button
                onClick={() => {
                  onSelectNav('dashboard')
                  onCloseMobile?.()
                }}
                title={isCollapsed ? 'ภาพรวมระบบ (Dashboard)' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeNav === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>ภาพรวมระบบ (Dashboard)</span>}
              </button>

              {/* Analytics */}
              <button
                onClick={() => {
                  onSelectNav('analytics')
                  onCloseMobile?.()
                }}
                title={isCollapsed ? 'สถิติและแนวโน้ม (Analytics)' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeNav === 'analytics'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>สถิติและแนวโน้ม (Analytics)</span>}
              </button>

              {/* Tickets / Kanban */}
              <button
                onClick={() => {
                  onSelectNav('tickets')
                  onCloseMobile?.()
                }}
                title={isCollapsed ? 'กระดานจัดการคำร้อง (Tickets)' : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeNav === 'tickets'
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Kanban className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">จัดการคำร้อง (Tickets)</span>}
                </div>
                {!isCollapsed && pendingCount > 0 && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      activeNav === 'tickets'
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Group 2: MANAGEMENT */}
          <div>
            {!isCollapsed ? (
              <div className="px-3 mb-2 text-[11px] font-black tracking-wider text-slate-400 uppercase">
                Management (การจัดการ)
              </div>
            ) : (
              <div className="w-6 h-0.5 bg-slate-200 mx-auto mb-3" />
            )}

            <nav className="space-y-1">
              {/* Export CSV */}
              <button
                onClick={() => {
                  onExportCsv?.()
                  onCloseMobile?.()
                }}
                title={isCollapsed ? 'ส่งออกรายงาน (CSV)' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-600" />
                {!isCollapsed && <span>ส่งออกรายงาน (Export CSV)</span>}
              </button>

              {/* Audit Logs */}
              <button
                onClick={() => {
                  onOpenHistory?.()
                  onCloseMobile?.()
                }}
                title={isCollapsed ? 'ประวัติการลบคำร้อง (Audit Logs)' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <History className="w-4 h-4 shrink-0 text-slate-500" />
                {!isCollapsed && <span>ประวัติการลบ (Audit Logs)</span>}
              </button>

              {/* Admin Link if Admin */}
              {staffProfile?.role === 'admin' && (
                <Link
                  href="/admin"
                  title={isCollapsed ? 'ไปศูนย์ควบคุม Admin' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>ศูนย์ควบคุม Admin</span>}
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* 3. Footer Links & User Profile */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* Staff Profile Card */}
          <div
            className={`flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/60 ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {staffProfile?.full_name?.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {staffProfile?.full_name || 'เจ้าหน้าที่'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block truncate">
                  ● {staffProfile?.role === 'admin' ? 'Admin / Staff' : 'Staff Member'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              title={isCollapsed ? 'กลับหน้าหลัก' : undefined}
              className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>หน้าหลัก</span>}
            </Link>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="ออกจากระบบ"
                className="w-8 h-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
