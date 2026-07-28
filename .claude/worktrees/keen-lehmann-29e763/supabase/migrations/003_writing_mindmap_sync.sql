-- =============================================================
-- Ryan English — Writing + Mindmap cloud sync
-- Chạy trong Supabase SQL Editor (sau 001_initial_schema.sql)
-- =============================================================

-- writing_docs đã có từ migration 001 — mở rộng type cho app mới
alter table public.writing_docs drop constraint if exists writing_docs_type_check;
alter table public.writing_docs add constraint writing_docs_type_check
  check (type in ('ielts', 'ielts_task1', 'ielts_task2', 'master'));

-- ── mindmaps ────────────────────────────────────────────────
create table if not exists public.mindmaps (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  nodes       jsonb not null default '{}',
  updated_at  timestamptz not null default now()
);

create index if not exists mindmaps_user_updated_idx
  on public.mindmaps (user_id, updated_at desc);

alter table public.mindmaps enable row level security;

drop policy if exists "own mindmaps" on public.mindmaps;
create policy "own mindmaps" on public.mindmaps
  for all using (auth.uid() = user_id);

drop trigger if exists set_updated_at on public.mindmaps;
create trigger set_updated_at before update on public.mindmaps
  for each row execute procedure public.set_updated_at();