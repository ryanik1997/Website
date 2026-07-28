-- =============================================================
-- Ryan English — Initial Schema
-- Chạy file này trong Supabase SQL Editor
-- =============================================================

-- ── 1. profiles (tự động tạo khi user đăng ký) ──────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  display_name    text,
  avatar_url      text,
  plan            text not null default 'free'
                  check (plan in ('free','trial','basic','pro','lifetime')),
  plan_expires_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Trigger: tạo profile tự động khi user đăng nhập lần đầu
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email        = excluded.email,
    display_name = coalesce(excluded.display_name, profiles.display_name),
    avatar_url   = coalesce(excluded.avatar_url,   profiles.avatar_url),
    updated_at   = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. decks ────────────────────────────────────────────────
create table if not exists public.decks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  group_name  text,
  name        text not null,
  book        text,
  unit        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz          -- soft delete
);
create index on public.decks (user_id, updated_at desc);

-- ── 3. cards ────────────────────────────────────────────────
create table if not exists public.cards (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  deck_id     uuid not null references public.decks(id) on delete cascade,
  phrase      text not null,
  meaning     text not null,
  example     text,
  ipa_us      text,
  ipa_uk      text,
  pos         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index on public.cards (user_id, deck_id);
create index on public.cards (user_id, updated_at desc);

-- ── 4. srs ──────────────────────────────────────────────────
create table if not exists public.srs (
  card_id         uuid primary key references public.cards(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  ease            numeric(4,2) not null default 2.5,
  interval_days   int not null default 0,
  reps            int not null default 0,
  lapses          int not null default 0,
  due_at          timestamptz not null default now(),
  last_reviewed_at timestamptz,
  state           text not null default 'new'
                  check (state in ('new','learning','review')),
  updated_at      timestamptz not null default now()
);
create index on public.srs (user_id, due_at);

-- ── 5. writing_docs ─────────────────────────────────────────
create table if not exists public.writing_docs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('ielts','master')),
  prompt      text not null default '',
  text        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index on public.writing_docs (user_id, updated_at desc);

-- ── 6. ai_usage (rate limit + cost tracking) ────────────────
create table if not exists public.ai_usage (
  id       bigint generated always as identity primary key,
  user_id  uuid not null references auth.users(id) on delete cascade,
  day      date not null,
  feature  text not null,   -- 'writing_ai', 'mindmap_ai', 'dictionary'
  count    int not null default 0,
  tokens   int not null default 0,
  unique (user_id, day, feature)
);
create index on public.ai_usage (user_id, day desc);

-- ── 7. updated_at trigger (dùng chung) ──────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$ declare t text;
begin
  foreach t in array array['profiles','decks','cards','srs','writing_docs']
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute procedure public.set_updated_at();', t, t);
  end loop;
end $$;

-- ── 8. Row-Level Security (RLS) ─────────────────────────────
-- Mỗi user chỉ thấy data của chính mình
alter table public.profiles      enable row level security;
alter table public.decks         enable row level security;
alter table public.cards         enable row level security;
alter table public.srs           enable row level security;
alter table public.writing_docs  enable row level security;
alter table public.ai_usage      enable row level security;

-- profiles
create policy "own profile" on public.profiles
  for all using (auth.uid() = id);

-- decks
create policy "own decks" on public.decks
  for all using (auth.uid() = user_id);

-- cards
create policy "own cards" on public.cards
  for all using (auth.uid() = user_id);

-- srs
create policy "own srs" on public.srs
  for all using (auth.uid() = user_id);

-- writing_docs
create policy "own writing_docs" on public.writing_docs
  for all using (auth.uid() = user_id);

-- ai_usage
create policy "own ai_usage" on public.ai_usage
  for all using (auth.uid() = user_id);
