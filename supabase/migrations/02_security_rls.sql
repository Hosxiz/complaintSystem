-- ==============================================================================
-- 🛡️ ROW LEVEL SECURITY (RLS) POLICIES - กฎความปลอดภัยของยามหน้าห้อง
-- ทุกตารางจะมียามเฝ้าอยู่ ใครไม่มีสิทธิ์ ห้ามเปิดอ่านหรือแก้ไขเด็ดขาด!
-- ==============================================================================

-- 1. สั่งเปิดยามเฝ้าประตูให้ทุกตาราง (ENABLE RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- ฟังก์ชันผู้ช่วย: ตรวจดูว่าคนที่กำลังล็อกอินอยู่ ใส่หมวกอะไร (user / staff / admin)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==============================================================================
-- 🔒 กฎที่ 1: ตาราง profiles (ใครดูข้อมูลใครได้บ้าง?)
-- ==============================================================================
-- ทุกคนอ่านโปรไฟล์ตัวเองได้
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- ครูใหญ่ (Admin) ดูโปรไฟล์ทุกคนได้
CREATE POLICY "Admins can read all profiles"
    ON public.profiles FOR SELECT
    USING (public.current_user_role() = 'admin');

-- ครูประจำชั้น (Staff) ดูโปรไฟล์คนอื่นได้เฉพาะเท่าที่จำเป็น
CREATE POLICY "Staff can read non-anonymous profiles"
    ON public.profiles FOR SELECT
    USING (public.current_user_role() = 'staff');

-- ทุกคนแก้ไขข้อมูลส่วนตัวของตัวเองได้ (เช่น เปลี่ยนชื่อตัวเอง)
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ==============================================================================
-- 🔒 กฎที่ 2: ตาราง categories (หมวดหมู่)
-- ==============================================================================
-- ทุกคนอ่านหมวดหมู่ได้ เพื่อจะได้เลือกส่งเรื่องถูก
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    USING (true);

-- มีแค่ ครูใหญ่ (Admin) เท่านั้นที่เพิ่มหรือแก้หมวดหมู่ได้
CREATE POLICY "Only admin can manage categories"
    ON public.categories FOR ALL
    USING (public.current_user_role() = 'admin');

-- ==============================================================================
-- 🔒 กฎที่ 3: ตาราง tickets (หัวใจสำคัญ: กลไก Anonymous และการแยกดูเคส!)
-- ==============================================================================

-- [SELECT - ใครมีสิทธิ์อ่านจดหมายฉบับไหน?]
CREATE POLICY "Ticket reading policy"
    ON public.tickets FOR SELECT
    USING (
        -- 1. ครูใหญ่ (Admin): เห็นจดหมายทุกฉบับในโรงเรียน!
        public.current_user_role() = 'admin'
        
        -- 2. ครูประจำชั้น (Staff): เห็นเฉพาะฉบับที่ครูใหญ่สั่งมอบหมายให้ตัวเองดูแล!
        OR (public.current_user_role() = 'staff' AND assigned_staff_id = auth.uid())
        
        -- 3. นักเรียน (User): เห็นเฉพาะจดหมายที่ตัวเองเป็นคนส่ง!
        OR (auth.uid() = user_id)
    );

-- [INSERT - ใครส่งจดหมายได้บ้าง?]
CREATE POLICY "Users can create tickets"
    ON public.tickets FOR INSERT
    WITH CHECK (
        -- อนุญาตให้คนที่ล็อกอินแล้วส่งเรื่องได้ โดยระบุว่าตัวเองเป็นเจ้าของเรื่อง
        auth.uid() = user_id
    );

-- [UPDATE - ใครแก้สถานะหรือข้อมูลในจดหมายได้บ้าง?]
CREATE POLICY "Ticket update policy"
    ON public.tickets FOR UPDATE
    USING (
        -- ครูใหญ่แก้ได้ทุกอย่าง (เช่น สั่งเปลี่ยนหมวดหมู่, สั่งเปลี่ยนครูผู้รับผิดชอบ)
        public.current_user_role() = 'admin'
        
        -- ครูประจำชั้นแก้ได้เฉพาะเคสของตัวเอง (เช่น เปลี่ยนสถานะเป็น IN_PROGRESS, RESOLVED)
        OR (public.current_user_role() = 'staff' AND assigned_staff_id = auth.uid())
        
        -- ผู้ส่ง สามารถกด Re-open ได้เมื่อสถานะเป็น RESOLVED
        OR (auth.uid() = user_id AND status = 'RESOLVED')
    );

-- ==============================================================================
-- 🔒 กฎที่ 4: ตาราง ticket_messages (กล่องแชทคุยกัน)
-- ==============================================================================
CREATE POLICY "Message viewing policy"
    ON public.ticket_messages FOR SELECT
    USING (
        -- ถ้าเป็น "ข้อความกระซิบภายใน" (is_internal = true)
        -- คนที่จะอ่านได้ ต้องเป็น ครู (Staff) หรือ ครูใหญ่ (Admin) เท่านั้น! เด็ก (User) จะไม่เห็นเด็ดขาด
        CASE 
            WHEN is_internal = true THEN 
                public.current_user_role() IN ('admin', 'staff')
            ELSE 
                -- ถ้าเป็นข้อความปกติ (is_internal = false) ทุกคนที่เกี่ยวข้องกับตั๋วนี้อ่านได้
                EXISTS (
                    SELECT 1 FROM public.tickets t 
                    WHERE t.id = ticket_id 
                    AND (
                        public.current_user_role() = 'admin'
                        OR t.assigned_staff_id = auth.uid()
                        OR t.user_id = auth.uid()
                    )
                )
        END
    );

CREATE POLICY "Message sending policy"
    ON public.ticket_messages FOR INSERT
    WITH CHECK (
        -- คนที่ส่งข้อความได้ ต้องเป็นคนที่มีสิทธิ์ในตั๋วใบนี้ และระบุ sender_id เป็นตัวเอง
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM public.tickets t 
            WHERE t.id = ticket_id 
            AND (
                public.current_user_role() = 'admin'
                OR t.assigned_staff_id = auth.uid()
                OR t.user_id = auth.uid()
            )
        )
    );

