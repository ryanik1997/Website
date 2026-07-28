/* Supabase client được inject từ apps/web — packages/db không import trực tiếp
   để tránh phụ thuộc vào env vars của app layer.
   Các repo nhận supabase client qua tham số hàm.                             */
export type { SupabaseClient } from '@supabase/supabase-js'
