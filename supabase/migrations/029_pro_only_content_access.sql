-- Content is a Pro entitlement: Free, Trial, and Basic users cannot read
-- published exams or protected media. Lifetime and admins retain full access.

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
begin
  if uid is null then return false; end if;
  select coalesce(p.plan, 'free'), p.plan_expires_at, coalesce(p.is_admin, false), p.suspended_at
  into user_plan, plan_expires_at, user_is_admin, user_suspended_at
  from public.profiles p where p.id = uid;
  if user_suspended_at is not null then return false; end if;
  if user_is_admin or user_plan = 'lifetime' then return true; end if;
  return user_plan = 'pro'
    and (plan_expires_at is null or plan_expires_at >= now());
end;
$$;

comment on function public.can_read_published_exam(text, text) is
  'Pro/Lifetime/admin-only entitlement for published exam metadata and bodies.';
