# Supabase 1000-user load test

Run only against a staging project populated with representative per-user data.
Create `sync-fixtures.json` from the example with one distinct access token per test user;
never commit that file.

```powershell
$env:SUPABASE_URL='https://STAGING.supabase.co'
$env:SUPABASE_ANON_KEY='STAGING_ANON_KEY'
$env:SYNC_FIXTURES='./scripts/load/sync-fixtures.json'
k6 run scripts/load/supabase-sync.k6.js
```

Watch Database CPU, PostgREST 429/5xx, locks, Database Connections and Supavisor
connections in the staging dashboard. Run `explain-sync.sql` before k6 and again
after representative data growth. A passing latency test is not sufficient: compare
local/cloud entity hashes after the run and require zero missing, duplicated or
resurrected records.
