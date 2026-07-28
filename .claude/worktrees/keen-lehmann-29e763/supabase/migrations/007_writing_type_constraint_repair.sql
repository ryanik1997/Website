-- Repair: đảm bảo writing_docs.type chấp nhận IELTS Task 1/2 + Cambridge A2–C2
-- (xử lý khi constraint cũ từ 001 còn tên khác writing_docs_type_check)

do $$
declare
  r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'writing_docs'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%type%'
  loop
    execute format('alter table public.writing_docs drop constraint if exists %I', r.conname);
  end loop;
end $$;

alter table public.writing_docs drop constraint if exists writing_docs_type_check;
alter table public.writing_docs add constraint writing_docs_type_check
  check (type in (
    'ielts', 'ielts_task1', 'ielts_task2', 'master',
    'cambridge_a2', 'cambridge_b1', 'cambridge_b2', 'cambridge_c1', 'cambridge_c2'
  ));

alter table public.writing_docs add column if not exists prompt_image text;