-- =============================================================
-- Fix admin media upload/upsert to private bucket exam-media
--
-- Symptom:
--   Upload media thất bại (...): new row violates row-level security policy
--
-- Cause:
--   listeningExamCloudMedia / publishedExamVault use storage.upload(..., { upsert: true }).
--   Supabase Storage upsert needs SELECT (existence check / return) in addition to
--   INSERT + UPDATE. Migration 019 intentionally dropped all read policies on
--   exam-media (Mode A Fortress) and never re-added admin-only SELECT.
-- =============================================================

-- Ensure helper is callable from storage RLS expressions
grant execute on function public.is_current_user_admin() to authenticated;
grant execute on function public.is_current_user_admin() to anon;
grant execute on function public.is_current_user_admin() to service_role;

-- Admin can read own managed objects (upsert pre-check + dashboard).
-- Non-admins still have NO direct read — playback stays via content-sign only.
drop policy if exists "exam_media admin select" on storage.objects;
create policy "exam_media admin select"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'exam-media'
    and public.is_current_user_admin() = true
  );

-- Re-assert write policies with explicit role + WITH CHECK on update
drop policy if exists "exam_media admin insert" on storage.objects;
create policy "exam_media admin insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'exam-media'
    and public.is_current_user_admin() = true
  );

drop policy if exists "exam_media admin update" on storage.objects;
create policy "exam_media admin update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'exam-media'
    and public.is_current_user_admin() = true
  )
  with check (
    bucket_id = 'exam-media'
    and public.is_current_user_admin() = true
  );

drop policy if exists "exam_media admin delete" on storage.objects;
create policy "exam_media admin delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'exam-media'
    and public.is_current_user_admin() = true
  );

-- Note: do not COMMENT ON POLICY storage.objects — migrator is not owner of storage schema.
