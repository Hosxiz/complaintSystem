-- ==============================================================================
-- 👑 อัปเกรดบัญชีคุณ พีรณัฐ ให้เป็น ADMIN สูงสุดทันที!
-- นำโค้ดนี้ไปวางใน SQL Editor แล้วกด Run ได้เลยครับ
-- ==============================================================================

UPDATE public.profiles
SET role = 'admin'
WHERE email = (SELECT email FROM auth.users ORDER BY created_at ASC LIMIT 1);

-- ตรวจสอบผลลัพธ์
SELECT email, full_name, role FROM public.profiles;

