-- Cambridge writing genre (email, story, essay, …)
alter table public.writing_docs add column if not exists genre text;

create index if not exists writing_docs_user_type_genre_idx
  on public.writing_docs (user_id, type, genre);