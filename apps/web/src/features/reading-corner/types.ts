export type BilingualBlock = {
  en: string
  vi: string
}

export type BilingualArticleMeta = {
  id: string
  source_id: string
  category: string
  category_vi: string
  title: string
  title_vi: string
  excerpt: string
  excerpt_vi: string
  image_url: string
  author: string
  read_time: string
  view_count: number
  source_url: string
  source_label: string
}

export type BilingualArticle = BilingualArticleMeta & {
  content: BilingualBlock[]
}

export type BilingualSourceId =
  | 'the-atlantic'
  | 'the-new-york-times'
  | 'reuters'
  | 'substack'
  | 'the-conversation'
  | 'the-guardian'
  /** Topic hubs — filter articles by category keywords (not press brands). */
  | 'topic-psychology'
  | 'topic-technology'
  | 'topic-health'
  | 'topic-politics'
  | 'topic-lifestyle'
  | 'topic-environment'
  | 'topic-economics'
  | 'topic-education'
  | 'topic-science'
  | 'topic-culture'
  | 'topic-work'
  | 'topic-self-growth'
  | 'topic-history'
  | 'topic-immigration'
  | 'topic-climate'
  | 'topic-cities'
  | 'topic-security'
  | 'topic-habits'
  | 'topic-love'
  | 'topic-parenting'
  | 'topic-policy'
  | 'topic-privacy'
  | 'topic-friendship'
  | 'topic-demographics'
  | 'topic-us-affairs'
  | 'topic-sports'
  | 'topic-money'
  | 'topic-neuroscience'
  | 'topic-thinking'
  | 'topic-kindness'
  | 'topic-nature'
  | 'topic-rebuild'
  | 'topic-media'
  | 'topic-global'
  | 'topic-identity'
  | 'topic-jobs'
  | 'topic-pets'
  | 'topic-rights'
  | 'topic-ethics'
  | 'topic-space'
  | 'topic-finance'
  | 'topic-fitness'
  | 'topic-opinion'
  | 'topic-disease'
  | 'topic-critical'
  | 'topic-housing'
  | 'topic-trauma'
  | 'topic-food-history'
  | 'topic-energy'
  | 'topic-ai-mind'
  | 'topic-college'
  | 'topic-abortion'
  | 'topic-humor'
  | 'topic-sustainability'
  | 'topic-motherhood'
  | 'topic-foreign-policy'
  | 'topic-crime'
  | 'topic-addiction'
  | 'topic-outbreaks'
  | 'topic-sleep-health'
  | 'topic-body-image'
  | 'topic-carbon'
  | 'topic-looksmaxxing'
  | 'topic-mini-retire'
  | 'topic-time-mgmt'
  | 'topic-closure'
  | 'topic-aging'
  | 'topic-psychiatry'
  | 'topic-env-movement'
  | 'topic-grief'
  | 'topic-enrollment'
  | 'topic-charisma'
  | 'topic-partners'
  | 'topic-tech-giants'
  | 'topic-treasuries'
  | 'topic-democrats'
  | 'topic-ai-bubble'
  | 'topic-moral-code'
  | 'topic-expectations'
  | 'topic-nature-common'
  | 'topic-ugly-thoughts'
  | 'topic-smart-crime'
  | 'topic-gun-violence'
  | 'topic-ev'

export type BilingualSource = {
  id: BilingualSourceId
  name: string
  coverUrl: string
  recommended?: boolean
  /**
   * When set, article list matches any keyword in category/title
   * (case-insensitive) instead of `source_id`.
   */
  topicKeywords?: string[]
}
