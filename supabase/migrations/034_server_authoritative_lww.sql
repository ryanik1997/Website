-- Make LWW ordering authoritative on PostgreSQL rather than device clocks.
-- The client still records local edit time while offline, but every accepted
-- cloud write receives a server timestamp and returns through incremental pull.

alter table public.checkin_days
  add column if not exists updated_at timestamptz not null default clock_timestamp();

drop index if exists checkin_days_user_checked_idx;
create index if not exists checkin_days_user_updated_idx
  on public.checkin_days(user_id, updated_at, day_key);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','decks','cards','srs','writing_docs','mindmaps','exam_progress','checkin_days'
  ] loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before insert or update on public.%I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end $$;

comment on function public.set_updated_at() is
  'Server-authoritative LWW timestamp for local-first sync writes.';
