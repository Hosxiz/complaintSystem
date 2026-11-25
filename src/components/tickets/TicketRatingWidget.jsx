'use client'

// ==============================================================================
// ⭐ คอมโพเนนต์ประเมินความพึงพอใจการให้บริการของเจ้าหน้าที่ (Ticket Rating & Feedback)
// แสดงผลเมื่อเรื่องได้รับการแก้ไขเสร็จสิ้นแล้ว (RESOLVED / CLOSED)
// ==============================================================================
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, CheckCircle2, MessageSquare, Loader2, Sparkles } from 'lucide-react'

const RATING_LABELS = {
  1: 'ต้องปรับปรุง (Poor)',
  2: 'พอใช้ (Fair)',
  3: 'ปานกลาง (Average)',
  4: 'ดีมาก (Very Good)',
  5: 'ยอดเยี่ยม ประทับใจมาก (Excellent)',
}

export default function TicketRatingWidget({ ticket, onRated }) {
  const supabase = createClient()

  const [rating, setRating] = useState(ticket?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [feedback, setFeedback] = useState(ticket?.rating_feedback || '')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(!!ticket?.rating)

  // ถ้าเคสยังไม่เสร็จ (ไม่ใช่ RESOLVED หรือ CLOSED) ไม่ต้องแสดง
  if (!['RESOLVED', 'CLOSED'].includes(ticket?.status)) {
    return null
  }

  // หากได้รับการประเมินแล้ว แสดงผลคะแนนที่เคยให้ไว้
  if (success || ticket?.rating) {
    const currentScore = ticket?.rating || rating
    return (
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>ขอบคุณสำหรับการประเมินความพึงพอใจ</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= currentScore
                    ? 'text-amber-500 fill-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-amber-800 ml-1">
              {currentScore}/5
            </span>
          </div>
        </div>

        {(ticket?.rating_feedback || feedback) && (
          <div className="p-2.5 bg-white/80 rounded-xl border border-amber-100 text-xs text-slate-600 italic">
            "{ticket?.rating_feedback || feedback}"
          </div>
        )}
      </div>
    )
  }

  const handleSubmitRating = async (e) => {
    e.preventDefault()
    if (!rating) {
      setErrorMsg('กรุณาเลือกจำนวนดาวที่พึงพอใจ (1 - 5 ดาว)')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      // 1. ลองเรียกใช้ RPC Function เพื่อความปลอดภัยและรองรับการติดตามแบบ Guest
      let updated = null
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'submit_ticket_rating',
        {
          target_ticket_id: ticket.id,
          rating_score: rating,
          feedback_text: feedback.trim(),
        }
      )

      if (!rpcError && rpcData) {
        updated = rpcData
      } else {
        // Fallback อัปเดตโดยตรงลงตาราง tickets
        const { data: directData, error: directError } = await supabase
          .from('tickets')
          .update({
            rating: rating,
            rating_feedback: feedback.trim(),
            rated_at: new Date().toISOString(),
          })
          .eq('id', ticket.id)
          .select()
          .single()

        if (directError) throw directError
        updated = directData
      }

      setSuccess(true)
      if (onRated && updated) {
        onRated({
          ...ticket,
          rating,
          rating_feedback: feedback.trim(),
          rated_at: new Date().toISOString(),
        })
      }
    } catch (err) {
      setErrorMsg(err.message || 'ไม่สามารถบันทึกการประเมินได้')
    } finally {
      setLoading(false)
    }
  }

  const activeStar = hoverRating || rating

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 rounded-2xl border border-amber-200/90 shadow-sm space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="font-extrabold text-xs text-slate-800">
              ประเมินความพึงพอใจการให้บริการของเจ้าหน้าที่
            </h4>
          </div>
          <p className="text-[11px] text-slate-500">
            คำร้องของคุณได้รับการแก้ไขเรียบร้อยแล้ว ให้คะแนนเพื่อพัฒนาการให้บริการ
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
          เคสเสร็จสิ้น
        </span>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitRating} className="space-y-3">
        {/* ดาว 5 ดวง */}
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-100 shadow-inner space-y-1.5">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                    star <= activeStar
                      ? 'text-amber-500 fill-amber-400 drop-shadow-sm'
                      : 'text-slate-200 hover:text-amber-300'
                  }`}
                />
              </button>
            ))}
          </div>

          <span className="text-xs font-semibold text-amber-800 h-4">
            {activeStar ? RATING_LABELS[activeStar] : 'คลิกเลือกจำนวนดาว (1-5 ดาว)'}
          </span>
        </div>

        {/* กล่องข้อเสนอแนะเพิ่มเติม */}
        <div>
          <div className="flex items-center gap-1 mb-1 text-[11px] font-semibold text-slate-600">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>ข้อคิดเห็นหรือคำติชมเพิ่มเติม (ถ้ามี)</span>
          </div>
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="เช่น เจ้าหน้าที่แก้ไขรวดเร็วมาก, สุภาพเรียบร้อย, ขอบคุณครับ..."
            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !rating}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-amber-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>กำลังบันทึกคะแนน...</span>
            </>
          ) : (
            <span>ส่งคะแนนความพึงพอใจ ⭐</span>
          )}
        </button>
      </form>
    </div>
  )
}
