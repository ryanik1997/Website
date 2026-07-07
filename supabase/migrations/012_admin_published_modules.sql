-- Nội dung Admin publish — mọi user đọc (vocab preset, lessons, writing prompts, …)
-- Chạy sau 011_listening_exam_published.sql

create table if not exists public.admin_published_modules (
  module        text primary key,
  payload       jsonb not null default '{}',
  item_count    int not null default 0,
  published_by  uuid references auth.users(id) on delete set null,
  updated_at    timestamptz not null default now()
);

create table if not exists public.admin_publish_meta (
  id            text primary key default 'global',
  version       int not null default 0,
  modules       text[] not null default '{}',
  published_by  uuid references auth.users(id) on delete set null,
  published_at  timestamptz not null default now()
);

alter table public.admin_published_modules enable row level security;
alter table public.admin_publish_meta enable row level security;

drop policy if exists "admin_published_modules public read" on public.admin_published_modules;
create policy "admin_published_modules public read"
  on public.admin_published_modules for select
  using (true);

drop policy if exists "admin_published_modules admin write" on public.admin_published_modules;
create policy "admin_published_modules admin write"
  on public.admin_published_modules for all
  using (public.is_current_user_admin() = true)
  with check (public.is_current_user_admin() = true);

drop policy if exists "admin_publish_meta public read" on public.admin_publish_meta;
create policy "admin_publish_meta public read"
  on public.admin_publish_meta for select
  using (true);

drop policy if exists "admin_publish_meta admin write" on public.admin_publish_meta;
create policy "admin_publish_meta admin write"
  on public.admin_publish_meta for all
  using (public.is_current_user_admin() = true)
  with check (public.is_current_user_admin() = true);