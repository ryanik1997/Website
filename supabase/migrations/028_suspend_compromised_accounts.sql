-- Immediate account suspension for suspected abuse/crawling.
-- Enforcement must be checked server-side because an already-issued JWT remains
-- cryptographically valid until it expires.

alter table public.profiles
  add column if not exists suspended_at timestamptz,
  add column if not exists suspension_reason text;

create or replace function public.is_current_user_suspended()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.suspended_at is not null
  );
$$;

revoke all on function public.is_current_user_suspended() from public;
revoke all on function public.is_current_user_suspended() from anon;
grant execute on function public.is_current_user_suspended() to authenticated;

create or replace function public.set_user_suspension(
  target_user_id uuid,
  suspended boolean,
  reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.is_current_user_admin() is distinct from true then
    raise exception 'Admin required';
  end if;
  if target_user_id = auth.uid() then
    raise exception 'Administrators cannot suspend their own account';
  end if;

  update public.profiles
  set suspended_at = case when suspended then coalesce(suspended_at, now()) else null end,
      suspension_reason = case when suspended then nullif(left(trim(reason), 500), '') else null end,
      plan = case when suspended then 'free' else plan end,
      plan_expires_at = case when suspended then null else plan_expires_at end,
      updated_at = now()
  where id = target_user_id;
  if not found then raise exception 'User profile not found'; end if;
end;
$$;

revoke all on function public.set_user_suspension(uuid, boolean, text) from public;
revoke all on function public.set_user_suspension(uuid, boolean, text) from anon;
grant execute on function public.set_user_suspension(uuid, boolean, text) to authenticated;

-- Every published-exam REST read is denied for a suspended user, including demos.
create or replace function public.can_read_published_exam(exam_id text, exam_skill text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  user_plan text := 'free';
  plan_expires_at timestamptz;
  user_is_admin boolean := false;
  user_suspended_at timestamptz;
  effective_plan text := 'free';
begin
  if uid is null then return false; end if;
  select coalesce(p.plan, 'free'), p.plan_expires_at, coalesce(p.is_admin, false), p.suspended_at
  into user_plan, plan_expires_at, user_is_admin, user_suspended_at
  from public.profiles p where p.id = uid;
  if user_suspended_at is not null then return false; end if;
  if user_is_admin then return true; end if;
  effective_plan := user_plan;
  if user_plan not in ('free', 'lifetime') and plan_expires_at is not null and plan_expires_at < now() then
    effective_plan := 'free';
  end if;
  if effective_plan in ('trial', 'basic', 'pro', 'lifetime') then return true; end if;
  if exam_skill = 'reading' then return exam_id in ('catalog-reading-ket-a2-test1', 'catalog-reading-pet-b1-test1'); end if;
  if exam_skill = 'listening' then return exam_id in ('catalog-listening-ket-a2-test1', 'catalog-listening-pet-b1-test1'); end if;
  return false;
end;
$$;

-- These metadata tables are authenticated-only. Keep suspended accounts out too.
drop policy if exists "admin_published_modules authenticated read" on public.admin_published_modules;
create policy "admin_published_modules authenticated read"
  on public.admin_published_modules for select to authenticated
  using (public.is_current_user_suspended() = false);

drop policy if exists "admin_publish_meta authenticated read" on public.admin_publish_meta;
create policy "admin_publish_meta authenticated read"
  on public.admin_publish_meta for select to authenticated
  using (public.is_current_user_suspended() = false);

comment on column public.profiles.suspended_at is
  'Set by an administrator to instantly deny protected content to an account.';
