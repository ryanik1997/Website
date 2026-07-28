-- =============================================================
-- Ryan English — Daily check-in (điểm danh) per account
-- Sync multi-device; local IndexedDB reviewLog mode=checkin stays mirror
-- =============================================================

create table if not exists public.checkin_days (
  user_id     uuid not null references auth.users(id) on delete cascade,
  -- Calendar day key as YYYY-MM-DD (device local date when checking in)
  day_key     text not null
    check (day_key ~ '^\d{4}-\d{2}-\d{2}$'),
  checked_at  timestamptz not null default now(),
  primary key (user_id, day_key)
);

create index if not exists checkin_days_user_checked_idx
  on public.checkin_days (user_id, checked_at desc);

alter table public.checkin_days enable row level security;

drop policy if exists "own checkin_days" on public.checkin_days;
create policy "own checkin_days" on public.checkin_days
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
