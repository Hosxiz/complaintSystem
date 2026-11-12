// ==============================================================================
// 💂‍♂️ ยามเฝ้าประตู (Middleware) - แยกสิทธิ์เด็ดขาดระหว่าง Staff และ User
// ==============================================================================
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id') || supabaseUrl.includes('placeholder')) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const currentPath = request.nextUrl.pathname

  const isProtectedRoute =
    currentPath.startsWith('/dashboard') ||
    currentPath.startsWith('/staff') ||
    currentPath.startsWith('/admin')

  // ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 🚪 กฎการแยกห้องตามบทบาทอย่างเข้มงวด:
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'user'

    // 1. ถ้าเป็น User ธรรมดา -> ห้ามเข้า /staff หรือ /admin เด็ดขาด (ดีดกลับไป /dashboard)
    if (userRole === 'user' && (currentPath.startsWith('/admin') || currentPath.startsWith('/staff'))) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // 2. ถ้าเป็น Staff -> ให้ทำงานเฉพาะใน /staff เท่านั้น! ห้ามแอบเข้า /admin หรือ /dashboard
    if (userRole === 'staff') {
      if (currentPath.startsWith('/admin') || currentPath.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/staff'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
