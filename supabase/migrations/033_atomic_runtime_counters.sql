-- Atomic counters used by Edge Functions under concurrent requests.

create or replace function public.commit_speaking_usage(
  target_user_id uuid,
  target_conversation_id uuid,
  target_usage_date date,
  duration_seconds integer,
  daily_limit_seconds integer,
  unlimited_access boolean
)
returns table(allowed boolean, audio_seconds integer, request_count integer, total_duration integer)
language plpgsql
security definer
set search_path = ''
as $$
declare usage_row public.speaking_usage%rowtype;
declare next_total integer;
declare next_audio_seconds integer;
declare next_request_count integer;
begin
  if duration_seconds < 1 or duration_seconds > 60 then
    raise exception 'invalid duration';
  end if;

  if not exists (
    select 1 from public.speaking_conversations c
    where c.id = target_conversation_id and c.user_id = target_user_id
  ) then
    raise exception 'conversation not found';
  end if;

  insert into public.speaking_usage(user_id, usage_date)
  values (target_user_id, target_usage_date)
  on conflict (user_id, usage_date) do nothing;

  select * into usage_row
  from public.speaking_usage u
  where u.user_id = target_user_id and u.usage_date = target_usage_date
  for update;

  if not unlimited_access and usage_row.audio_seconds + duration_seconds > daily_limit_seconds then
    return query select false, usage_row.audio_seconds, usage_row.request_count,
      (select c.total_duration from public.speaking_conversations c where c.id = target_conversation_id);
    return;
  end if;

  update public.speaking_usage u
  set audio_seconds = u.audio_seconds + duration_seconds,
      request_count = u.request_count + 1
  where u.user_id = target_user_id and u.usage_date = target_usage_date
  returning u.audio_seconds, u.request_count into next_audio_seconds, next_request_count;

  update public.speaking_conversations c
  set total_duration = c.total_duration + duration_seconds
  where c.id = target_conversation_id and c.user_id = target_user_id
  returning c.total_duration into next_total;

  return query select true, next_audio_seconds, next_request_count, next_total;
end;
$$;

revoke all on function public.commit_speaking_usage(uuid,uuid,date,integer,integer,boolean)
  from public, anon, authenticated;
grant execute on function public.commit_speaking_usage(uuid,uuid,date,integer,integer,boolean)
  to service_role;

-- One atomic request replaces three COUNT(*) scans in content-sign.
create table if not exists public.content_rate_counters (
  subject_type text not null check (subject_type in ('user_hour','ip_hour','user_day')),
  subject_key text not null,
  bucket_start timestamptz not null,
  request_count integer not null default 0,
  expires_at timestamptz not null,
  primary key (subject_type, subject_key, bucket_start)
);

create index if not exists content_rate_counters_expires_idx
  on public.content_rate_counters(expires_at);

alter table public.content_rate_counters enable row level security;

create or replace function public.claim_content_rate_limit(
  target_user_id uuid,
  target_ip text,
  hourly_user_limit integer,
  hourly_ip_limit integer,
  daily_user_limit integer
)
returns table(allowed boolean, user_hour_count integer, ip_hour_count integer, user_day_count integer, denial_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare hour_bucket timestamptz := date_trunc('hour', clock_timestamp());
declare day_bucket timestamptz := date_trunc('day', clock_timestamp());
declare uh integer;
declare ih integer := 0;
declare ud integer;
begin
  insert into public.content_rate_counters(subject_type,subject_key,bucket_start,request_count,expires_at)
  values ('user_hour',target_user_id::text,hour_bucket,1,hour_bucket + interval '2 hours')
  on conflict (subject_type,subject_key,bucket_start) do update
    set request_count = public.content_rate_counters.request_count + 1
  returning request_count into uh;

  if target_ip is not null then
    insert into public.content_rate_counters(subject_type,subject_key,bucket_start,request_count,expires_at)
    values ('ip_hour',target_ip,hour_bucket,1,hour_bucket + interval '2 hours')
    on conflict (subject_type,subject_key,bucket_start) do update
      set request_count = public.content_rate_counters.request_count + 1
    returning request_count into ih;
  end if;

  insert into public.content_rate_counters(subject_type,subject_key,bucket_start,request_count,expires_at)
  values ('user_day',target_user_id::text,day_bucket,1,day_bucket + interval '2 days')
  on conflict (subject_type,subject_key,bucket_start) do update
    set request_count = public.content_rate_counters.request_count + 1
  returning request_count into ud;

  if uh > hourly_user_limit then return query select false,uh,ih,ud,'RATE_LIMIT'; return; end if;
  if target_ip is not null and ih > hourly_ip_limit then return query select false,uh,ih,ud,'RATE_LIMIT_IP'; return; end if;
  if ud > daily_user_limit then return query select false,uh,ih,ud,'RATE_LIMIT_DAILY'; return; end if;
  return query select true,uh,ih,ud,null::text;
end;
$$;

revoke all on function public.claim_content_rate_limit(uuid,text,integer,integer,integer)
  from public, anon, authenticated;
grant execute on function public.claim_content_rate_limit(uuid,text,integer,integer,integer)
  to service_role;

create or replace function public.prune_content_rate_counters()
returns void language sql security definer set search_path = ''
as $$ delete from public.content_rate_counters where expires_at < clock_timestamp(); $$;
revoke all on function public.prune_content_rate_counters() from public,anon,authenticated;
