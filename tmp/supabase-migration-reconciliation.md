# Supabase Production Migration Reconciliation

## Status: BLOCKED

Audit timestamp (UTC): 2026-08-02T14:33:15Z

The mandatory backup gate failed before any migration-history repair or production schema mutation. Per the task safety rules, reconciliation stopped immediately. **No migration was marked applied, no SQL was pushed, and no production object or data was changed during this reconciliation attempt.**

## 1. Supabase project identity

| Field | Verified value |
|---|---|
| Linked project ref | `afryrzlcmieedcndyeug` |
| Project name | `ryan-english-v2` |
| Region | Southeast Asia (Singapore) |
| Database host (masked) | `db.afry…yeug.supabase.co` |
| Supabase CLI | `2.108.0` |
| Identity evidence | `supabase/.temp/project-ref` and authenticated `supabase projects list` agree |

## 2. Backup status

**FAILED / BLOCKING.**

Attempted a pre-change schema dump of `public,storage` and a separate `public` data dump. The schema dump stopped before creating a usable backup because Supabase CLI 2.108.0 requires Docker for `supabase db dump`, and this host has neither a working Docker daemon nor native `pg_dump`/`psql`.

Observed prerequisites:

- Docker: unavailable
- `pg_dump`: unavailable
- `psql`: unavailable

No repair or schema mutation is permitted until a verified backup exists.

## 3. Migration history before

`supabase migration list --linked` connected successfully. Local versions `001`–`034` are present; the Remote column is empty for every version.

| Local range | Remote history |
|---|---|
| 001–034 | No recorded versions |

This proves only that migration history is empty. It does **not** prove which schema/data effects are present.

## 4. Local migration files

The repository contains exactly 34 SQL migration files, versions `001` through `034`. Full object inventory and semantic classification were deliberately not continued past the failed safety gate.

## 5. Classification 001–034

All versions remain **CANNOT_PROVE** at this blocked checkpoint because a complete remote schema backup/read was not obtained and no per-object semantic comparison was performed.

| Versions | Classification | Reason |
|---|---|---|
| 001–034 | CANNOT_PROVE | Mandatory backup/schema-inspection gate not satisfied |

No migration is eligible for `migration repair --status applied` based on current evidence.

## 6. Policy `own decks`

Known evidence:

- `supabase db push` reached migration `001_initial_schema.sql`.
- Remote PostgreSQL returned `policy "own decks" for table "decks" already exists`.

Not yet proven due to the blocked remote-schema audit:

- exact `cmd`
- roles
- permissive/restrictive state
- `USING` expression
- `WITH CHECK` expression
- whether `decks` has RLS enabled
- whether equivalent policies exist under other names
- whether all other migration 001 effects are present

Therefore migration 001 was **not** repaired.

## 7. Repairs and reconciliation migrations

- Migration-history repairs: **none**
- Reconciliation migrations created: **none**
- Production migration push during this attempt: **not run**
- Production schema/data mutations: **none**

## 8. Staging/local validation

Not started because the production backup gate failed. No production-safe claim is made.

## 9. Application/RLS smoke tests

Not run because no reconciliation was performed. No production test users or records were created.

## 10. Data-integrity statement

No production mutation command was run in this reconciliation attempt. The failed dump command is read-only. Based on commands executed here, production data and RLS definitions were not changed.

## 11. Commands executed (secrets masked)

```text
npx supabase --version
npx supabase migration --help
npx supabase db dump --help
npx supabase migration list --linked
npx supabase projects list --output pretty
npx supabase db dump --linked --schema public,storage --file tmp/supabase-backups/prod-before-[TIMESTAMP]-schema.sql
# Planned data dump was not reached because schema dump failed.
command -v pg_dump
command -v psql
docker version
```

Authentication was loaded from `.env.deploy`; no token, password, service-role key, or connection string is included in this report.

## 12. Remaining blockers / safe next step

1. Start Docker Desktop and confirm the Docker daemon is reachable, **or** install PostgreSQL client tools compatible with remote PostgreSQL 17.
2. Re-run the pre-change schema dump and public data dump.
3. Verify dump files are non-empty and parseable; preferably test restore into an isolated PostgreSQL 17 database.
4. Only then continue with the 34-file inventory, remote catalog extraction, per-migration classification, staging reconciliation, narrowly scoped history repair, and production push.

Until those conditions are met, status remains **BLOCKED**, not PASS or PARTIAL.
