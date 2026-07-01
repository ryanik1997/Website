export type Plan = 'free' | 'trial' | 'basic' | 'pro' | 'lifetime'
export type Feature =
  | 'sentence_patterns' | 'vocab_basic' | 'settings'
  | 'vocab_srs' | 'review_reminder' | 'backup' | 'export'
  | 'writing_ai' | 'mindmap_ai' | 'ai_router'
  | 'all'

const PLAN_FEATURES: Record<Plan, Feature[]> = {
  free:     ['sentence_patterns', 'vocab_basic', 'settings'],
  trial:    ['sentence_patterns', 'vocab_basic', 'settings', 'vocab_srs', 'review_reminder', 'writing_ai', 'mindmap_ai', 'backup', 'export'],
  basic:    ['sentence_patterns', 'vocab_basic', 'settings', 'vocab_srs', 'review_reminder', 'backup', 'export'],
  pro:      ['sentence_patterns', 'vocab_basic', 'settings', 'vocab_srs', 'review_reminder', 'backup', 'export', 'writing_ai', 'mindmap_ai', 'ai_router'],
  lifetime: ['all'],
}

export function canUse(plan: Plan, feature: Feature): boolean {
  const features = PLAN_FEATURES[plan]
  return features.includes('all') || features.includes(feature)
}
