import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), '../..')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('Speaking AI entitlements and retention', () => {
  it('gives active Pro, lifetime, and admin accounts unlimited usage', () => {
    const edge = read('supabase/functions/speaking-ai/index.ts')
    expect(edge).toContain("profile?.is_admin === true")
    expect(edge).toContain("activePlan === 'pro' || activePlan === 'lifetime'")
    expect(edge).toContain('if (!unlimited &&')
  })

  it('schedules automatic deletion of speaking history after 30 days', () => {
    const migration = read('supabase/migrations/027_speaking_ai_entitlements_retention.sql')
    expect(migration).toContain("interval '30 days'")
    expect(migration).toContain("cron.schedule")
    expect(migration).toContain('prune_speaking_history')
  })

  it('shows unlimited access and 30-day retention in the Speaking UI', () => {
    const page = read('apps/web/src/features/speaking-ai/SpeakingAiPage.tsx')
    expect(page).toContain('access.unlimited')
    expect(page).toContain('access.retentionDays')
    expect(page).toContain('openHistory')
  })
})
