create table if not exists public.speaking_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Speaking practice',
  level text not null check (level in ('A1','A2','B1','B2','C1')),
  topic text not null,
  mode text not null,
  provider text not null default 'gemini',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_duration integer not null default 0
);

create table if not exists public.speaking_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.speaking_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  text text not null,
  corrected_text text,
  feedback_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.speaking_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default (now() at time zone 'utc')::date,
  audio_seconds integer not null default 0,
  request_count integer not null default 0,
  estimated_cost numeric(12,6) not null default 0,
  primary key (user_id, usage_date)
);

alter table public.speaking_conversations enable row level security;
alter table public.speaking_messages enable row level security;
alter table public.speaking_usage enable row level security;

create policy "speaking conversations own read" on public.speaking_conversations for select to authenticated using (user_id = auth.uid());
create policy "speaking conversations own delete" on public.speaking_conversations for delete to authenticated using (user_id = auth.uid());
create policy "speaking messages own read" on public.speaking_messages for select to authenticated using (exists (select 1 from public.speaking_conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "speaking usage own read" on public.speaking_usage for select to authenticated using (user_id = auth.uid());

create index if not exists speaking_conversations_user_started_idx on public.speaking_conversations(user_id, started_at desc);
create index if not exists speaking_messages_conversation_created_idx on public.speaking_messages(conversation_id, created_at);
