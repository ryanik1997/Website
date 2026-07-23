-- =============================================================
-- 013 — Lock privileged profile columns (is_admin / plan)
-- Prevents any authenticated user from self-promoting via:
--   supabase.from('profiles').update({ is_admin: true, plan: 'lifetime' })
-- Admin updates still work via is_current_user_admin().
-- Service role (auth.uid() IS NULL) allowed for backend scripts.
-- =============================================================

-- 1) Split overly broad "own profile" FOR ALL into SELECT/INSERT/UPDATE
DROP POLICY IF EXISTS "own profile" ON public.profiles;

DROP POLICY IF EXISTS "own profile select" ON public.profiles;
CREATE POLICY "own profile select"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "own profile insert" ON public.profiles;
CREATE POLICY "own profile insert"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Own-row UPDATE still allowed for display fields; trigger blocks privilege escalation.
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
CREATE POLICY "own profile update"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep admin policies from 002 (read all / update any)
-- Ensure they exist (idempotent re-create)
DROP POLICY IF EXISTS "admin read all profiles" ON public.profiles;
CREATE POLICY "admin read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_current_user_admin() = true);

DROP POLICY IF EXISTS "admin update plan" ON public.profiles;
CREATE POLICY "admin update plan"
  ON public.profiles FOR UPDATE
  USING (public.is_current_user_admin() = true)
  WITH CHECK (public.is_current_user_admin() = true);

-- 2) Hard stop on privilege column changes for non-admins
CREATE OR REPLACE FUNCTION public.protect_profile_privileges()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
     OR NEW.plan IS DISTINCT FROM OLD.plan
     OR NEW.plan_expires_at IS DISTINCT FROM OLD.plan_expires_at
  THEN
    -- Backend / service role: no JWT → auth.uid() is null
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;
    IF NOT public.is_current_user_admin() THEN
      RAISE EXCEPTION 'not allowed to change plan or admin status'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileges ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileges
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.protect_profile_privileges();
