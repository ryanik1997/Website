export type IeltsReadingPassageNumber = 1 | 2 | 3

export type IeltsReadingP1TemplateKind =
  | 'p1-r1-tfng-mc'
  | 'p1-r1-tfng-gap'
  | 'p1-r1-headings-mc'
  | 'p1-r1-sentence-mc'
  | 'p1-r1-headings-gap'
  | 'p1-r1-gap-mc'
  | 'p1-r1-tfng-gap-table'
  | 'p1-r1-notes-tfng'
  | 'p1-r1-tfng-match-notes'
  | 'p1-r1-tfng-match-summary'
  | 'p1-r1-match-choose-two'
  | 'p1-r1-headings-notes'
  | 'p1-r1-notes-tfng-8'
  | 'p1-r1-table-tfng'

export type IeltsReadingP2TemplateKind =
  | 'p2-r2-match-mc'
  | 'p2-r2-ynng-match'
  | 'p2-r2-headings-ynng'
  | 'p2-r2-tfng-match'
  | 'p2-r2-gap-match'
  | 'p2-r2-headings-summary-mc'
  | 'p2-r2-summary-ynng-mc'
  | 'p2-r2-tfng-endings-summary'
  | 'p2-r2-mc-tfng-endings'
  | 'p2-r2-tfng-diagram'
  | 'p2-r2-headings-tfng-sentence'
  | 'p2-r2-mc-summary-ynng'
  | 'p2-r2-headings-match-summary'

export type IeltsReadingP3TemplateKind =
  | 'p3-r3-tfng-mc'
  | 'p3-r3-gap-tfng-flow-mc'
  | 'p3-r3-ynng-mc'
  | 'p3-r3-gap-ynng-mc'
  | 'p3-r3-summary-ynng-mc'
  | 'p3-r3-summary-mc-ynng'
  | 'p3-r3-gap-tfng-mc'
  | 'p3-r3-match-table-features'
  | 'p3-r3-mc-summary-ynng'
  | 'p3-r3-match-paragraph-sentence'
  | 'p3-r3-headings-summary-ynng'
  | 'p3-r3-headings-gap-ynng'
  | 'p3-r3-table-ynng-match'
  | 'p3-r3-summary-mc-endings'

export type IeltsReadingWizardTemplateKind =
  | IeltsReadingP1TemplateKind
  | IeltsReadingP2TemplateKind
  | IeltsReadingP3TemplateKind

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