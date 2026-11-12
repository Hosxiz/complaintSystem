// ==============================================================================
// ☎️ สายโทรศัพท์ที่ 1: Client สำหรับหน้าเว็บฝั่งเบราว์เซอร์ (Browser Client)
// ==============================================================================
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
