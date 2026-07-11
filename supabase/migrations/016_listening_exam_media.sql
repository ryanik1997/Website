-- Media đề Listening publish (MP3 + ảnh) — Admin upload, mọi user đọc
-- Chạy sau 011_listening_exam_published.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listening-exam-media',
  'listening-exam-media',
  true,
  52428800, -- 50MB (MP3 full paper)
  array[
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/ogg',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "listening_exam_media public read" on storage.objects;
create policy "listening_exam_media public read"
  on storage.objects for select
  using (bucket_id = 'listening-exam-media');

drop policy if exists "listening_exam_media admin insert" on storage.objects;
create policy "listening_exam_media admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'listening-exam-media'
    and public.is_current_user_admin() = true
  );

drop policy if exists "listening_exam_media admin update" on storage.objects;
create policy "listening_exam_media admin update"
  on storage.objects for update
  using (
    bucket_id = 'listening-exam-media'
    and public.is_current_user_admin() = true
  );

drop policy if exists "listening_exam_media admin delete" on storage.objects;
create policy "listening_exam_media admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'listening-exam-media'
    and public.is_current_user_admin() = true
  );
