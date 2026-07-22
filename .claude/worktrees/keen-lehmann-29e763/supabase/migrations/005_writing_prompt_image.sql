-- Ảnh đề bài (base64 data URL) — optional, sync cùng writing_docs
alter table public.writing_docs add column if not exists prompt_image text;