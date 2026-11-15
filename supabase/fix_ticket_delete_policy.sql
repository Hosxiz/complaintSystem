-- ==============================================================================
-- 🛡️ สคริปต์แก้ปัญหาระบบลบคำร้อง (Fix Ticket Deletion Policy for Staff & Admin)
-- ก๊อปปี้โค้ดนี้ไปรันใน Supabase -> SQL Editor เพื่อเปิดสิทธิ์การลบคำร้องได้จริง
-- ==============================================================================

-- 1. อนุญาตให้ Staff และ Admin สามารถ DELETE ข้อมูลจากตาราง tickets ได้
DROP POLICY IF EXISTS "Staff and admin can delete tickets" ON public.tickets;

CREATE POLICY "Staff and admin can delete tickets"
ON public.tickets FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
);

-- 2. สร้างตารางบันทึกประวัติการลบ (หากยังไม่มี) พร้อมสิทธิ์ RLS
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

ALTER TABLE public.ticket_deletion_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff and admin can view deletion logs" ON public.ticket_deletion_logs;
CREATE POLICY "Staff and admin can view deletion logs"
ON public.ticket_deletion_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
);

DROP POLICY IF EXISTS "Staff and admin can insert deletion logs" ON public.ticket_deletion_logs;
CREATE POLICY "Staff and admin can insert deletion logs"
ON public.ticket_deletion_logs FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
);
