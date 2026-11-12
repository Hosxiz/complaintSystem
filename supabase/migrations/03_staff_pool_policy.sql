-- ==============================================================================
-- 🔄 ปรับกฎยามหน้าห้อง tickets (Staff Pool Visibility)
-- ตามที่ต้องการ: เมื่อมีคนแจ้งเรื่องเข้ามา Staff ทุกคนจะมองเห็นเคสในกองกลางได้ทันที
-- ==============================================================================

-- 1. ลบ Policy เก่าออกก่อน
DROP POLICY IF EXISTS "Ticket reading policy" ON public.tickets;

-- 2. สร้าง Policy ใหม่: ให้ Staff ทุกคนมองเห็นตั๋วทั้งหมด เพื่อช่วยกันดูและหยิบงานได้
CREATE POLICY "Ticket reading policy"
    ON public.tickets FOR SELECT
    USING (
        -- 1. ครูใหญ่ (Admin): เห็นหมดทุกตั๋ว
        public.current_user_role() = 'admin'
        
        -- 2. เจ้าหน้าที่ (Staff): มองเห็นตั๋วทั้งหมดในระบบ (เป็นกองกลาง Pool)
        OR public.current_user_role() = 'staff'
        
        -- 3. นักเรียน (User): เห็นเฉพาะตั๋วที่ตัวเองเป็นคนส่ง
        OR (auth.uid() = user_id)
    );

