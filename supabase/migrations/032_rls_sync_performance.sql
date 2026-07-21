-- RLS performance pass: cache stable JWT helpers as init plans, scope policies
-- to authenticated, and keep explicit own-row predicates index-friendly.

create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce((
    select p.is_admin from public.profiles p where p.id = (select auth.uid())
  ), false);
$$;

create or replace function public.can_access_published_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select p.suspended_at is null
      and (
        p.is_admin
        or p.plan = 'lifetime'
        or (p.plan = 'pro' and (p.plan_expires_at is null or p.plan_expires_at >= now()))
      )
    from public.profiles p
    where p.id = (select auth.uid())
  ), false);
$$;

revoke all on function public.can_access_published_content() from public, anon;
grant execute on function public.can_access_published_content() to authenticated;

drop policy if exists "reading_exam_published authenticated read" on public.reading_exam_published;
create policy "reading_exam_published authenticated read"
  on public.reading_exam_published for select to authenticated
  using ((select public.can_access_published_content()));

drop policy if exists "listening_exam_published authenticated read" on public.listening_exam_published;
create policy "listening_exam_published authenticated read"
  on public.listening_exam_published for select to authenticated
  using ((select public.can_access_published_content()));

do $policies$
declare table_name text;
begin
  foreach table_name in array array[
    'decks','cards','srs','writing_docs','ai_usage','mindmaps','exam_progress','checkin_days'
  ]  loop
    execute format('drop policy if exists %I on public.%I', 'own ' || table_name, table_name);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      'own ' || table_name,
      table_name
    );
  end loop;
end
$policies$;

drop policy if exists "own_read" on public.payment_requests;
create policy "own_read" on public.payment_requests for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "content_access_log own read" on public.content_access_log;
create policy "content_access_log own read" on public.content_access_log for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "speaking conversations own read" on public.speaking_conversations;
create policy "speaking conversations own read" on public.speaking_conversations for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "speaking conversations own delete" on public.speaking_conversations;
create policy "speaking conversations own delete" on public.speaking_conversations for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "speaking usage own read" on public.speaking_usage;
create policy "speaking usage own read" on public.speaking_usage for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "speaking messages own read" on public.speaking_messages;
create policy "speaking messages own read" on public.speaking_messages for select to authenticated
  using (exists (
    select 1 from public.speaking_conversations c
    where c.id = conversation_id and c.user_id = (select auth.uid())
  ));

-- Remove the overlapping broad profile policy left by migration 015.
drop policy if exists "own profile" on public.profiles;
drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile select" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "own profile insert" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "own profile update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "admin read all profiles" on public.profiles;
create policy "admin read all profiles" on public.profiles for select to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "admin update plan" on public.profiles;
create policy "admin update plan" on public.profiles for update to authenticated
  using ((select public.is_current_user_admin()))
  with check ((select public.is_current_user_admin()));
