-- ==============================================================================
-- 🧹 ล้างข้อมูลทดสอบทั้งหมดใน Database (Clean Slate Reset)
-- นำโค้ดนี้ไปวางใน SQL Editor บน Supabase แล้วกดปุ่ม Run ได้เลยครับ!
-- ==============================================================================

-- 1. ลบข้อมูลแชท, ไฟล์แนบ, และเรื่องร้องเรียนทั้งหมด
TRUNCATE TABLE public.ticket_attachments CASCADE;
TRUNCATE TABLE public.ticket_messages CASCADE;
TRUNCATE TABLE public.tickets CASCADE;

-- 2. ลบผู้ใช้งานทั้งหมด (ทั้งใน profiles และ auth.users)
-- เพื่อให้คุณเริ่มสมัครสมาชิกใหม่ตั้งแต่ศูนย์
TRUNCATE TABLE public.profiles CASCADE;
DELETE FROM auth.users;

-- 3. รีเซ็ตหมวดหมู่เริ่มต้นให้สะอาดและพร้อมใช้งาน
DELETE FROM public.categories;
INSERT INTO public.categories (name, description) VALUES
('สิ่งอำนวยความสะดวก / อาคารสถานที่', 'ปัญหาแอร์, น้ำ, ไฟ, ประตู, โต๊ะเก้าอี้ชำรุด'),
('การให้บริการของเจ้าหน้าที่', 'ความสุภาพ ความรวดเร็วในการให้บริการ'),
('ระบบสารสนเทศ / ไอที', 'ปัญหาการใช้งานโปรแกรม อินเทอร์เน็ต คอมพิวเตอร์'),
('อื่นๆ', 'เรื่องร้องเรียนทั่วไปที่ไม่ตรงกับหมวดหมู่อื่น');

-- ตรวจสอบความสะอาด
SELECT count(*) AS remaining_tickets FROM public.tickets;
SELECT count(*) AS remaining_users FROM auth.users;

