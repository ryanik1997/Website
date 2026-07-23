-- =============================================================
-- Ryan English — Payment activation requests
-- Chạy trong Supabase SQL Editor (sau 002_admin_plan.sql)
-- =============================================================

create table if not exists public.payment_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  user_email text not null,
  plan_id text not null,
  price text not null,
  status text not null default 'pending' check (status in ('pending', 'activated', 'cancelled')),
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

create index if not exists payment_requests_status_created_idx
  on public.payment_requests (status, created_at desc);

alter table public.payment_requests enable row level security;

drop policy if exists "own_read" on public.payment_requests;
create policy "own_read" on public.payment_requests
  for select using (auth.uid() = user_id);

drop policy if exists "admin_all" on public.payment_requests;
create policy "admin_all" on public.payment_requests
  for all using (public.is_current_user_admin() = true);