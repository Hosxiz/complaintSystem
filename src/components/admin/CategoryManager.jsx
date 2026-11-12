'use client'

// ==============================================================================
// 🏷️ กล่องจัดการหมวดหมู่เรื่องร้องเรียนสำหรับ Admin (เพิ่ม / แก้ไข / ลบหมวดหมู่)
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Tags, Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react'

export default function CategoryManager({ initialCategories = [] }) {
  const supabase = createClient()
  const [categories, setCategories] = useState(initialCategories)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: newName.trim(),
          description: newDesc.trim(),
        })
        .select()
        .single()

      if (error) throw error

      setCategories((prev) => [...prev, data])
      setNewName('')
      setNewDesc('')
    } catch (err) {
      alert('ไม่สามารถเพิ่มหมวดหมู่ได้: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?')) return

    setDeletingId(id)
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      alert('ไม่สามารถลบหมวดหมู่ได้: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-slate-800 text-base">จัดการหมวดหมู่เรื่องร้องเรียน (Category Manager)</h2>
          <p className="text-xs text-slate-400 mt-0.5">เพิ่ม หรือลบหมวดหมู่ปัญหาเพื่อให้ผู้ใช้เลือกได้ถูกต้อง</p>
        </div>
        <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-semibold">
          {categories.length} หมวดหมู่
        </span>
      </div>

      {/* ฟอร์มเพิ่มหมวดหมู่ใหม่ */}
      <form onSubmit={handleAddCategory} className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อหมวดหมู่ใหม่ *</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="เช่น อาคารสถานที่, ปัญหาด้านการเงิน"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">คำอธิบายหมวดหมู่</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="อธิบายสั้นๆ เกี่ยวกับปัญหาในหมวดนี้..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          <span>เพิ่มหมวดหมู่</span>
        </button>
      </form>

      {/* รายการหมวดหมู่ปัจจุบัน */}
      <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
        {categories.map((c) => (
          <div key={c.id} className="py-3 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-800 block">{c.name}</span>
              <span className="text-[11px] text-slate-400 block">{c.description || 'ไม่มีคำอธิบาย'}</span>
            </div>

            <button
              onClick={() => handleDeleteCategory(c.id)}
              disabled={deletingId === c.id}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
              title="ลบหมวดหมู่"
            >
              {deletingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

