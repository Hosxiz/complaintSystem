-- ==============================================================================
-- 🏫 COMPLAINT MANAGEMENT SYSTEM - DATABASE SCHEMA (STEP 1)
-- ภาษาเข้าใจง่าย สำหรับการเรียนรู้และนำไปใช้งานจริงบน Supabase (PostgreSQL)
-- ==============================================================================

-- 1. สร้างประเภทของ "หมวก" (Roles) ที่คนในระบบจะใส่ได้
-- มี 3 ระดับ: user (นักเรียน), staff (ครูผู้ซ่อม), admin (ครูใหญ่)
CREATE TYPE user_role AS ENUM ('user', 'staff', 'admin');

-- 2. สร้างขั้นตอนของ "จดหมาย" (Ticket Status Lifecycle)
-- ส่งมา -> รับเรื่อง -> กำลังทำ <-> รอข้อมูลเพิ่ม -> แก้เสร็จแล้ว -> ปิดเคส
CREATE TYPE ticket_status AS ENUM (
    'SUBMITTED',     -- 1. เด็กส่งจดหมายมาใหม่ๆ
    'RECEIVED',      -- 2. ครูใหญ่หยิบขึ้นมาอ่านแล้ว
    'IN_PROGRESS',   -- 3. มอบหมายครูไปเริ่มซ่อมแล้ว
    'WAITING',       -- 4. ครูอยากถามข้อมูลเพิ่ม เลยตั้งป้าย "รอคำตอบ"
    'RESOLVED',      -- 5. ซ่อมเสร็จเรียบร้อย!
    'CLOSED'         -- 6. ปิดเคสเก็บเข้าแฟ้มถาวร
);

-- ==============================================================================
-- 📋 ตารางที่ 1: profiles (สมุดบันทึกรายชื่อคนในโรงเรียน)
-- ==============================================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    -- 💡 ปลอดภัยที่สุด: ค่าเริ่มต้น (DEFAULT) ทุกคนจะได้หมวก 'user' เสมอ!
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 🗂️ ตารางที่ 2: categories (กล่องจัดหมวดหมู่เรื่องร้องเรียน)
-- เช่น: อุปกรณ์ชำรุด, พฤติกรรม, ความสะอาด, อื่นๆ
-- ==============================================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- เพิ่มหมวดหมู่เริ่มต้นไว้ให้ใช้งาน
INSERT INTO public.categories (name, description) VALUES
('สิ่งอำนวยความสะดวก / อาคารสถานที่', 'ปัญหาแอร์, น้ำ, ไฟ, ประตู, โต๊ะเก้าอี้ชำรุด'),
('การให้บริการของเจ้าหน้าที่', 'ความสุภาพ ความรวดเร็วในการให้บริการ'),
('ระบบสารสนเทศ / ไอที', 'ปัญหาการใช้งานโปรแกรม อินเทอร์เน็ต คอมพิวเตอร์'),
('อื่นๆ', 'เรื่องร้องเรียนทั่วไปที่ไม่ตรงกับหมวดหมู่อื่น');

-- ==============================================================================
-- ✉️ ตารางที่ 3: tickets (กล่องใส่จดหมายเรื่องร้องเรียน)
-- ==============================================================================
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- รหัสจดหมายอ่านง่าย เช่น TK-2026-0001 (สำหรับเรียกเคส)
    ticket_code TEXT NOT NULL UNIQUE,
    
    -- กุญแจลับเฉพาะตัว (Tracking Code) ไว้ให้ User เอาไว้เปิดเช็กสถานะโดยไม่ต้องล็อกอินก็ได้
    tracking_code TEXT NOT NULL UNIQUE,
    
    -- ใครเป็นคนส่ง (ชี้ไปยังสมุด profiles)
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- ครูคนไหนได้รับมอบหมายให้ดูแลเคสนี้ (ถ้ายังไม่มีครูดูแล ค่าจะเป็น NULL)
    assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- หมวดหมู่เรื่องร้องเรียน
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    
    -- ข้อมูลที่ผู้ใช้กรอก
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- 🥷 กล่องล่องหน (Anonymous): ถ้าติ๊ก TRUE เมื่อไหร่ ครูประจำชั้น (Staff) จะมองไม่เห็นชื่อ User!
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- สถานะปัจจุบันของเรื่อง
    status ticket_status NOT NULL DEFAULT 'SUBMITTED',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 💬 ตารางที่ 4: ticket_messages (กล่องข้อความพูดคุยในแต่ละเคส)
-- ==============================================================================
CREATE TABLE public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    
    -- 🤫 ข้อความกระซิบภายใน (Internal Note):
    -- ถ้า TRUE แปลว่ามีแค่ "ครูประจำชั้น + ครูใหญ่" ที่เห็น (User จะไม่เห็นข้อความนี้!)
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 📎 ตารางที่ 5: ticket_attachments (รูปภาพหรือไฟล์หลักฐานที่แนบมา)
-- ==============================================================================
CREATE TABLE public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ⚡ ฟังก์ชันอัตโนมัติ: เมื่อมีคนสมัครสมาชิก ให้สร้าง profile เป็น 'user' ทันที
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'user' -- หมวกนักเรียนเสมอ ปลอดภัย 100%!
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ตั้งสวิตช์จับความเคลื่อนไหว (Trigger): เมื่อเกิดผู้ใช้ใหม่ใน auth.users -> ให้ทำงานทันที
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

