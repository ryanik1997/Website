-- =============================================================
-- Ryan English — Admin & Plan Management
-- Chạy file này trong Supabase SQL Editor
-- (profiles đã có plan + plan_expires_at từ migration 001)
-- =============================================================

-- ── 1. Thêm cột is_admin ─────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- ── 2. Helper function (tránh RLS recursion) ─────────────────
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- ── 3. Admin RLS policies ────────────────────────────────────
-- (existing "own profile" policy giữ nguyên — vẫn cover INSERT/DELETE)
-- Admin SELECT all profiles
DROP POLICY IF EXISTS "admin read all profiles" ON public.profiles;
CREATE POLICY "admin read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_current_user_admin() = true);

-- Admin UPDATE plan của bất kỳ user nào
DROP POLICY IF EXISTS "admin update plan" ON public.profiles;
CREATE POLICY "admin update plan"
  ON public.profiles FOR UPDATE
  USING (public.is_current_user_admin() = true)
  WITH CHECK (public.is_current_user_admin() = true);

-- ── 4. Thiết lập admin lần đầu ───────────────────────────────
-- Chạy tay trong Supabase SQL Editor (thay email thật vào):
--
--   UPDATE public.profiles
--   SET is_admin = true
--   WHERE email = 'your-admin@gmail.com';
--
-- Sau đó đăng xuất + đăng nhập lại để app đọc is_admin mới.
