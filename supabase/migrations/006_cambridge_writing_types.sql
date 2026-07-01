-- Cambridge Writing types A2–C2
alter table public.writing_docs drop constraint if exists writing_docs_type_check;
alter table public.writing_docs add constraint writing_docs_type_check
  check (type in (
    'ielts', 'ielts_task1', 'ielts_task2', 'master',
    'cambridge_a2', 'cambridge_b1', 'cambridge_b2', 'cambridge_c1', 'cambridge_c2'
  ));