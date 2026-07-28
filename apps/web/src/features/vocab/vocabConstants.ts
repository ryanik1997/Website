export const PRESET_GROUP_IDS = ['ielts', 'oxford', 'toeic', 'academic', 'sat', 'toefl'] as const
export type PresetGroupId = (typeof PRESET_GROUP_IDS)[number]
export const ADMIN_PUBLISHED_VOCAB_VERSION_KEY = 'admin_published_vocab_version'

/** Nhãn hiển thị nhóm preset — giữ ở constants để UI không import seed JSON (~7MB). */
export const GROUP_LABELS: Record<PresetGroupId, string> = {
  ielts: 'IELTS',
  oxford: 'Oxford',
  toeic: 'TOEIC',
  academic: 'Học thuật',
  sat: 'SAT',
  toefl: 'TOEFL',
}
