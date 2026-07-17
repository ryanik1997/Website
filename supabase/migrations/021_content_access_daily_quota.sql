-- =============================================================
-- Phase 2: organized crawl detection and daily access alerts.
-- =============================================================

create table if not exists public.content_security_alerts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_type text not null,
  alert_day date not null default (now() at time zone 'utc')::date,
  request_count int not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique (user_id, alert_type, alert_day)
);

create index if not exists content_security_alerts_created_idx
  on public.content_security_alerts (created_at desc);

create index if not exists content_security_alerts_open_idx
  on public.content_security_alerts (resolved_at, request_count desc);

alter table public.content_security_alerts enable row level security;

drop policy if exists "content_security_alerts admin read"
  on public.content_security_alerts;
create policy "content_security_alerts admin read"
  on public.content_security_alerts
  for select
  to authenticated
  using (public.is_current_user_admin() = true);

drop policy if exists "content_security_alerts admin update"
  on public.content_security_alerts;
create policy "content_security_alerts admin update"
  on public.content_security_alerts
  for update
  to authenticated
  using (public.is_current_user_admin() = true)
  with check (public.is_current_user_admin() = true);

-- Inserts are service-role / scheduled-job only.

create or replace function public.scan_content_access_anomalies()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer := 0;
begin
  insert into public.content_security_alerts (
    user_id,
    alert_type,
    alert_day,
    request_count,
    metadata,
    updated_at
  )
  select
    log.user_id,
    'DAILY_SIGN_VOLUME',
    (now() at time zone 'utc')::date,
    count(*)::int,
    jsonb_build_object(
      'windowHours', 24,
      'threshold', 300,
      'topPaths', (
        select jsonb_agg(path_count order by request_count desc)
        from (
          select
            inner_log.path,
            count(*)::int as request_count
          from public.content_access_log inner_log
          where inner_log.user_id = log.user_id
            and inner_log.created_at >= now() - interval '24 hours'
          group by inner_log.path
          order by count(*) desc
          limit 10
        ) path_count
      )
    ),
    now()
  from public.content_access_log log
  where log.created_at >= now() - interval '24 hours'
  group by log.user_id
  having count(*) >= 300
  on conflict (user_id, alert_type, alert_day)
  do update set
    request_count = excluded.request_count,
    metadata = excluded.metadata,
    updated_at = now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.scan_content_access_anomalies() from public;
revoke all on function public.scan_content_access_anomalies() from anon;
revoke all on function public.scan_content_access_anomalies() from authenticated;

-- Schedule hourly when pg_cron is available. Inline alerts in content-sign
-- remain the primary path, so failure to enable pg_cron does not disable quota.
do $$
declare
  existing_job bigint;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    select jobid into existing_job
    from cron.job
    where jobname = 'scan-content-access-anomalies-hourly'
    limit 1;

    if existing_job is not null then
      perform cron.unschedule(existing_job);
    end if;

    perform cron.schedule(
      'scan-content-access-anomalies-hourly',
      '7 * * * *',
      'select public.scan_content_access_anomalies();'
    );
  end if;
end;
$$;

comment on table public.content_security_alerts is
  'Security alert queue for suspicious signed-content access volume.';
