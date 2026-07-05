import type { IeltsReadingPassageNumber, IeltsReadingWizardTemplateKind } from './ieltsReadingWizardConfig'

export interface IeltsReadingTemplateOption {
  kind: IeltsReadingWizardTemplateKind
  code: string
  label: string
  description: string
}

const CATALOG: IeltsReadingTemplateOption[] = [
  {
    kind: 'p1-r1-tfng-mc',
    code: 'r1',
    label: 'TFNG + MC',
    description: 'Passage 1: True/False/Not Given + Multiple Choice (vd. Cam 9–11 P1).',
  },
  {
    kind: 'p2-r2-match-mc',
    code: 'r2',
    label: 'Match đoạn + MC',
    description: 'Passage 2: Matching paragraph (A–G) + Multiple Choice.',
  },
  {
    kind: 'p3-r3-tfng-mc',
    code: 'r3',
    label: 'TFNG + MC (dài)',
    description: 'Passage 3: TFNG + MC — thường gặp ở passage khó.',
  },
]

export function templateOptionsForPassage(passageNumber: IeltsReadingPassageNumber): IeltsReadingTemplateOption[] {
  const prefix = `p${passageNumber}-`
  return CATALOG.filter(o => o.kind.startsWith(prefix))
}

export function findReadingTemplateOption(
  passageNumber: IeltsReadingPassageNumber,
  kind: IeltsReadingWizardTemplateKind,
): IeltsReadingTemplateOption | undefined {
  return templateOptionsForPassage(passageNumber).find(o => o.kind === kind)
}