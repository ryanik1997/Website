export type IeltsReadingPassageNumber = 1 | 2 | 3

export type IeltsReadingWizardTemplateKind =
  | 'p1-r1-tfng-mc'
  | 'p2-r2-match-mc'
  | 'p3-r3-tfng-mc'

/** Số câu điển hình — đề thật có thể 13/13/14 hoặc 14/13/13. */
export const IELTS_READING_PASSAGE_RANGES: Record<IeltsReadingPassageNumber, [number, number]> = {
  1: [1, 13],
  2: [14, 26],
  3: [27, 40],
}

export const IELTS_READING_DEFAULT_TEMPLATES: Record<IeltsReadingPassageNumber, IeltsReadingWizardTemplateKind> = {
  1: 'p1-r1-tfng-mc',
  2: 'p2-r2-match-mc',
  3: 'p3-r3-tfng-mc',
}

export const IELTS_READING_PASSAGE_NUMBERS: IeltsReadingPassageNumber[] = [1, 2, 3]

export function rangeLabelForPassage(passageNumber: IeltsReadingPassageNumber): string {
  const [from, to] = IELTS_READING_PASSAGE_RANGES[passageNumber]
  return `Questions ${from}–${to}`
}

export function assertTemplateMatchesPassage(
  passageNumber: IeltsReadingPassageNumber,
  kind: IeltsReadingWizardTemplateKind,
): void {
  const prefix = `p${passageNumber}-`
  if (!kind.startsWith(prefix)) {
    throw new Error(`Template "${kind}" không thuộc Passage ${passageNumber}.`)
  }
}