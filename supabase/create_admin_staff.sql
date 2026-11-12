-- ==============================================================================
-- 👑 สคริปต์เสกบัญชี ADMIN และ STAFF
-- นำโค้ดนี้ไปวางใน SQL Editor บน Supabase แล้วกดปุ่ม Run ได้เลยทันที!
-- ==============================================================================

-- 1. เสกบัญชี ADMIN (ครูใหญ่)
-- Email: admin@school.com
-- Password: password123
DO $$
DECLARE
    new_admin_id UUID := gen_random_uuid();
BEGIN
    -- สร้างบัญชีใน auth.users ถ้ายังไม่มี
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@school.com') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            new_admin_id,
            '00000000-0000-0000-0000-000000000000',
            'admin@school.com',
            crypt('password123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"อาจารย์ใหญ่ สมศักดิ์ (Admin)"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        );

        -- อัปเดตหมวกใน profiles ให้เป็น 'admin' ทันที
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (new_admin_id, 'admin@school.com', 'อาจารย์ใหญ่ สมศักดิ์ (Admin)', 'admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'อาจารย์ใหญ่ สมศักดิ์ (Admin)';
    ELSE
        -- ถ้ามีอีเมลนี้อยู่แล้ว ให้อัปเกรดเป็น admin ทันที
        UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@school.com';
    END IF;
END $$;

-- 2. เสกบัญชี STAFF (คุณครูช่าง)
-- Email: staff@school.com
-- Password: password123
DO $$
DECLARE
    new_staff_id UUID := gen_random_uuid();
BEGIN
    -- สร้างบัญชีใน auth.users ถ้ายังไม่มี
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'staff@school.com') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            aud
        ) VALUES (
            new_staff_id,
            '00000000-0000-0000-0000-000000000000',
            'staff@school.com',
            crypt('password123', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"full_name":"อาจารย์ช่าง มานะ (Staff)"}',
            now(),
            now(),
            'authenticated',
            'authenticated'
        );

        -- อัปเดตหมวกใน profiles ให้เป็น 'staff' ทันที
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (new_staff_id, 'staff@school.com', 'อาจารย์ช่าง มานะ (Staff)', 'staff')
        ON CONFLICT (id) DO UPDATE SET role = 'staff', full_name = 'อาจารย์ช่าง มานะ (Staff)';
    ELSE
        -- ถ้ามีอีเมลนี้อยู่แล้ว ให้อัปเกรดเป็น staff ทันที
        UPDATE public.profiles SET role = 'staff' WHERE email = 'staff@school.com';
    END IF;
END $$;

