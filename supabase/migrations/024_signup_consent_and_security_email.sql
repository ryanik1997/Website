-- Phase 4 completion + one-shot delivery claim for content security alerts.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  consent_version text := nullif(btrim(new.raw_user_meta_data->>'legal_consent_version'), '');
  consent_at timestamptz := case
    when new.raw_user_meta_data->>'legal_consent' = 'true'
      and consent_version is not null
      and length(consent_version) <= 40
    then now()
    else null
  end;
begin
  insert into public.profiles (
    id, email, display_name, avatar_url,
    terms_accepted_at, terms_version, privacy_accepted_at
  )
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), nullif(new.raw_user_meta_data->>'name', '')),
    coalesce(nullif(new.raw_user_meta_data->>'avatar_url', ''), nullif(new.raw_user_meta_data->>'picture', '')),
    consent_at,
    case when consent_at is not null then consent_version else null end,
    consent_at
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    terms_accepted_at = coalesce(profiles.terms_accepted_at, excluded.terms_accepted_at),
    terms_version = coalesce(profiles.terms_version, excluded.terms_version),
    privacy_accepted_at = coalesce(profiles.privacy_accepted_at, excluded.privacy_accepted_at),
    updated_at = now();
  return new;
end;
$$;

create or replace function public.claim_content_security_alert_email(
  target_user_id uuid,
  target_request_count integer,
  target_metadata jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected integer := 0;
  today date := (now() at time zone 'utc')::date;
  claimed_at timestamptz := now();
begin
  insert into public.content_security_alerts (
    user_id, alert_type, alert_day, request_count, metadata, updated_at
  ) values (
    target_user_id,
    'DAILY_SIGN_VOLUME',
    today,
    target_request_count,
    coalesce(target_metadata, '{}'::jsonb) || jsonb_build_object('emailClaimedAt', claimed_at),
    claimed_at
  )
  on conflict (user_id, alert_type, alert_day) do update set
    request_count = greatest(public.content_security_alerts.request_count, excluded.request_count),
    metadata = public.content_security_alerts.metadata
      || excluded.metadata
      || jsonb_build_object('emailClaimedAt', claimed_at),
    updated_at = claimed_at
  where nullif(public.content_security_alerts.metadata->>'emailClaimedAt', '') is null;

  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;

revoke all on function public.claim_content_security_alert_email(uuid, integer, jsonb) from public;
revoke all on function public.claim_content_security_alert_email(uuid, integer, jsonb) from anon;
revoke all on function public.claim_content_security_alert_email(uuid, integer, jsonb) from authenticated;
grant execute on function public.claim_content_security_alert_email(uuid, integer, jsonb) to service_role;

comment on function public.claim_content_security_alert_email(uuid, integer, jsonb) is
  'Atomically claims the once-per-user/day security alert email and upserts its DB record.';

create or replace function public.release_content_security_alert_email(target_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.content_security_alerts
  set metadata = metadata - 'emailClaimedAt', updated_at = now()
  where user_id = target_user_id
    and alert_type = 'DAILY_SIGN_VOLUME'
    and alert_day = (now() at time zone 'utc')::date;
$$;

revoke all on function public.release_content_security_alert_email(uuid) from public;
revoke all on function public.release_content_security_alert_email(uuid) from anon;
revoke all on function public.release_content_security_alert_email(uuid) from authenticated;
grant execute on function public.release_content_security_alert_email(uuid) to service_role;
