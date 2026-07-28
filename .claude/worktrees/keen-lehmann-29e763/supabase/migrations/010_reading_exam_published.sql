-- Đề Reading IELTS Admin publish — mọi user đọc (nội dung đề + ảnh cloud)
-- Chạy sau 009_reading_exam_images.sql

create table if not exists public.reading_exam_published (
  id                text primary key,
  title             text not null,
  duration_minutes  smallint not null default 60,
  band_hint         text,
  parts             jsonb not null,
  exam_track        text,
  cambridge_level   text,
  source            text not null default 'manual',
  source_filename   text,
  published_by      uuid references auth.users(id) on delete set null,
  published_at      timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists reading_exam_published_updated_idx
  on public.reading_exam_published (updated_at desc);

alter table public.reading_exam_published enable row level security;

drop policy if exists "reading_exam_published public read" on public.reading_exam_published;
create policy "reading_exam_published public read"
  on public.reading_exam_published for select
  using (true);

drop policy if exists "reading_exam_published admin insert" on public.reading_exam_published;
create policy "reading_exam_published admin insert"
  on public.reading_exam_published for insert
  with check (public.is_current_user_admin() = true);

drop policy if exists "reading_exam_published admin update" on public.reading_exam_published;
create policy "reading_exam_published admin update"
  on public.reading_exam_published for update
  using (public.is_current_user_admin() = true);

drop policy if exists "reading_exam_published admin delete" on public.reading_exam_published;
create policy "reading_exam_published admin delete"
  on public.reading_exam_published for delete
  using (public.is_current_user_admin() = true);