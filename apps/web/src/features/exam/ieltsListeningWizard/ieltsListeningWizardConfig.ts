import type { IeltsListeningP1TemplateKind } from '../ieltsListeningImportTemplates'
import type { IeltsListeningP2TemplateKind } from '../ieltsListeningP2Templates'
import type { IeltsListeningP3TemplateKind } from '../ieltsListeningP3Templates'
import type { IeltsListeningP4TemplateKind } from '../ieltsListeningP4Templates'

export type IeltsWizardPartNumber = 1 | 2 | 3 | 4

export type IeltsListeningWizardTemplateKind =
  | IeltsListeningP1TemplateKind
  | IeltsListeningP2TemplateKind
  | IeltsListeningP3TemplateKind
  | IeltsListeningP4TemplateKind

export const IELTS_WIZARD_PART_RANGES: Record<IeltsWizardPartNumber, [number, number]> = {
  1: [1, 10],
  2: [11, 20],
  3: [21, 30],
  4: [31, 40],
}

export const IELTS_WIZARD_DEFAULT_TEMPLATES: Record<IeltsWizardPartNumber, IeltsListeningWizardTemplateKind> = {
  1: 'p1-hybrid-form-table',
  2: 'p2-a7',
  3: 'p3-c4',
  4: 'p4-d1',
}

export function rangeLabelForPart(partNumber: IeltsWizardPartNumber): string {
  const [from, to] = IELTS_WIZARD_PART_RANGES[partNumber]
  return `Questions ${from}–${to}`
}

export function assertTemplateMatchesPart(
  partNumber: IeltsWizardPartNumber,
  kind: IeltsListeningWizardTemplateKind,
): void {
  const prefix = `p${partNumber}-`
  if (!kind.startsWith(prefix)) {
    throw new Error(`Template "${kind}" không thuộc Part ${partNumber}.`)
  }
}