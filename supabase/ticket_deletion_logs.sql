-- ==============================================================================
-- 🗑️ ตารางบันทึกประวัติการลบคำร้องเรียน (Ticket Deletion Audit Logs)
-- บันทึกข้อมูลว่าใครเป็นคนลบ, ลบตั๋วไหน, หมวดหมู่ใด, เมื่อไหร่ และเพราะอะไร
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ticket_deletion_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID,
    ticket_code TEXT NOT NULL,
    title TEXT NOT NULL,
    category_name TEXT,
    deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    deleted_by_name TEXT NOT NULL,
    reason TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- เปิดใช้งาน Row Level Security (RLS) เพื่อความปลอดภัยสูงสุด
ALTER TABLE public.ticket_deletion_logs ENABLE ROW LEVEL SECURITY;

-- นโยบาย: เฉพาะ Staff และ Admin เท่านั้นที่มีสิทธิ์ดูประวัติการลบ
CREATE POLICY "Staff and admin can view deletion logs"
ON public.ticket_deletion_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
);

-- นโยบาย: เฉพาะ Staff และ Admin เท่านั้นที่มีสิทธิ์บันทึกประวัติการลบ
CREATE POLICY "Staff and admin can insert deletion logs"
ON public.ticket_deletion_logs FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
);
