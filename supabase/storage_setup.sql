-- ==============================================================================
-- 📎 สร้าง Supabase Storage Bucket สำหรับเก็บไฟล์รูปภาพหลักฐาน
-- นำโค้ดนี้ไปวางใน SQL Editor แล้วกด Run ได้เลยครับ
-- ==============================================================================

-- 1. สร้าง Bucket ชื่อ 'evidence-attachments' (แบบ Public เพื่อให้อ่านรูปได้ง่าย)
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-attachments', 'evidence-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 2. ตั้งสิทธิ์ความปลอดภัยให้ Storage: อนุญาตให้คนที่ล็อกอินแล้วอัปโหลดไฟล์ได้
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'evidence-attachments');

-- 3. อนุญาตให้ทุกคนเปิดดูรูปภาพหลักฐานได้
CREATE POLICY "Anyone can view attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'evidence-attachments');

