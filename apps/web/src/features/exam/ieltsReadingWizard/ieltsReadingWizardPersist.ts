import type { ReadingImportPartJson } from '../importReadingManualUtils'
import {
  IELTS_READING_DEFAULT_TEMPLATES,
  IELTS_READING_PASSAGE_NUMBERS,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'

const STORAGE_KEY = 'ielts-reading-import-wizard-draft'
const VERSION = 1 as const

export type ReadingWizardPersistStep = 'setup' | 'passage' | 'preview'

export interface PersistedPassageDraft {
  templateKind: IeltsReadingWizardTemplateKind
  examText: string
  part: ReadingImportPartJson | null
  rawJson: string
  warnings: string[]
}

export interface IeltsReadingWizardDraft {
  version: typeof VERSION
  savedAt: number
  step: ReadingWizardPersistStep
  activePassage: IeltsReadingPassageNumber
  title: string
  cambridge: string
  test: string
  answerKey: string
  drafts: Record<IeltsReadingPassageNumber, PersistedPassageDraft>
  extraMediaNames: string[]
}

function emptyDraft(passageNumber: IeltsReadingPassageNumber): PersistedPassageDraft {
  return {
    templateKind: IELTS_READING_DEFAULT_TEMPLATES[passageNumber],
    examText: '',
    part: null,
    rawJson: '',
    warnings: [],
  }
}

export function createEmptyReadingWizardDrafts(): Record<IeltsReadingPassageNumber, PersistedPassageDraft> {
  return {
    1: emptyDraft(1),
    2: emptyDraft(2),
    3: emptyDraft(3),
  }
}

function isPassageNumber(n: number): n is IeltsReadingPassageNumber {
  return n === 1 || n === 2 || n === 3
}

function normalizeDrafts(
  raw: unknown,
): Record<IeltsReadingPassageNumber, PersistedPassageDraft> {
  const base = createEmptyReadingWizardDrafts()
  if (!raw || typeof raw !== 'object') return base

  for (const passageNumber of IELTS_READING_PASSAGE_NUMBERS) {
    const entry = (raw as Record<number, unknown>)[passageNumber]
    if (!entry || typeof entry !== 'object') continue
    const d = entry as Partial<PersistedPassageDraft>
    base[passageNumber] = {
      templateKind: (typeof d.templateKind === 'string'
        ? d.templateKind
        : base[passageNumber].templateKind) as IeltsReadingWizardTemplateKind,
      examText: typeof d.examText === 'string' ? d.examText : '',
      part: d.part && typeof d.part === 'object'
        ? (d.part as ReadingImportPartJson)
        : null,
      rawJson: typeof d.rawJson === 'string' ? d.rawJson : '',
      warnings: Array.isArray(d.warnings)
        ? d.warnings.filter((w): w is string => typeof w === 'string')
        : [],
    }
  }
  return base
}

export function loadIeltsReadingWizardDraft(): IeltsReadingWizardDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<IeltsReadingWizardDraft>
    if (parsed.version !== VERSION) return null

    const step = parsed.step === 'passage' || parsed.step === 'preview'
      ? parsed.step
      : 'setup'
    const rawActive = parsed.activePassage ?? 1
    const activePassage: IeltsReadingPassageNumber = isPassageNumber(rawActive) ? rawActive : 1
    const drafts = normalizeDrafts(parsed.drafts)

    const hasContent = Boolean(parsed.answerKey?.trim())
      || IELTS_READING_PASSAGE_NUMBERS.some(n => drafts[n].examText.trim() || drafts[n].part)

    if (!hasContent && step === 'setup') return null

    return {
      version: VERSION,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
      step,
      activePassage,
      title: typeof parsed.title === 'string' ? parsed.title : 'IELTS Reading — Cambridge 10 Test 1',
      cambridge: typeof parsed.cambridge === 'string' ? parsed.cambridge : '10',
      test: typeof parsed.test === 'string' ? parsed.test : '1',
      answerKey: typeof parsed.answerKey === 'string' ? parsed.answerKey : '',
      drafts,
      extraMediaNames: Array.isArray(parsed.extraMediaNames)
        ? parsed.extraMediaNames.filter((n): n is string => typeof n === 'string')
        : [],
    }
  } catch {
    return null
  }
}

export function saveIeltsReadingWizardDraft(draft: IeltsReadingWizardDraft): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...draft,
      savedAt: Date.now(),
    }))
  } catch {
    // localStorage đầy hoặc bị chặn
  }
}

export function clearIeltsReadingWizardDraft(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function hasIeltsReadingWizardDraft(): boolean {
  return loadIeltsReadingWizardDraft() != null
}

export function formatReadingWizardDraftSavedAt(ts: number): string {
  return new Date(ts).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
}

export function countReadingWizardDraftPassages(
  drafts: Record<IeltsReadingPassageNumber, PersistedPassageDraft>,
): number {
  return IELTS_READING_PASSAGE_NUMBERS.filter(n => drafts[n].part != null).length
}