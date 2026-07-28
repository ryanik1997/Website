-- =============================================================
-- Phase 1 security hardening:
-- - Published exam rows are no longer readable by anon.
-- - Free users can read only the explicit demo papers.
-- - Paid/admin users can read the full published bank.
-- - Private exam-media bucket accepts protected PDF/SVG assets.
-- =============================================================

create or replace function public.can_read_published_exam(
  exam_id text,
  exam_skill text
)
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
  effective_plan text := 'free';
begin
  if uid is null then
    return false;
  end if;

  select
    coalesce(p.plan, 'free'),
    p.plan_expires_at,
    coalesce(p.is_admin, false)
  into user_plan, plan_expires_at, user_is_admin
  from public.profiles p
  where p.id = uid;

  if user_is_admin then
    return true;
  end if;

  effective_plan := user_plan;
  if user_plan not in ('free', 'lifetime')
     and plan_expires_at is not null
     and plan_expires_at < now() then
    effective_plan := 'free';
  end if;

  if effective_plan in ('trial', 'basic', 'pro', 'lifetime') then
    return true;
  end if;

  if exam_skill = 'reading' then
    return exam_id in (
      'catalog-reading-ket-a2-test1',
      'catalog-reading-pet-b1-test1'
    );
  end if;

  if exam_skill = 'listening' then
    return exam_id in (
      'catalog-listening-ket-a2-test1',
      'catalog-listening-pet-b1-test1'
    );
  end if;

  return false;
end;
$$;

revoke all on function public.can_read_published_exam(text, text) from public;
revoke all on function public.can_read_published_exam(text, text) from anon;
grant execute on function public.can_read_published_exam(text, text) to authenticated;

drop policy if exists "reading_exam_published public read"
  on public.reading_exam_published;
drop policy if exists "reading_exam_published authenticated read"
  on public.reading_exam_published;
create policy "reading_exam_published authenticated read"
  on public.reading_exam_published
  for select
  to authenticated
  using (public.can_read_published_exam(id, 'reading'));

drop policy if exists "listening_exam_published public read"
  on public.listening_exam_published;
drop policy if exists "listening_exam_published authenticated read"
  on public.listening_exam_published;
create policy "listening_exam_published authenticated read"
  on public.listening_exam_published
  for select
  to authenticated
  using (public.can_read_published_exam(id, 'listening'));

drop policy if exists "admin_published_modules public read"
  on public.admin_published_modules;
drop policy if exists "admin_published_modules authenticated read"
  on public.admin_published_modules;
create policy "admin_published_modules authenticated read"
  on public.admin_published_modules
  for select
  to authenticated
  using (true);

drop policy if exists "admin_publish_meta public read"
  on public.admin_publish_meta;
drop policy if exists "admin_publish_meta authenticated read"
  on public.admin_publish_meta;
create policy "admin_publish_meta authenticated read"
  on public.admin_publish_meta
  for select
  to authenticated
  using (true);

update storage.buckets
set allowed_mime_types = (
  select array_agg(distinct mime order by mime)
  from unnest(
    coalesce(allowed_mime_types, '{}'::text[])
      || array['application/pdf', 'image/svg+xml']::text[]
  ) as mime
)
where id = 'exam-media';

comment on function public.can_read_published_exam(text, text) is
  'Server-side entitlement for published exam metadata/body rows.';
