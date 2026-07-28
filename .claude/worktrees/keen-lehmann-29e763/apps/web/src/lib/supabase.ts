import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url  = import.meta.env.VITE_SUPABASE_URL  as string
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error('Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env.local')
}

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Supabase production redirect trả #access_token — recoverOAuthSession xử lý thủ công
    flowType: 'implicit',
    detectSessionInUrl: false,
  },
})
