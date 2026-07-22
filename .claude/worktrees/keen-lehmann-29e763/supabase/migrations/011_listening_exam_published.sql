-- Đề Listening Admin publish — mọi user đọc (nội dung đề; MP3/ảnh qua catalog URL hoặc audioUrl trong JSON)
-- Chạy sau 010_reading_exam_published.sql

create table if not exists public.listening_exam_published (
  id                text primary key,
  title             text not null,
  duration_minutes  smallint not null default 40,
  band_hint         text,
  exam_type         text not null,
  exam_mode         text not null default 'practice',
  parts             jsonb not null,
  source            text not null default 'manual',
  source_filename   text,
  published_by      uuid references auth.users(id) on delete set null,
  published_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists listening_exam_published_updated_idx
  on public.listening_exam_published (updated_at desc);

alter table public.listening_exam_published enable row level security;

drop policy if exists "listening_exam_published public read" on public.listening_exam_published;
create policy "listening_exam_published public read"
  on public.listening_exam_published for select
  using (true);

drop policy if exists "listening_exam_published admin insert" on public.listening_exam_published;
create policy "listening_exam_published admin insert"
  on public.listening_exam_published for insert
  with check (public.is_current_user_admin() = true);

drop policy if exists "listening_exam_published admin update" on public.listening_exam_published;
create policy "listening_exam_published admin update"
  on public.listening_exam_published for update
  using (public.is_current_user_admin() = true);

drop policy if exists "listening_exam_published admin delete" on public.listening_exam_published;
create policy "listening_exam_published admin delete"
  on public.listening_exam_published for delete
  using (public.is_current_user_admin() = true);