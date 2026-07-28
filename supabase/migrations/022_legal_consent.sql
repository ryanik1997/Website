-- =============================================================
-- Phase 4: auditable Terms and Privacy consent.
-- Consent timestamps are writable only through accept_legal_terms().
-- =============================================================

alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists privacy_accepted_at timestamptz;

create or replace function public.protect_legal_consent_fields()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('postgres', 'service_role')
    and (
      new.terms_accepted_at is distinct from old.terms_accepted_at
      or new.terms_version is distinct from old.terms_version
      or new.privacy_accepted_at is distinct from old.privacy_accepted_at
    )
  then
    raise exception 'Legal consent fields are server-controlled';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_legal_consent_fields on public.profiles;
create trigger protect_legal_consent_fields
  before update on public.profiles
  for each row execute procedure public.protect_legal_consent_fields();

create or replace function public.accept_legal_terms(version text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  accepted_at timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if nullif(btrim(version), '') is null or length(version) > 40 then
    raise exception 'Invalid terms version';
  end if;

  update public.profiles
  set
    terms_accepted_at = accepted_at,
    terms_version = btrim(version),
    privacy_accepted_at = accepted_at,
    updated_at = accepted_at
  where id = auth.uid();

  if not found then
    raise exception 'Profile not found';
  end if;

  return accepted_at;
end;
$$;

revoke all on function public.accept_legal_terms(text) from public;
revoke all on function public.accept_legal_terms(text) from anon;
grant execute on function public.accept_legal_terms(text) to authenticated;

comment on function public.accept_legal_terms(text) is
  'Records authenticated user acceptance of a versioned Terms and Privacy policy.';
