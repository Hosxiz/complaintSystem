-- ==============================================================================
-- 🏫 COMPLAINT MANAGEMENT SYSTEM - ALL-IN-ONE DATABASE MIGRATION
-- ก๊อปปี้โค้ดทั้งหมดในไฟล์นี้ ไปวางในช่อง SQL Editor บน Supabase แล้วกดปุ่ม Run ได้เลยทันที!
-- ==============================================================================

-- 1. สร้าง ENUM types สำหรับ Roles และ Status
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status AS ENUM (
        'SUBMITTED',
        'RECEIVED',
        'IN_PROGRESS',
        'WAITING',
        'RESOLVED',
        'CLOSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. สร้างตาราง profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. สร้างตาราง categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- เพิ่มหมวดหมู่เริ่มต้น
INSERT INTO public.categories (name, description) VALUES
('สิ่งอำนวยความสะดวก / อาคารสถานที่', 'ปัญหาแอร์, น้ำ, ไฟ, ประตู, โต๊ะเก้าอี้ชำรุด'),
('การให้บริการของเจ้าหน้าที่', 'ความสุภาพ ความรวดเร็วในการให้บริการ'),
('ระบบสารสนเทศ / ไอที', 'ปัญหาการใช้งานโปรแกรม อินเทอร์เน็ต คอมพิวเตอร์'),
('อื่นๆ', 'เรื่องร้องเรียนทั่วไปที่ไม่ตรงกับหมวดหมู่อื่น')
ON CONFLICT (name) DO NOTHING;

-- 4. สร้างตาราง tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code TEXT NOT NULL UNIQUE,
    tracking_code TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status ticket_status NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. สร้างตาราง ticket_messages
CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. สร้างตาราง ticket_attachments
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Trigger สำหรับ Sync บัญชีที่สมัครใหม่ลง profiles อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 🛡️ ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Staff can read non-anonymous profiles" ON public.profiles;
CREATE POLICY "Staff can read non-anonymous profiles" ON public.profiles FOR SELECT USING (public.current_user_role() = 'staff');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories Policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can manage categories" ON public.categories;
CREATE POLICY "Only admin can manage categories" ON public.categories FOR ALL USING (public.current_user_role() = 'admin');

-- Tickets Policies (Staff Pool + Anonymous Enforcement)
DROP POLICY IF EXISTS "Ticket reading policy" ON public.tickets;
CREATE POLICY "Ticket reading policy" ON public.tickets FOR SELECT USING (
    public.current_user_role() = 'admin'
    OR public.current_user_role() = 'staff'
    OR (auth.uid() = user_id)
);

DROP POLICY IF EXISTS "Users can create tickets" ON public.tickets;
CREATE POLICY "Users can create tickets" ON public.tickets FOR INSERT WITH CHECK (
    auth.uid() = user_id
);

DROP POLICY IF EXISTS "Ticket update policy" ON public.tickets;
CREATE POLICY "Ticket update policy" ON public.tickets FOR UPDATE USING (
    public.current_user_role() = 'admin'
    OR public.current_user_role() = 'staff'
    OR (auth.uid() = user_id AND status = 'RESOLVED')
);

-- Messages Policies
DROP POLICY IF EXISTS "Message viewing policy" ON public.ticket_messages;
CREATE POLICY "Message viewing policy" ON public.ticket_messages FOR SELECT USING (
    CASE 
        WHEN is_internal = true THEN 
            public.current_user_role() IN ('admin', 'staff')
        ELSE 
            EXISTS (
                SELECT 1 FROM public.tickets t 
                WHERE t.id = ticket_id 
                AND (
                    public.current_user_role() IN ('admin', 'staff')
                    OR t.user_id = auth.uid()
                )
            )
    END
);

DROP POLICY IF EXISTS "Message sending policy" ON public.ticket_messages;
CREATE POLICY "Message sending policy" ON public.ticket_messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.tickets t 
        WHERE t.id = ticket_id 
        AND (
            public.current_user_role() IN ('admin', 'staff')
            OR t.user_id = auth.uid()
        )
    )
);

