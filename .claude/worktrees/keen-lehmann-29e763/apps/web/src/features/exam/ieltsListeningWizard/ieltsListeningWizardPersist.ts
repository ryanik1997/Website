import type { ListeningImportPartJson } from '../importListeningUtils'
import {
  IELTS_WIZARD_DEFAULT_TEMPLATES,
  type IeltsListeningWizardTemplateKind,
  type IeltsWizardPartNumber,
} from './ieltsListeningWizardConfig'

const STORAGE_KEY = 'ielts-listening-import-wizard-draft'
const VERSION = 1 as const

export type WizardPersistStep = 'setup' | 'part' | 'preview'

export interface PersistedPartDraft {
  templateKind: IeltsListeningWizardTemplateKind
  examText: string
  part: ListeningImportPartJson | null
  rawJson: string
  warnings: string[]
}

export interface IeltsListeningWizardDraft {
  version: typeof VERSION
  savedAt: number
  step: WizardPersistStep
  activePart: IeltsWizardPartNumber
  title: string
  cambridge: string
  test: string
  answerKey: string
  drafts: Record<IeltsWizardPartNumber, PersistedPartDraft>
  audioFileName: string | null
  extraMediaNames: string[]
}

const PART_NUMBERS: IeltsWizardPartNumber[] = [1, 2, 3, 4]

function emptyDraft(partNumber: IeltsWizardPartNumber): PersistedPartDraft {
  return {
    templateKind: IELTS_WIZARD_DEFAULT_TEMPLATES[partNumber],
    examText: '',
    part: null,
    rawJson: '',
    warnings: [],
  }
}

export function createEmptyWizardDrafts(): Record<IeltsWizardPartNumber, PersistedPartDraft> {
  return {
    1: emptyDraft(1),
    2: emptyDraft(2),
    3: emptyDraft(3),
    4: emptyDraft(4),
  }
}

function isWizardPartNumber(n: number): n is IeltsWizardPartNumber {
  return n === 1 || n === 2 || n === 3 || n === 4
}

function normalizeDrafts(
  raw: unknown,
): Record<IeltsWizardPartNumber, PersistedPartDraft> {
  const base = createEmptyWizardDrafts()
  if (!raw || typeof raw !== 'object') return base

  for (const partNumber of PART_NUMBERS) {
    const entry = (raw as Record<number, unknown>)[partNumber]
    if (!entry || typeof entry !== 'object') continue
    const d = entry as Partial<PersistedPartDraft>
    base[partNumber] = {
      templateKind: (typeof d.templateKind === 'string'
        ? d.templateKind
        : base[partNumber].templateKind) as IeltsListeningWizardTemplateKind,
      examText: typeof d.examText === 'string' ? d.examText : '',
      part: d.part && typeof d.part === 'object'
        ? (d.part as ListeningImportPartJson)
        : null,
      rawJson: typeof d.rawJson === 'string' ? d.rawJson : '',
      warnings: Array.isArray(d.warnings)
        ? d.warnings.filter((w): w is string => typeof w === 'string')
        : [],
    }
  }
  return base
}

export function loadIeltsListeningWizardDraft(): IeltsListeningWizardDraft | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<IeltsListeningWizardDraft>
    if (parsed.version !== VERSION) return null

    const step = parsed.step === 'part' || parsed.step === 'preview'
      ? parsed.step
      : 'setup'
    const rawActivePart = parsed.activePart ?? 1
    const activePart: IeltsWizardPartNumber = isWizardPartNumber(rawActivePart) ? rawActivePart : 1

    const drafts = normalizeDrafts(parsed.drafts)
    const hasContent = Boolean(
      parsed.title?.trim()
      || parsed.answerKey?.trim()
      || PART_NUMBERS.some(n => drafts[n].examText.trim() || drafts[n].part),
    )
    if (!hasContent) return null

    return {
      version: VERSION,
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
      step,
      activePart,
      title: typeof parsed.title === 'string' ? parsed.title : '',
      cambridge: typeof parsed.cambridge === 'string' ? parsed.cambridge : '',
      test: typeof parsed.test === 'string' ? parsed.test : '',
      answerKey: typeof parsed.answerKey === 'string' ? parsed.answerKey : '',
      drafts,
      audioFileName: typeof parsed.audioFileName === 'string' ? parsed.audioFileName : null,
      extraMediaNames: Array.isArray(parsed.extraMediaNames)
        ? parsed.extraMediaNames.filter((n): n is string => typeof n === 'string')
        : [],
    }
  } catch {
    return null
  }
}

export function saveIeltsListeningWizardDraft(draft: IeltsListeningWizardDraft): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...draft,
      version: VERSION,
      savedAt: Date.now(),
    }))
  } catch {
    // localStorage đầy hoặc bị chặn — không chặn wizard.
  }
}

export function clearIeltsListeningWizardDraft(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function hasIeltsListeningWizardDraft(): boolean {
  return loadIeltsListeningWizardDraft() != null
}

export function formatWizardDraftSavedAt(savedAt: number): string {
  return new Date(savedAt).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function countWizardDraftParts(
  drafts: Record<IeltsWizardPartNumber, PersistedPartDraft>,
): number {
  return PART_NUMBERS.filter(n => drafts[n].part != null).length
}