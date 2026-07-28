-- =============================================================
-- 015 — Harden RLS cho dữ liệu *cá nhân* của user
--
-- Mô hình:
--   • User: đọc/ghi CHỈ row user_id = auth.uid()
--     (decks, cards, srs, writing_docs, mindmaps, exam_progress, ai_usage)
--   • Admin: publish Luyện thi + Vocab mặc định
--     (reading_exam_published, listening_exam_published, admin_published_*)
--
-- Lỗi hay gặp: policy chỉ có USING, thiếu WITH CHECK → INSERT/UPSERT bị chặn
-- dù user_id đúng. Thêm WITH CHECK tường minh.
-- =============================================================

-- ── decks ───────────────────────────────────────────────────
drop policy if exists "own decks" on public.decks;
create policy "own decks" on public.decks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── cards ───────────────────────────────────────────────────
drop policy if exists "own cards" on public.cards;
create policy "own cards" on public.cards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── srs ─────────────────────────────────────────────────────
drop policy if exists "own srs" on public.srs;
create policy "own srs" on public.srs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── writing_docs ────────────────────────────────────────────
drop policy if exists "own writing_docs" on public.writing_docs;
create policy "own writing_docs" on public.writing_docs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── ai_usage ────────────────────────────────────────────────
drop policy if exists "own ai_usage" on public.ai_usage;
create policy "own ai_usage" on public.ai_usage
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── mindmaps (nếu bảng đã tồn tại từ 003) ───────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'mindmaps'
  ) then
    execute 'drop policy if exists "own mindmaps" on public.mindmaps';
    execute $p$
      create policy "own mindmaps" on public.mindmaps
        for all
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id)
    $p$;
  end if;
end $$;

-- ── exam_progress (nếu có từ 014) ───────────────────────────
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'exam_progress'
  ) then
    execute 'drop policy if exists "own exam_progress" on public.exam_progress';
    execute $p$
      create policy "own exam_progress" on public.exam_progress
        for all
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id)
    $p$;
  end if;
end $$;

-- profiles: user chỉ sửa profile của mình (không đụng is_admin/plan — trigger 013)
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
