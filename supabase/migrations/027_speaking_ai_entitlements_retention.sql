create extension if not exists pg_cron;

create or replace function public.prune_speaking_history()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.speaking_messages
  where created_at < now() - interval '30 days';

  delete from public.speaking_conversations c
  where c.started_at < now() - interval '30 days'
    and not exists (
      select 1 from public.speaking_messages m
      where m.conversation_id = c.id
    );

  delete from public.speaking_usage
  where usage_date < current_date - 30;
end;
$$;

revoke all on function public.prune_speaking_history() from public;
revoke all on function public.prune_speaking_history() from anon;
revoke all on function public.prune_speaking_history() from authenticated;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'prune-speaking-history-30d';

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;

  perform cron.schedule(
    'prune-speaking-history-30d',
    '23 3 * * *',
    'select public.prune_speaking_history();'
  );
end;
$$;

select public.prune_speaking_history();
