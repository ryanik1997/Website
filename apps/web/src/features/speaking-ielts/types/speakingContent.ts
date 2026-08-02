export type Difficulty = 'easy' | 'medium' | 'advanced'

export type TopicGroup =
  | 'home' | 'hometown' | 'accommodation' | 'family' | 'friends'
  | 'work' | 'study' | 'technology' | 'education' | 'environment'
  | 'transport' | 'travel' | 'food' | 'health' | 'sports'
  | 'leisure' | 'books' | 'music' | 'films' | 'art'
  | 'culture' | 'traditions' | 'history' | 'media' | 'advertising'
  | 'shopping' | 'money' | 'public-services' | 'cities' | 'countryside'
  | 'communication' | 'science' | 'innovation' | 'social-change'

export const TOPIC_GROUPS: readonly TopicGroup[] = [
  'home', 'hometown', 'accommodation', 'family', 'friends',
  'work', 'study', 'technology', 'education', 'environment',
  'transport', 'travel', 'food', 'health', 'sports',
  'leisure', 'books', 'music', 'films', 'art',
  'culture', 'traditions', 'history', 'media', 'advertising',
  'shopping', 'money', 'public-services', 'cities', 'countryside',
  'communication', 'science', 'innovation', 'social-change',
] as const

export type Part1Content = {
  id: string
  part: 1
  topic: string
  question: string
  topicGroup: TopicGroup
  difficulty: Difficulty
  tags: string[]
  bandFocus: string[]
}

export type Part2Content = {
  id: string
  part: 2
  topic: string
  title: string
  cueCard: string
  prompts: [string, string, string, string]
  closingInstruction: string
  topicGroup: TopicGroup
  linkedPart3Group: string
  difficulty: Difficulty
  tags: string[]
  preparationSeconds: 60
  speakingSeconds: 120
}

export type Part3Content = {
  id: string
  part: 3
  topic: string
  question: string
  topicGroup: TopicGroup
  linkedPart3Group: string
  difficulty: Difficulty
  tags: string[]
  bandFocus: string[]
}

export type AnySpeakingContent = Part1Content | Part2Content | Part3Content
