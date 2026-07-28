-- =============================================================
-- Ryan English — Exam progress (Reading / Listening drafts)
-- Lưu đáp án + trạng thái nộp để sync multi-device / offline→online
-- =============================================================

create table if not exists public.exam_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  skill       text not null check (skill in ('reading', 'listening')),
  exam_id     text not null,
  payload     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  primary key (user_id, skill, exam_id)
);

create index if not exists exam_progress_user_updated_idx
  on public.exam_progress (user_id, updated_at desc);

alter table public.exam_progress enable row level security;

drop policy if exists "own exam_progress" on public.exam_progress;
create policy "own exam_progress" on public.exam_progress
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists set_updated_at on public.exam_progress;
create trigger set_updated_at before update on public.exam_progress
  for each row execute procedure public.set_updated_at();
