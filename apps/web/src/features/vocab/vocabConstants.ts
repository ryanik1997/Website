export const PRESET_GROUP_IDS = ['ielts', 'oxford', 'toeic', 'academic', 'sat', 'toefl'] as const
export type PresetGroupId = (typeof PRESET_GROUP_IDS)[number]
export const ADMIN_PUBLISHED_VOCAB_VERSION_KEY = 'admin_published_vocab_version'
