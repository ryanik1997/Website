# Mode A + B — Fortress & Hardening (content protection)

Bank đề / audio / dictation **không** public trên Vercel.  
Media nằm bucket Supabase **private** `exam-media`; client chỉ nhận **signed URL ~90s** qua Edge Function `content-sign`.

## Mode B (layer tiếp theo — đã ship code)

| Control | Implementation |
|---|---|
| Security headers | `vercel.json` + `spa.vercel.json` (CSP, X-Frame-Options, nosniff, Referrer-Policy) |
| robots.txt | `public/robots.txt` — Disallow `/app`, `/catalog`, `/data` |
| No sourcemaps | `vite.config.ts` `build.sourcemap: false` |
| Rate limit | content-sign: 45/user/min + 120/IP/min |
| TTL signed URL | 90s |
| Free library filter | `freePlanCatalogGate.ts` — free chỉ thấy demo KET/PET test1 |
| UX errors | `mediaAccessErrors.ts` — PLAN_REQUIRED / RATE_LIMIT messages |
| Paid-only data | `data/*` (dictation) blocked for free on Edge |

## Mode C (exam JSON out of bundle — shipped)

| Piece | Role |
|---|---|
| `pnpm mode-c:pack` | Full exams → `public/catalog/exams/{skill}/{id}.json`; list stubs → `catalog-*-meta.json` |
| `builtinExams.ts` | **Meta only** (~260KB vs ~17MB full JSON in bundle) |
| `catalogExamBody.ts` | Hydrate full exam on open via signed URL + memory cache |
| `resolveListeningExam` / `resolveReadingExam` | Fetch body before test UI |
| Free demo bodies | Edge allowlist `catalog/exams/.../ket-a2-test1.json` etc. |

```bash
pnpm mode-c:pack
pnpm media:upload-private   # must include catalog/exams/**
supabase functions deploy content-sign --linked
```

## Mode D — Answer vault (shipped)

Runtime exam body **không chứa đáp án**. Keys nằm file riêng:

```
catalog/exams/listening/{id}.json           # đề (prompt/options only)
catalog/exams/listening/{id}.answers.json   # vault { answers: { qId: { answer, explanation } } }
```

| Flow | Behavior |
|---|---|
| Làm bài | Chỉ body (không `answer` / `explanation`) |
| Submit / review | `useExamWithAnswerKeys` → sign vault → merge → chấm |
| Free demo | Edge allowlist `.answers.json` cho KET/PET test1 |
| Logout | Clear body + answers cache |

```bash
pnpm mode-c:pack          # regenerate body + vaults
pnpm media:upload-private
supabase functions deploy content-sign --linked
```

**Residual after Mode D:** once vault is loaded for scoring, keys are in memory; screen-record still possible.

## Architecture

```
Browser (login JWT)
  → supabase.functions.invoke('content-sign', { path: 'catalog/...' })
  → Edge: verify JWT + plan + rate limit
  → createSignedUrl(exam-media, path, 120s)
  → <audio src={signedUrl}>
```

| Environment | Media source |
|---|---|
| **DEV** (`pnpm dev`) | `apps/web/public/catalog` + `public/data` (local) |
| **PROD** (Vercel) | Private Storage only; dist **strips** `catalog/` + `data/` |

Force modes:

```bash
# apps/web/.env.local
VITE_MEDIA_MODE=local    # force public/ even in build
VITE_MEDIA_MODE=signed   # force content-sign even in dev
```

## One-time setup

### 1. Apply migration

```bash
cd Website
pnpm db:push
# or: supabase db push --linked
```

Migration: `supabase/migrations/019_exam_media_private_sign.sql`

### 2. Deploy Edge Function

```bash
supabase functions deploy content-sign --linked
```

Secrets (auto on Supabase): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Upload bank → private bucket

```bash
# Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.deploy
pnpm media:upload-private:dry   # list only
pnpm media:upload-private       # upload public/catalog + public/data
# optional:
pnpm media:upload-private -- --only catalog/listening/ielts-cam20-test1
```

### 4. Deploy web

```bash
pnpm --filter web build   # strips catalog/data from dist
pnpm deploy:web
```

Verify:

```bash
curl -I https://YOUR.app/catalog/listening/ielts-cam20-test1/part1.mp3
# expect 404
```

## Entitlement (free vs paid)

Edge Function free allowlist (`FREE_ALLOW_PREFIXES`):

- `catalog/listening/ket-a2-test1/`
- `catalog/listening/pet-b1-test1/`
- `catalog/reading/ket-a2-test1/`
- `catalog/reading/pet-b1-test1/`
- `catalog/writing/tid/tasks.json` (metadata)

`trial` / `basic` / `pro` / `lifetime` / `is_admin` → full bank.  
Edit allowlist in `supabase/functions/content-sign/index.ts`.

## Client code touchpoints

| File | Role |
|---|---|
| `apps/web/src/lib/protectedMedia.ts` | resolve + sign cache |
| `useExamQuestionAudio.ts` | audio via signed URL |
| `useBlobMediaUrl.ts` | images via signed URL |
| `seedTidDictation.ts` | dictation JSON via signed URL |
| `promptBank.ts` | writing TID tasks via signed URL |
| `scripts/strip-public-media-from-dist.mjs` | remove bank from Vercel dist |
| `scripts/upload-exam-media-private.mjs` | bulk upload |

## Checklist (Definition of Done)

- [ ] `curl /catalog/.../part1.mp3` → **404** on Vercel  
- [ ] `curl /data/tid-dictation-lessons.json` → **404**  
- [ ] Not logged in → cannot sign  
- [ ] Free user → only demo prefixes; Cam full → 403 `PLAN_REQUIRED`  
- [ ] Pro user → play Cam20 part audio  
- [ ] Signed URL after ~3 min → 403  
- [ ] `service_role` not in browser bundle  
- [ ] Admin fake `is_admin` in Dexie cannot bypass Edge plan check  

## Rollback

1. Set `VITE_MEDIA_MODE=local` and re-deploy **with** catalog in dist (remove strip step temporarily).  
2. Or restore public Storage policies (not recommended).

## Notes

- Local DEV keeps multi-GB `public/catalog` for speed — never commit secrets; Vercel ignores heavy catalog paths when possible.  
- `content_access_log` audits signs (rate limit 60/min/user).  
- Absolute DRM (Widevine) is out of scope for Mode A.
