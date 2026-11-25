-- ==============================================================================
-- ⭐ สคริปต์เพิ่มระบบประเมินความพึงพอใจการให้บริการ (Ticket Rating & Feedback)
-- ก๊อปปี้ไปรันใน Supabase -> SQL Editor เพื่อรองรับระบบคะแนน 1 - 5 ดาว
-- ==============================================================================

-- 1. เพิ่มคอลัมน์ rating, rating_feedback, rated_at ในตาราง tickets
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS rating INT CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS rating_feedback TEXT,
ADD COLUMN IF NOT EXISTS rated_at TIMESTAMPTZ;

-- 2. สร้าง RPC Function สำหรับบันทึกคะแนนความพึงพอใจอย่างปลอดภัย (รองรับทั้ง User และ Guest Tracking)
CREATE OR REPLACE FUNCTION public.submit_ticket_rating(
    target_ticket_id UUID,
    rating_score INT,
    feedback_text TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
    updated_ticket public.tickets%ROWTYPE;
BEGIN
    IF rating_score < 1 OR rating_score > 5 THEN
        RAISE EXCEPTION 'Rating must be between 1 and 5';
    END IF;

    UPDATE public.tickets
    SET 
        rating = rating_score,
        rating_feedback = feedback_text,
        rated_at = timezone('utc'::text, now())
    WHERE id = target_ticket_id AND status IN ('RESOLVED', 'CLOSED')
    RETURNING * INTO updated_ticket;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ticket not found or status is not resolved';
    END IF;

    RETURN row_to_json(updated_ticket);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
