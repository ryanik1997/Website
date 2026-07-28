# Security operations

This runbook turns the HIGH hardening plan into recurring operational work.

## Every release

1. Run `pnpm security:check`.
2. Run the focused security tests and production build.
3. Review every new migration:
   - What can `anon` read or write?
   - What can `authenticated` read or write for another user?
   - Does any proprietary table have `using (true)`?
4. Confirm `SUPABASE_SERVICE_ROLE_KEY` is never present in a `VITE_*`
   variable, browser bundle, committed file, or chat transcript.
5. Confirm `catalog/`, `data/`, `books/`, and `ielts-wizard/` are absent from
   the production build output.
6. Record applied migrations and media backfills in `session_summary.md`.

## Every quarter

1. Export production `pg_policies` using `RLS_AUDIT_CHECKLIST.md`.
2. Test proprietary REST tables with only the public anon key.
3. Test a free account against paid exam bodies, answer vaults, books, and
   wizard assets. Every request must fail except the explicit free demos.
4. Review `content_access_log` and unresolved `content_security_alerts`.
5. Review top paths, IPs, user agents, 401/403/429 rates, and unusual download
   volume in Vercel and Supabase logs.
6. Rotate stale deployment tokens and remove unused service credentials.
7. Verify database backups/PITR and perform a documented restore drill.

## Vercel Firewall baseline

The project is linked as `ryanenglishv2`. Authenticate the CLI with a fresh,
scoped Vercel token before changing production:

```powershell
vercel login
vercel firewall overview
vercel firewall rules list
```

Recommended draft rules:

- Challenge requests to `/app/*` from user agents containing
  `python-requests`, `scrapy`, `curl`, `wget`, or `HeadlessChrome`.
- Challenge requests to `/assets/*` from the same obvious automation agents.
- Rate-limit `/assets/*` by IP. Start in log/challenge mode, inspect false
  positives, then publish.

Review the draft before activation:

```powershell
vercel firewall diff
vercel firewall publish
```

Use `vercel firewall attack-mode enable` only during a confirmed attack. It
challenges every visitor immediately and is not an always-on default.

## Turnstile

- Widget domains: `localhost`, `127.0.0.1`, `ryanenglishv2.vercel.app`.
- Worker: `turnstile-siteverify-ryan-english`.
- Never put the widget secret in the repository. It belongs only in the Worker
  secret `TURNSTILE_SECRET_KEY`.
- Re-run the Spin validation after changing domains, Worker, CSP, or login.

## Supabase production blockers

Private media upload, answer-vault backfill, migration application, and
production policy verification require server-side credentials. Keep the
service-role key in a local protected environment or deployment secret store;
never prefix it with `VITE_`.

Enable PITR in the Supabase dashboard before opening the product broadly.
Availability depends on the active Supabase plan.

## Legal and content provenance

- Obtain Vietnamese legal review before treating the included Terms and
  Privacy text as final legal advice.
- Keep evidence of each accepted terms version.
- Register copyright for original courses, lessons, and learning paths when
  commercially material.
- Maintain a provenance/license register for third-party Cambridge, IELTS, and
  book content. Prefer licensed or public-domain books in Reading Corner.
