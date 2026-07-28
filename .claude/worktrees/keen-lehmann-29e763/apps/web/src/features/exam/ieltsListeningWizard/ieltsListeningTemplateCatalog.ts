import type { IeltsListeningP1TemplateKind } from '../ieltsListeningImportTemplates'
import type { IeltsListeningP2TemplateKind } from '../ieltsListeningP2Templates'
import type { IeltsListeningP3TemplateKind } from '../ieltsListeningP3Templates'
import type { IeltsListeningP4TemplateKind } from '../ieltsListeningP4Templates'
import type {
  IeltsListeningWizardTemplateKind,
  IeltsWizardPartNumber,
} from './ieltsListeningWizardConfig'

export interface IeltsWizardTemplateOption {
  kind: IeltsListeningWizardTemplateKind
  code: string
  label: string
  description: string
  previewUrl: string
}

export const IELTS_P1_TEMPLATE_OPTIONS: IeltsWizardTemplateOption[] = [
  {
    kind: 'p1-hybrid-form-table',
    code: 'a1',
    label: 'Form + Bảng (a1)',
    description: 'Notes/form Q1–6 + bảng Q7–10 — Cam10 Test 1.',
    previewUrl: '/ielts-wizard/p1/a1-hybrid.jpg',
  },
  {
    kind: 'p1-table',
    code: 'a2',
    label: 'Bảng (a2)',
    description: 'Table completion — gap trong ô bảng.',
    previewUrl: '/ielts-wizard/p1/a2.jpg',
  },
  {
    kind: 'p1-form',
    code: 'a3',
    label: 'Form / Notes (a3)',
    description: 'Form + Example + bullet • — notePassage.',
    previewUrl: '/ielts-wizard/p1/a3.jpg',
  },
  {
    kind: 'p1-mixed-a4',
    code: 'a4',
    label: 'Bảng + Choose TWO (a4)',
    description: 'Bảng Q1–4 → Choose TWO Q5–6 → bảng Q7–10.',
    previewUrl: '/ielts-wizard/p1/a4.jpg',
  },
  {
    kind: 'p1-mixed-a5',
    code: 'a5',
    label: 'MC + Notes (a5)',
    description: 'MC Q1–6 + sentence completion Q7–10.',
    previewUrl: '/ielts-wizard/p1/a5.jpg',
  },
  {
    kind: 'p1-hybrid-a6',
    code: 'a6',
    label: 'Form + Bảng (a6)',
    description: 'Form Q1–6 + bảng 3 cột Q7–10 ONE WORD — Cam10 Thorndyke.',
    previewUrl: '/ielts-wizard/p1/a6.jpg',
  },
]

export const IELTS_P2_TEMPLATE_OPTIONS: IeltsWizardTemplateOption[] = [
  { kind: 'p2-a6', code: 'a6', label: 'Bảng+MC+Map', description: 'Table + MC + Map labelling.', previewUrl: '/ielts-wizard/p2/a6.jpg' },
  { kind: 'p2-a7', code: 'a7', label: 'Notes+MC+TWO', description: 'Notes + MC + Choose TWO — Cam9.', previewUrl: '/ielts-wizard/p2/a7.jpg' },
  { kind: 'p2-a8', code: 'a8', label: 'MC+Match+Bảng', description: 'MC + Matching + Table.', previewUrl: '/ielts-wizard/p2/a8.jpg' },
  { kind: 'p2-a9', code: 'a9', label: 'Diagram+Match', description: 'Diagram + Matching + Notes.', previewUrl: '/ielts-wizard/p2/a9.jpg' },
  { kind: 'p2-a10', code: 'a10', label: 'MC+TWO×2', description: 'MC + Choose TWO ×2 — Cam20.', previewUrl: '/ielts-wizard/p2/a10.jpg' },
  { kind: 'p2-a11', code: 'a11', label: 'Match+MC', description: 'Matching + MC.', previewUrl: '/ielts-wizard/p2/a11.jpg' },
  { kind: 'p2-a12', code: 'a12', label: 'MC+Map', description: 'MC + Map labelling.', previewUrl: '/ielts-wizard/p2/a12.jpg' },
  { kind: 'p2-a13', code: 'a13', label: 'TWO×2+Match', description: 'Choose TWO ×2 + Matching.', previewUrl: '/ielts-wizard/p2/a13.jpg' },
  { kind: 'p2-a14', code: 'a14', label: 'MC+Map (2)', description: 'MC + Map — biến thể.', previewUrl: '/ielts-wizard/p2/a14.jpg' },
  { kind: 'p2-a15', code: 'a15', label: 'MC+Bảng', description: 'MC Q11–15 + bảng 3 cột Q16–20 — Cam10 Manham.', previewUrl: '/ielts-wizard/p2/a15.jpg' },
]

