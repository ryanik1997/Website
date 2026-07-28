import type { WritingDoc } from '@ryan/db'
import { CAMBRIDGE_DOC_TYPES } from './writingTypes'

export function isCambridgeType(type: WritingDoc['type']): boolean {
  return (CAMBRIDGE_DOC_TYPES as string[]).includes(type)
}

export interface WritingUiConfig {
  track: 'ielts' | 'cambridge'
  kicker: string
  editorTitle: string
  textareaPlaceholder: string
  submitLabel: string
  targetPrefix: string
  scoreEmptyHint: string
}

const CAMBRIDGE_UI: Record<string, Omit<WritingUiConfig, 'track'>> = {
  cambridge_a2: {
    kicker: 'Cambridge A2 Writing',
    editorTitle: 'Viết bài Cambridge A2 (KET)',
    textareaPlaceholder: 'Write your A2 response here (email, note, short message)…',
    submitLabel: 'NỘP BÀI',
    targetPrefix: 'Mục tiêu A2',
    scoreEmptyHint: 'Kết quả gồm điểm Cambridge (0–5) + 4 tiêu chí: Content, Communicative Achievement, Organisation, Language.',
  },
  cambridge_b1: {
    kicker: 'Cambridge B1 Writing',
    editorTitle: 'Viết bài Cambridge B1 (PET)',
    textareaPlaceholder: 'Write your B1 response here…',
    submitLabel: 'NỘP BÀI',
    targetPrefix: 'Mục tiêu B1',
    scoreEmptyHint: 'Kết quả gồm điểm Cambridge (0–5) + 4 tiêu chí: Content, Communicative Achievement, Organisation, Language.',
  },
  cambridge_b2: {
    kicker: 'Cambridge B2 Writing',
    editorTitle: 'Viết bài Cambridge B2 (FCE)',
    textareaPlaceholder: 'Write your B2 essay or report here…',
    submitLabel: 'NỘP BÀI',
    targetPrefix: 'Mục tiêu B2',
    scoreEmptyHint: 'Kết quả gồm điểm Cambridge (0–5) + 4 tiêu chí: Content, Communicative Achievement, Organisation, Language.',
  },
  cambridge_c1: {
    kicker: 'Cambridge C1 Writing',
    editorTitle: 'Viết bài Cambridge C1 (CAE)',
    textareaPlaceholder: 'Write your C1 essay here…',
    submitLabel: 'NỘP BÀI',
    targetPrefix: 'Mục tiêu C1',
    scoreEmptyHint: 'Kết quả gồm điểm Cambridge (0–5) + 4 tiêu chí: Content, Communicative Achievement, Organisation, Language.',
  },
  cambridge_c2: {
    kicker: 'Cambridge C2 Writing',
    editorTitle: 'Viết bài Cambridge C2 (CPE)',
    textareaPlaceholder: 'Write your C2 essay here…',
    submitLabel: 'NỘP BÀI',
    targetPrefix: 'Mục tiêu C2',
    scoreEmptyHint: 'Kết quả gồm điểm Cambridge (0–5) + 4 tiêu chí: Content, Communicative Achievement, Organisation, Language.',
  },
}

const IELTS_UI: WritingUiConfig = {
  track: 'ielts',
  kicker: 'IELTS Essay Practice',
  editorTitle: 'Viết bài IELTS',
  textareaPlaceholder: 'Write your full IELTS essay here…',
  submitLabel: 'NỘP ESSAY',
  targetPrefix: 'Mục tiêu',
  scoreEmptyHint: 'Kết quả gồm band score IELTS + nhận xét 4 tiêu chí.',
}

export function getWritingUiConfig(type: WritingDoc['type']): WritingUiConfig {
  if (isCambridgeType(type)) {
    const cfg = CAMBRIDGE_UI[type] ?? CAMBRIDGE_UI.cambridge_b2
    return { track: 'cambridge', ...cfg }
  }
  return {
    ...IELTS_UI,
    targetPrefix: type === 'ielts_task1' ? 'Mục tiêu Task 1' : 'Mục tiêu Task 2',
  }
}