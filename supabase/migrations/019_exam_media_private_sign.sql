-- =============================================================
-- Mode A (Fortress): private exam media + access audit
-- Bucket exam-media: NO public read. Only service_role signs URLs
-- via Edge Function content-sign.
-- =============================================================

-- ── 1. Private bucket ────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exam-media',
  'exam-media',
  false,
  52428800, -- 50MB: Supabase Free project global maximum
  array[
    'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/x-wav',
    'audio/webm', 'audio/ogg', 'audio/aac', 'audio/x-m4a',
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/json', 'text/plain', 'application/octet-stream'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Drop any public-read policies if re-applied by mistake
drop policy if exists "exam_media public read" on storage.objects;
drop policy if exists "exam_media authenticated read" on storage.objects;
drop policy if exists "exam_media anon read" on storage.objects;

-- Authenticated users must NOT list/download objects directly
-- (signed URLs are created with service role in Edge Function)

drop policy if exists "exam_media admin insert" on storage.objects;
create policy "exam_media admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'exam-media'
    and public.is_current_user_admin() = true
  );

drop policy if exists "exam_media admin update" on storage.objects;
create policy "exam_media admin update"
  on storage.objects for update
  using (
    bucket_id = 'exam-media'
    and public.is_current_user_admin() = true
  );

drop policy if exists "exam_media admin delete" on storage.objects;
create policy "exam_media admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'exam-media'
    and public.is_current_user_admin() = true
  );

-- ── 2. Harden legacy public media buckets (optional lockdown) ─
-- Keep buckets but remove public read so old public URLs stop working
-- after you re-upload / migrate. Comment out if you still need public
-- transition period.

update storage.buckets
set public = false
where id in ('listening-exam-media', 'reading-exam-media');

drop policy if exists "listening_exam_media public read" on storage.objects;
drop policy if exists "reading_exam_media public read" on storage.objects;
drop policy if exists "reading_exam_images public read" on public.reading_exam_images;

-- ── 3. Access audit log ──────────────────────────────────────
create table if not exists public.content_access_log (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  path text not null,
  plan text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists content_access_log_user_created_idx
  on public.content_access_log (user_id, created_at desc);

create index if not exists content_access_log_created_idx
  on public.content_access_log (created_at desc);

alter table public.content_access_log enable row level security;

drop policy if exists "content_access_log own read" on public.content_access_log;
create policy "content_access_log own read"
  on public.content_access_log for select
  using (auth.uid() = user_id);

drop policy if exists "content_access_log admin read" on public.content_access_log;
create policy "content_access_log admin read"
  on public.content_access_log for select
  using (public.is_current_user_admin() = true);

-- Inserts only via service role (Edge Function) — no user insert policy

comment on table public.content_access_log is
  'Mode A: audit signed media access (written by content-sign Edge Function)';