export const IELTS_P3_TEMPLATE_OPTIONS: IeltsWizardTemplateOption[] = [
  { kind: 'p3-c1', code: 'c1', label: 'MC+Sent+Notes', description: 'MC + sentences + notes.', previewUrl: '/ielts-wizard/p3/c1.jpg' },
  { kind: 'p3-c2', code: 'c2', label: 'Notes+Table', description: 'Notes + table + notes.', previewUrl: '/ielts-wizard/p3/c2.jpg' },
  { kind: 'p3-c3', code: 'c3', label: 'TWO×2+MC', description: 'Choose TWO ×2 + MC — Cam20.', previewUrl: '/ielts-wizard/p3/c3.jpg' },
  { kind: 'p3-c4', code: 'c4', label: 'MC+Match', description: 'MC + Matching A–G.', previewUrl: '/ielts-wizard/p3/c4.jpg' },
  { kind: 'p3-c5', code: 'c5', label: 'TWO×2+Match', description: 'Choose TWO ×2 + Matching.', previewUrl: '/ielts-wizard/p3/c5.jpg' },
  { kind: 'p3-c6', code: 'c6', label: 'MC+Flow', description: 'MC + Flow-chart.', previewUrl: '/ielts-wizard/p3/c6.jpg' },
  { kind: 'p3-c7', code: 'c7', label: 'Table+Match', description: 'Table + Matching.', previewUrl: '/ielts-wizard/p3/c7.jpg' },
]

export const IELTS_P4_TEMPLATE_OPTIONS: IeltsWizardTemplateOption[] = [
  { kind: 'p4-d1', code: 'd1', label: 'Sections+bullets', description: 'Lecture notes — sections + • — Cam9.', previewUrl: '/ielts-wizard/p4/lecture.jpg' },
  { kind: 'p4-d2', code: 'd2', label: 'ONE WORD', description: 'ONE WORD ONLY — split sentence — Cam20.', previewUrl: '/ielts-wizard/p4/lecture.jpg' },
  { kind: 'p4-d3', code: 'd3', label: 'Generic lecture', description: 'Lecture notes — THREE WORDS/NUMBER.', previewUrl: '/ielts-wizard/p4/lecture.jpg' },
  { kind: 'p4-d4', code: 'd4', label: 'MC+Notes', description: 'MC Q31–33 + lecture notes ONE WORD — Cam10 Nanotechnology.', previewUrl: '/ielts-wizard/p4/d4.jpg' },
]

const OPTIONS_BY_PART: Record<IeltsWizardPartNumber, IeltsWizardTemplateOption[]> = {
  1: IELTS_P1_TEMPLATE_OPTIONS,
  2: IELTS_P2_TEMPLATE_OPTIONS,
  3: IELTS_P3_TEMPLATE_OPTIONS,
  4: IELTS_P4_TEMPLATE_OPTIONS,
}

export function templateOptionsForPart(partNumber: IeltsWizardPartNumber): IeltsWizardTemplateOption[] {
  return OPTIONS_BY_PART[partNumber]
}

export function findWizardTemplateOption(
  partNumber: IeltsWizardPartNumber,
  kind: IeltsListeningWizardTemplateKind,
): IeltsWizardTemplateOption {
  const found = templateOptionsForPart(partNumber).find(o => o.kind === kind)
  if (!found) throw new Error(`Unknown Part ${partNumber} template: ${kind}`)
  return found
}

/** @deprecated use findWizardTemplateOption(1, kind) */
export function findP1TemplateOption(kind: IeltsListeningP1TemplateKind): IeltsWizardTemplateOption {
  return findWizardTemplateOption(1, kind)
}

export type { IeltsListeningP1TemplateKind }