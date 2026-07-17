export type ShadowingVideo = {
  id: string
  youtubeId: string
  title: string
  thumbnailUrl: string
  category: string
  level: string
  duration: string
  segments: number
  createdAt?: string | null
}

/** One timed cue from TID `shadowing_subtitles`. */
export type ShadowingSubtitle = {
  id: string
  text: string
  startTime: number | null
  duration: number | null
  ipa: string | null
  vietnameseText: string | null
}

export type ShadowingMode = 'shadowing' | 'dictation' | 'quiz'

export type ShadowingCategoryFilter =
  | 'all'
  | 'IELTS Speaking for Success'
  | 'PreF'
  | 'TED-Ed'
  | 'Real Easy English'
  | 'BBC Learning English'
  | 'Kurzgesagt – In a Nutshell'
  | 'Movie short clip'

export type ShadowingLevelFilter = 'all' | 'C2' | 'C1' | 'B2' | 'B1' | 'A2' | 'A1'
