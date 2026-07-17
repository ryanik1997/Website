# RLS audit checklist

Run after applying migrations `019`–`021`:

```sql
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;
```

Expected security posture:

- `profiles`, `decks`, `cards`, `srs`, `writing_docs`, `ai_usage`,
  `mindmaps`, `exam_progress`, `checkin_days`, `payment_requests`: own-row
  policies, plus explicit admin access where needed.
- `reading_exam_published`, `listening_exam_published`: no anon policy;
  authenticated access goes through `can_read_published_exam`.
- `admin_published_modules`, `admin_publish_meta`: authenticated read only.
- `reading_exam_images`: legacy public-read policy removed by migration `019`.
- `content_access_log`: own read plus admin read; inserts only by service role.
- `content_security_alerts`: admin read/update; inserts only by service role or
  scheduled database function.
- `storage.objects` for `exam-media`: no read/list policy for anon or
  authenticated. URLs are produced only by `content-sign`.

Fail the release if any active policy contains unrestricted `using (true)` for
`anon` on proprietary content tables.
