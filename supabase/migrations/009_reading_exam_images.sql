-- Ảnh đề Reading IELTS — Admin upload, mọi user đọc (Supabase Storage + metadata)
-- Chạy sau 002_admin_plan.sql

-- ── Storage bucket ─────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reading-exam-media',
  'reading-exam-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "reading_exam_media public read" on storage.objects;
create policy "reading_exam_media public read"
  on storage.objects for select
  using (bucket_id = 'reading-exam-media');

drop policy if exists "reading_exam_media admin insert" on storage.objects;
create policy "reading_exam_media admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'reading-exam-media'
    and public.is_current_user_admin() = true
  );

drop policy if exists "reading_exam_media admin update" on storage.objects;
create policy "reading_exam_media admin update"
  on storage.objects for update
  using (
    bucket_id = 'reading-exam-media'
    and public.is_current_user_admin() = true
  );

drop policy if exists "reading_exam_media admin delete" on storage.objects;
create policy "reading_exam_media admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'reading-exam-media'
    and public.is_current_user_admin() = true
  );

-- ── Metadata (list ảnh theo examId) ───────────────────────────
create table if not exists public.reading_exam_images (
  id            uuid primary key default gen_random_uuid(),
  exam_id       text not null,
  part_number   smallint not null check (part_number >= 1),
  slot          text not null check (slot in ('top', 'bottom', 'passage', 'group')),
  item_index    smallint,
  storage_path  text not null unique,
  public_url    text not null,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create unique index if not exists reading_exam_images_slot_uq
  on public.reading_exam_images (
    exam_id,
    part_number,
    slot,
    coalesce(item_index, -1)
  );

create index if not exists reading_exam_images_exam_id_idx
  on public.reading_exam_images (exam_id);

alter table public.reading_exam_images enable row level security;

drop policy if exists "reading_exam_images public read" on public.reading_exam_images;
create policy "reading_exam_images public read"
  on public.reading_exam_images for select
  using (true);

drop policy if exists "reading_exam_images admin insert" on public.reading_exam_images;
create policy "reading_exam_images admin insert"
  on public.reading_exam_images for insert
  with check (public.is_current_user_admin() = true);

drop policy if exists "reading_exam_images admin update" on public.reading_exam_images;
create policy "reading_exam_images admin update"
  on public.reading_exam_images for update
  using (public.is_current_user_admin() = true);

drop policy if exists "reading_exam_images admin delete" on public.reading_exam_images;
create policy "reading_exam_images admin delete"
  on public.reading_exam_images for delete
  using (public.is_current_user_admin() = true);