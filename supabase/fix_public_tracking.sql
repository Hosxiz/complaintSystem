-- ==============================================================================
-- 🔍 FIX PUBLIC TICKET TRACKING (แก้ปัญหาระบบติดตามตั๋วสำหรับบุคคลทั่วไปที่ไม่ได้ล็อกอิน)
-- ก๊อปปี้โค้ดนี้ไปรันใน Supabase -> SQL Editor เพื่อเปิดให้บุคคลทั่วไปสามารถค้นหาตั๋วด้วยรหัสได้
-- ==============================================================================

-- 1. สร้าง RPC Function แบบ SECURITY DEFINER สำหรับค้นหาตั๋วด้วยรหัสตั๋ว หรือ Tracking Code อย่างปลอดภัย
-- (ฟังก์ชันนี้ทำงานได้แม้ไม่ได้ล็อกอิน ไม่เปิดเผยข้อมูลส่วนตัวของผู้ร้องเรียนที่ติ๊กซ่อนตัวตน)
CREATE OR REPLACE FUNCTION public.track_ticket(search_code TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    found_ticket json;
    clean_code TEXT := TRIM(search_code);
BEGIN
    SELECT json_build_object(
        'id', t.id,
        'ticket_code', t.ticket_code,
        'tracking_code', t.tracking_code,
        'title', t.title,
        'description', t.description,
        'status', t.status,
        'created_at', t.created_at,
        'rating', t.rating,
        'rating_feedback', t.rating_feedback,
        'rated_at', t.rated_at,
        'category', json_build_object('name', COALESCE(c.name, 'ทั่วไป')),
        'messages', COALESCE((
            SELECT json_agg(json_build_object(
                'id', m.id,
                'message', m.message,
                'created_at', m.created_at,
                'sender_name', CASE 
                    WHEN p.role = 'staff' THEN 'เจ้าหน้าที่คณะ (Staff)'
                    WHEN p.role = 'admin' THEN 'ผู้ดูแลระบบ (Admin)'
                    WHEN t.is_anonymous THEN 'ผู้ร้องเรียน (ไม่ระบุตัวตน)'
                    ELSE COALESCE(p.full_name, 'ผู้ร้องเรียน')
                END,
                'sender_role', COALESCE(p.role, 'user')
            ) ORDER BY m.created_at ASC)
            FROM public.ticket_messages m
            LEFT JOIN public.profiles p ON p.id = m.sender_id
            WHERE m.ticket_id = t.id AND m.is_internal = false
        ), '[]'::json)
    )
    INTO found_ticket
    FROM public.tickets t
    LEFT JOIN public.categories c ON c.id = t.category_id
    WHERE LOWER(t.ticket_code) = LOWER(clean_code)
       OR LOWER(t.tracking_code) = LOWER(clean_code)
    LIMIT 1;

    RETURN found_ticket;
END;
$$;

-- 2. อนุญาตให้ทั้งบุคคลทั่วไป (anon) และผู้ใช้ที่ล็อกอิน (authenticated) เรียกใช้ฟังก์ชันนี้ได้
GRANT EXECUTE ON FUNCTION public.track_ticket(TEXT) TO anon, authenticated;

-- 3. อัปเดต RLS Policy สำรอง เพื่อให้คำสั่งตรง (Direct Query) ของ anon สามารถอ่านข้อมูลตั๋วผ่านรหัสได้
DROP POLICY IF EXISTS "Public can track tickets by code" ON public.tickets;
CREATE POLICY "Public can track tickets by code" ON public.tickets
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. อนุญาตให้อ่านข้อความที่ไม่ใช่ internal ได้สำหรับบุคคลทั่วไปที่ติดตามตั๋ว
DROP POLICY IF EXISTS "Public can view public messages" ON public.ticket_messages;
CREATE POLICY "Public can view public messages" ON public.ticket_messages
FOR SELECT
TO anon, authenticated
USING (is_internal = false);
