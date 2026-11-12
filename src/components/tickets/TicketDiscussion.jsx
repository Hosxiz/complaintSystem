'use client'

// ==============================================================================
// 💬 กล่องสนทนา Dual-Channel (Public Message + Internal Note)
// ==============================================================================
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Lock, Globe, User, ShieldAlert } from 'lucide-react'

export default function TicketDiscussion({ ticketId, currentRole = 'user' }) {
  const supabase = createClient()
  const [messages, setMessages] = useState([])
  const [newText, setNewText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [loading, setLoading] = useState(false)

  // 1. ดึงข้อความทั้งหมดของตั๋วนี้
  // (Row-Level Security ใน Database จะคัดกรองให้อัตโนมัติ: ถ้าคนดูเป็น 'user' จะไม่มีทางได้ข้อความ is_internal=true ไปเลย)
  const fetchMessages = async () => {
    const { data } = await supabase
      .from('ticket_messages')
      .select(`
        id,
        message,
        is_internal,
        created_at,
        sender:profiles(full_name, role)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  useEffect(() => {
    if (ticketId) fetchMessages()
  }, [ticketId])

  // 2. ฟังก์ชันส่งข้อความ
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newText.trim()) return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('กรุณาล็อกอินก่อน')

      // ถ้าเป็นนักเรียน (user) ไม่มีสิทธิ์ส่ง internal note ให้บังคับเป็น false เสมอ
      const internalFlag = currentRole === 'user' ? false : isInternal

      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          message: newText.trim(),
          is_internal: internalFlag
        })

      if (error) throw error

      setNewText('')
      setIsInternal(false)
      fetchMessages() // โหลดข้อความใหม่มาแสดง
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการส่งข้อความ: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const isStaffOrAdmin = currentRole === 'staff' || currentRole === 'admin'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-800 text-base">การสนทนาและความคืบหน้า</h3>
        <span className="text-xs text-gray-400">ทั้งหมด {messages.length} ข้อความ</span>
      </div>

      {/* รายการข้อความ */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">ยังไม่มีข้อความสนทนาในเคสนี้</p>
        ) : (
          messages.map((msg) => {
            // ถ้าเป็นข้อความลับภายใน (Internal Note) จะแสดงเป็นกล่องสีเหลืองพร้อมไอคอนแม่กุญแจ 🔒
            if (msg.is_internal) {
              return (
                <div key={msg.id} className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    <span>บันทึกกระซิบภายใน (เห็นเฉพาะ Staff & Admin)</span>
                    <span className="text-amber-500 font-normal">โดย {msg.sender?.full_name || 'เจ้าหน้าที่'}</span>
                  </div>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">{msg.message}</p>
                </div>
              )
            }

            // ถ้าเป็นข้อความสาธารณะ (Public Message) ที่เด็กและครูคุยกัน
            return (
              <div key={msg.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-semibold text-gray-700">
                    {msg.sender?.full_name || 'ผู้ใช้งาน'} 
                    <span className="ml-1 text-[10px] font-normal px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">
                      {msg.sender?.role}
                    </span>
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
              </div>
            )
          })
        )}
      </div>

      {/* ช่องพิมพ์ข้อความ */}
      <form onSubmit={handleSendMessage} className="space-y-2 pt-2 border-t border-gray-100">
        {/* สวิตช์เลือกว่าจะกระซิบหรือพูดปกติ (เฉพาะ Staff & Admin เท่านั้นที่เห็นสวิตช์นี้!) */}
        {isStaffOrAdmin && (
          <div className="flex items-center gap-4 text-xs font-medium">
            <label className="flex items-center gap-1.5 cursor-pointer text-gray-600">
              <input
                type="radio"
                name="msgType"
                checked={!isInternal}
                onChange={() => setIsInternal(false)}
                className="text-blue-600"
              />
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>ส่งหาผู้ร้องเรียน (Public)</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-amber-800">
              <input
                type="radio"
                name="msgType"
                checked={isInternal}
                onChange={() => setIsInternal(true)}
                className="text-amber-600"
              />
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>กระซิบภายในทีม (Internal Note)</span>
            </label>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            required
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={
              isInternal
                ? '🔒 พิมพ์บันทึกปรึกษาภายในทีม (เด็กจะไม่เห็นข้อความนี้)...'
                : 'พิมพ์ข้อความตอบกลับ...'
            }
            className={`flex-1 px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
              isInternal
                ? 'border-amber-300 bg-amber-50/50 focus:ring-amber-500'
                : 'border-gray-200 focus:ring-blue-500'
            }`}
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2.5 text-white font-medium rounded-xl text-sm flex items-center gap-1.5 transition ${
              isInternal
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>ส่ง</span>
          </button>
        </div>
      </form>
    </div>
  )
}

