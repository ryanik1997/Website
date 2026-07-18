import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoFile = (path: string) => readFileSync(resolve(process.cwd(), '../..', path), 'utf8')

describe('1000-user scalability hardening', () => {
  it('uses paginated cursor pulls and persists the cursor only after push success', () => {
    const sync = repoFile('packages/db/src/cloud/sync.ts')
    expect(sync).toContain('SYNC_PAGE_SIZE')
    expect(sync).toContain(".eq('user_id', userId)")
    expect(sync).toContain(".range(from, from + SYNC_PAGE_SIZE - 1)")
    expect(sync).toContain(".order('id', { ascending: true })")
    expect(sync).toContain('localSyncCursorKey')
    expect(sync).toContain('pullTombstonePages')
    expect(sync.indexOf("throw new Error(pushErrors.join('; '))"))
      .toBeLessThan(sync.indexOf('db.settings.put({ key: syncCursorKey'))
  })

  it('adds server watermarks, delete propagation and the missing hot indexes', () => {
    const foundation = repoFile('supabase/migrations/031_incremental_sync_foundation.sql')
    const lww = repoFile('supabase/migrations/034_server_authoritative_lww.sql')
    expect(foundation).toContain('public.sync_tombstones')
    expect(foundation).toContain('srs_user_updated_idx')
    expect(foundation).toContain('content_access_log_ip_created_idx')
    expect(lww).toContain('before insert or update')
    expect(lww).toContain('clock_timestamp()')
  })

  it('uses init-plan RLS helpers and atomic Edge Function counters', () => {
    const rls = repoFile('supabase/migrations/032_rls_sync_performance.sql')
    const counters = repoFile('supabase/migrations/033_atomic_runtime_counters.sql')
    const sign = repoFile('supabase/functions/content-sign/index.ts')
    const speaking = repoFile('supabase/functions/speaking-ai/index.ts')
    expect(rls).toContain('using ((select auth.uid()) = user_id)')
    expect(rls).toContain('(select public.can_access_published_content())')
    expect(counters).toContain('public.claim_content_rate_limit')
    expect(counters).toContain('for update')
    expect(sign).toContain("rpc('claim_content_rate_limit'")
    expect(speaking).toContain("rpc('commit_speaking_usage'")
  })

  it('adds Dexie hot-query indexes and bounded audio LRU metadata', () => {
    const schema = repoFile('packages/db/src/local/schema.ts')
    const audio = repoFile('packages/db/src/local/repositories/audioRepo.ts')
    expect(schema).toContain('[deckId+dueAt]')
    expect(schema).toContain('[mode+at]')
    expect(schema).toContain("audioBlobs:      '&key, createdAt, lastAccessedAt'")
    expect(audio).toContain('HARD_AUDIO_CACHE_LIMIT_BYTES')
    expect(audio).toContain('if (blob.size > budget)')
    expect(audio).toContain('bulkDelete(toDelete)')
  })
})
