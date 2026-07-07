import type {
  IeltsReadingPassageNumber,
  IeltsReadingP1TemplateKind,
  IeltsReadingP2TemplateKind,
  IeltsReadingP3TemplateKind,
  IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'

export interface IeltsReadingTemplateOption {
  kind: IeltsReadingWizardTemplateKind
  code: string
  label: string
  description: string
  previewUrl: string
}

export const IELTS_P1_READING_TEMPLATE_OPTIONS: IeltsReadingTemplateOption[] = [
  {
    kind: 'p1-r1-tfng-mc',
    code: 'r1',
    label: 'TFNG + MC',
    description: 'True/False/Not Given + Multiple Choice — Cam10 Test 1 P1.',
    previewUrl: '/ielts-wizard/reading/p1/r1.svg',
  },
  {
    kind: 'p1-r1-notes-tfng',
    code: 'r1n',
    label: 'Notes + TFNG',
    description: 'Notes completion Q1–6 (notePassage) + TFNG Q7–13 — Cam10 Test 4 P1.',
    previewUrl: '/ielts-wizard/reading/p1/Question1_6.jpg',
  },
  {
    kind: 'p1-r1-tfng-gap',
    code: 'r1g',
    label: 'TFNG + Gap',
    description: 'TFNG Q1–7 + gap-fill/sentence completion Q8–13 — Cam9 Test 1 P1.',
    previewUrl: '/ielts-wizard/reading/p1/r1g.svg',
  },
  {
    kind: 'p1-r1-tfng-gap-table',
    code: 'r1t',
    label: 'TFNG + Gap + Table',
    description: 'TFNG Q1–5 + gap Q6–8 + table completion Q9–13 (noteTable) — Cam10 Test 1 P1.',
    previewUrl: '/ielts-wizard/reading/p1/r1t.svg',
  },
  {
    kind: 'p1-r1-headings-mc',
    code: 'r1h',
    label: 'Headings + MC',
    description: 'Matching headings (A–G) + MC — Cam11 Test 3 P1.',
    previewUrl: '/ielts-wizard/reading/p1/r1h.svg',
  },
  {
    kind: 'p1-r1-sentence-mc',
    code: 'r1s',
    label: 'Sentence + MC',
    description: 'Sentence completion Q1–8 + MC Q9–13 — Cam12–16 P1.',
    previewUrl: '/ielts-wizard/reading/p1/r1s.svg',
  },
  {
    kind: 'p1-r1-headings-gap',
    code: 'r1hg',
    label: 'Headings + Gap',
    description: 'Matching headings + gap/sentence completion (không MC) — Cam15+ P1.',
    previewUrl: '/ielts-wizard/reading/p1/r1hg.svg',
  },
  {
    kind: 'p1-r1-gap-mc',
    code: 'r1m',
    label: 'Gap + MC',
    description: 'Gap-fill/sentence completion + MC (không TFNG) — Cam12–14 P1.',
    previewUrl: '/ielts-wizard/reading/p1/r1m.svg',
  },
]

export const IELTS_P2_READING_TEMPLATE_OPTIONS: IeltsReadingTemplateOption[] = [
  {
    kind: 'p2-r2-match-mc',
    code: 'r2',
    label: 'Match đoạn + MC',
    description: 'Matching paragraph + matching features + MC — Cam10 Test 1 P2.',
    previewUrl: '/ielts-wizard/reading/p2/r2.svg',
  },
  {
    kind: 'p2-r2-ynng-match',
    code: 'r2y',
    label: 'YNNG + Match',
    description: 'Yes/No/Not Given + match đoạn + match người + MC — Cam10 Test 4 P2.',
    previewUrl: '/ielts-wizard/reading/p2/r2y.svg',
  },
  {
    kind: 'p2-r2-headings-ynng',
    code: 'r2h',
    label: 'Headings + YNNG',
    description: 'Matching headings + gap-fill + YNNG (views of writer) — Cam9 Test 2 P2.',
    previewUrl: '/ielts-wizard/reading/p2/r2h.svg',
  },
  {
    kind: 'p2-r2-tfng-match',
    code: 'r2t',
    label: 'TFNG + Match',
    description: 'TFNG + match đoạn + match người + MC — Cam13–18 P2.',
    previewUrl: '/ielts-wizard/reading/p2/r2t.svg',
  },
  {
    kind: 'p2-r2-gap-match',
    code: 'r2g',
    label: 'Summary + Match',
    description: 'Summary đoạn văn liền Q14–18 + match người Q19–22 + match đoạn Q23–26 — Cam10 Test 4 P2.',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_1.jpg',
  },
  {
    kind: 'p2-r2-summary-ynng-mc',
    code: 'r2s',
    label: 'Summary + YNNG',
    description: 'Summary (word bank) + YNNG + MC — Cam15–19 P2.',
    previewUrl: '/ielts-wizard/reading/p2/r2s.svg',
  },
]

export const IELTS_P3_READING_TEMPLATE_OPTIONS: IeltsReadingTemplateOption[] = [
  {
    kind: 'p3-r3-tfng-mc',
    code: 'r3',
    label: 'TFNG + MC',
    description: 'TFNG + Multiple Choice — Cam10 Test 1 P3.',
    previewUrl: '/ielts-wizard/reading/p3/r3.svg',
  },
  {
    kind: 'p3-r3-gap-tfng-flow-mc',
    code: 'r3f',
    label: 'Gap + TFNG + Flow',
    description: 'Gap-fill + TFNG + summary/flow-chart (word bank) + MC — Cam9 Test 1 P3.',
    previewUrl: '/ielts-wizard/reading/p3/r3f.svg',
  },
  {
    kind: 'p3-r3-ynng-mc',
    code: 'r3y',
    label: 'YNNG + MC',
    description: 'Yes/No/Not Given + Multiple Choice — passage khó, ý kiến tác giả.',
    previewUrl: '/ielts-wizard/reading/p3/r3y.svg',
  },
  {
    kind: 'p3-r3-gap-ynng-mc',
    code: 'r3gy',
    label: 'Gap + YNNG + MC',
    description: 'Gap/sentence completion + YNNG + MC — Cam11–18 P3 (phổ biến nhất).',
    previewUrl: '/ielts-wizard/reading/p3/r3gy.svg',
  },
  {
    kind: 'p3-r3-summary-ynng-mc',
    code: 'r3sy',
    label: 'Summary + YNNG',
    description: 'Summary (word bank, từng dòng) + YNNG + MC — Cam11–16 P3.',
    previewUrl: '/ielts-wizard/reading/p3/r3sy.svg',
  },
  {
    kind: 'p3-r3-summary-mc-ynng',
    code: 'r3sm',
    label: 'Summary passage + MC',
    description: 'Summary đoạn văn liền (note + 27________) + MC + YNNG — Cam10 Test 2–3 P3.',
    previewUrl: '/ielts-wizard/reading/p3/r3sm.svg',
  },
  {
    kind: 'p3-r3-gap-tfng-mc',
    code: 'r3gt',
    label: 'Gap + TFNG + MC',
    description: 'Gap/sentence completion + TFNG + MC (không flow-chart) — Cam10–14 P3.',
    previewUrl: '/ielts-wizard/reading/p3/r3gt.svg',
  },
  {
    kind: 'p3-r3-match-table-features',
    code: 'r3tb',
    label: 'Match + Table + Features',
    description: 'Match đoạn Q27–29 + table Q30–36 (noteTable) + match người Q37–40 — Cam11 Test 1 P3.',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_1.jpg',
  },
]

const OPTIONS_BY_PASSAGE: Record<IeltsReadingPassageNumber, IeltsReadingTemplateOption[]> = {
  1: IELTS_P1_READING_TEMPLATE_OPTIONS,
  2: IELTS_P2_READING_TEMPLATE_OPTIONS,
  3: IELTS_P3_READING_TEMPLATE_OPTIONS,
}

export function templateOptionsForPassage(passageNumber: IeltsReadingPassageNumber): IeltsReadingTemplateOption[] {
  return OPTIONS_BY_PASSAGE[passageNumber]
}

export function findReadingTemplateOption(
  passageNumber: IeltsReadingPassageNumber,
  kind: IeltsReadingWizardTemplateKind,
): IeltsReadingTemplateOption | undefined {
  return templateOptionsForPassage(passageNumber).find(o => o.kind === kind)
}

export function isKnownReadingTemplateKind(
  passageNumber: IeltsReadingPassageNumber,
  kind: string,
): kind is IeltsReadingWizardTemplateKind {
  return templateOptionsForPassage(passageNumber).some(o => o.kind === kind)
}

export type { IeltsReadingP1TemplateKind, IeltsReadingP2TemplateKind, IeltsReadingP3TemplateKind }