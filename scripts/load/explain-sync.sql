-- Run on staging with: psql "$DATABASE_URL" -v test_user_id='<uuid>' -f scripts/load/explain-sync.sql
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', :'test_user_id', true);

explain (analyze, buffers, settings)
select id, user_id, deck_id, phrase, meaning, updated_at
from public.cards
where user_id = :'test_user_id'::uuid
  and updated_at > clock_timestamp() - interval '1 day'
order by updated_at, id
limit 500;

explain (analyze, buffers, settings)
select card_id, user_id, due_at, updated_at
from public.srs
where user_id = :'test_user_id'::uuid
  and updated_at > clock_timestamp() - interval '1 day'
order by updated_at, card_id
limit 500;

explain (analyze, buffers, settings)
select entity_type, entity_id, deleted_at
from public.sync_tombstones
where user_id = :'test_user_id'::uuid
  and deleted_at > clock_timestamp() - interval '180 days'
order by deleted_at, entity_type, entity_id
limit 500;

rollback;
