-- Incremental local-first sync foundation.
-- A server watermark makes each paginated pull a stable snapshot. Tombstones
-- preserve hard deletes long enough for another device to observe them.

create or replace function public.sync_server_time()
returns timestamptz
language sql
stable
security invoker
set search_path = ''
as $$ select statement_timestamp(); $$;

revoke all on function public.sync_server_time() from public, anon;
grant execute on function public.sync_server_time() to authenticated;

create table if not exists public.sync_tombstones (
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('deck', 'card', 'writing_doc', 'mindmap')),
  entity_id text not null,
  deleted_at timestamptz not null default clock_timestamp(),
  primary key (user_id, entity_type, entity_id)
);

create index if not exists sync_tombstones_user_deleted_idx
  on public.sync_tombstones (user_id, deleted_at, entity_type, entity_id);

alter table public.sync_tombstones enable row level security;
drop policy if exists "own sync tombstones" on public.sync_tombstones;
create policy "own sync tombstones"
  on public.sync_tombstones for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.record_sync_tombstone()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare entity text := tg_argv[0];
begin
  insert into public.sync_tombstones(user_id, entity_type, entity_id, deleted_at)
  values (old.user_id, entity, old.id::text, clock_timestamp())
  on conflict (user_id, entity_type, entity_id)
  do update set deleted_at = excluded.deleted_at;
  return old;
end;
$$;

drop trigger if exists decks_sync_tombstone on public.decks;
create trigger decks_sync_tombstone after delete on public.decks
  for each row execute function public.record_sync_tombstone('deck');

drop trigger if exists cards_sync_tombstone on public.cards;
create trigger cards_sync_tombstone after delete on public.cards
  for each row execute function public.record_sync_tombstone('card');

drop trigger if exists writing_docs_sync_tombstone on public.writing_docs;
create trigger writing_docs_sync_tombstone after delete on public.writing_docs
  for each row execute function public.record_sync_tombstone('writing_doc');

drop trigger if exists mindmaps_sync_tombstone on public.mindmaps;
create trigger mindmaps_sync_tombstone after delete on public.mindmaps
  for each row execute function public.record_sync_tombstone('mindmap');

-- Required by incremental pull. Existing indexes cover the other synced tables.
create index if not exists srs_user_updated_idx
  on public.srs (user_id, updated_at, card_id);

-- Rate-limit and own-row access patterns found by the 1000-user audit.
create index if not exists content_access_log_ip_created_idx
  on public.content_access_log (ip, created_at desc)
  where ip is not null;

create index if not exists payment_requests_user_created_idx
  on public.payment_requests (user_id, created_at desc);

-- Keep the ledger bounded while allowing offline devices a generous window.
create or replace function public.prune_sync_tombstones()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.sync_tombstones
  where deleted_at < clock_timestamp() - interval '180 days';
$$;

revoke all on function public.prune_sync_tombstones() from public, anon, authenticated;
