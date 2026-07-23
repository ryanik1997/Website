import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function repoFile(path: string): string {
  return readFileSync(resolve(process.cwd(), '../..', path), 'utf8')
}

describe('security hardening phase 1', () => {
  it('scopes published exam reads to authenticated server-side entitlement', () => {
    const migration = repoFile('supabase/migrations/020_harden_published_exams.sql')

    expect(migration).toContain('to authenticated')
    expect(migration).toContain('public.can_read_published_exam')
    expect(migration).toContain('revoke all on function public.can_read_published_exam')
    expect(migration).not.toMatch(
      /create policy "(reading|listening)_exam_published public read"/,
    )
    expect(migration).toContain('admin_published_modules authenticated read')
    expect(migration).toContain('admin_publish_meta authenticated read')
  })

  it('protects PDF books and IELTS wizard assets behind content-sign', () => {
    const edge = repoFile('supabase/functions/content-sign/index.ts')
    const strip = repoFile('scripts/strip-public-media-from-dist.mjs')
    const ignore = repoFile('.vercelignore')

    expect(edge).toContain("'books/'")
    expect(edge).toContain("'.pdf'")
    expect(edge).toContain("'catalog/ielts-wizard/'")
    expect(strip).toContain("'books'")
    expect(strip).toContain("'ielts-wizard'")
    expect(ignore).not.toContain('!apps/web/public/**/*.pdf')
  })

  it('uploads answer vaults before writing stripped published bodies', () => {
    for (const file of [
      'apps/web/src/features/exam/readingExamPublish.ts',
      'apps/web/src/features/exam/listeningExamPublish.ts',
    ]) {
      const source = repoFile(file)
      const uploadIndex = source.indexOf('uploadPublishedExamVault(')
      const stripIndex = source.indexOf('stripExamAnswerFields(')
      const payloadIndex = source.indexOf('const payload =')

      expect(uploadIndex).toBeGreaterThan(0)
      expect(stripIndex).toBeGreaterThan(uploadIndex)
      expect(payloadIndex).toBeGreaterThan(stripIndex)
    }
  })

  it('allows admin SELECT on exam-media so storage upsert works without public read', () => {
    const migration = repoFile('supabase/migrations/023_exam_media_admin_upsert.sql')

    expect(migration).toContain('exam_media admin select')
    expect(migration).toContain("bucket_id = 'exam-media'")
    expect(migration).toContain('public.is_current_user_admin() = true')
    expect(migration).toContain('for select')
    expect(migration).toContain('for insert')
    expect(migration).toContain('for update')
    expect(migration).toContain('with check')
    // Still no public/anon read policy
    expect(migration).not.toMatch(/exam_media public read|exam_media anon read|exam_media authenticated read/)
  })
})
