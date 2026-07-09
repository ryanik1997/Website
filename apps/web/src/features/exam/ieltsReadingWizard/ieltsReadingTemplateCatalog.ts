import {
  IELTS_READING_DEFAULT_TEMPLATES,
  type IeltsReadingPassageNumber,
  type IeltsReadingP1TemplateKind,
  type IeltsReadingP2TemplateKind,
  type IeltsReadingP3TemplateKind,
  type IeltsReadingWizardTemplateKind,
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
  {
    kind: 'p1-r1-tfng-match-notes',
    code: 'r1f',
    label: 'TFNG + Match + Notes',
    description: 'TFNG Q1–4 + matching features Q5–8 + note completion Q9–13 — Cam11 Test 2 P1 (Mary Rose).',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_1.jpg',
  },
  {
    kind: 'p1-r1-tfng-match-summary',
    code: 'r1ts',
    label: 'TFNG + Match + Summary',
    description: 'TFNG Q1–4 + matching features Q5–9 + summary word bank A–F Q10–13 — Cam11 Test 4 P1 (Research using twins).',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_2.jpg',
  },
  {
    kind: 'p1-r1-match-choose-two',
    code: 'r1ct',
    label: 'Match + Choose TWO',
    description: 'Match paragraph Q1–3 + match people Q4–9 + Choose TWO Q10–13 — Cam12 Test 6 P1 (Agriculture risks).',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_3.jpg',
  },
  {
    kind: 'p1-r1-headings-notes',
    code: 'r1hn',
    label: 'Headings + Notes',
    description: 'Matching headings Q1–7 (A–G) + note completion Q8–13 (notePassage) — Cam12 Test 5 P1 (Flying tortoises).',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_4.jpg',
  },
  {
    kind: 'p1-r1-notes-tfng-8',
    code: 'r1n8',
    label: 'Notes (8) + TFNG',
    description: 'Note completion Q1–8 (notePassage, ONE WORD) + TFNG Q9–13 — Cam12 Test 8 P1 (The history of glass).',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_5.jpg',
  },
  {
    kind: 'p1-r1-table-tfng',
    code: 'r1tt',
    label: 'Table + TFNG',
    description: 'Table completion Q1–8 (noteTable 3 cột, merge ô) + TFNG Q9–13 — Cam13 T4 P1 (Coconut palm); hỗ trợ bảng 2 cột không merge.',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_7.jpg',
  },
  {
    kind: 'p1-r1-match-ynng-features',
    code: 'r1my',
    label: 'Match đoạn + YNNG + Features',
    description: 'Which section Q1–3 (A–J) + YNNG Q4–6 (claims of writer) + matching features A–C Q7–13 — Cam intelligence theories (Hamiltonian/Jeffersonian/Jacksonian).',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_8.jpg',
  },
  {
    kind: 'p1-r1-notes-tfng-table',
    code: 'r1nt',
    label: 'Notes + TFNG + Table',
    description: 'Notes ONE WORD Q1–4 (notePassage như r1n8) + TFNG Q5–7 + table Q8–13 (noteTable merge như r1tt) — Cam (Nutmeg).',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_9.jpg',
  },
  {
    kind: 'p1-r1-notes-table-tfng',
    code: 'r1ntf',
    label: 'Notes + Table + TFNG',
    description: 'Notes ONE WORD Q1–5 (notePassage) + table TWO WORDS Q6–8 (noteTable) + TFNG Q9–13 — Cam (Huarango tree).',
    previewUrl: '/ielts-wizard/reading/p1/Teamplate_Part1_10.jpg',
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
    kind: 'p2-r2-headings-summary-mc',
    code: 'r2hm',
    label: 'Headings + Summary + MC',
    description: 'Matching headings Q14–20 + summary ONE WORD Q21–24 + Choose TWO Q25–26 — Cam11 Test 4 P2.',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_3.jpg',
  },
  {
    kind: 'p2-r2-summary-ynng-mc',
    code: 'r2s',
    label: 'Summary + YNNG',
    description: 'Summary (word bank) + YNNG + MC — Cam15–19 P2.',
    previewUrl: '/ielts-wizard/reading/p2/r2s.svg',
  },
  {
    kind: 'p2-r2-tfng-endings-summary',
    code: 'r2te',
    label: 'TFNG + Endings + Summary',
    description: 'TFNG Q14–18 + matching sentence endings A–G Q19–22 + summary ONE WORD Q23–26 — Cam11 Test 3 P2 (Great Migrations).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_4.jpg',
  },
  {
    kind: 'p2-r2-mc-tfng-endings',
    code: 'r2fs',
    label: 'MC + TFNG + Endings',
    description: 'Multiple choice Q14–18 + TFNG Q19–23 + matching sentence endings A–E Q24–26 — Cam11 Test 4 P2 (An Introduction to Film Sound).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_6.jpg',
  },
  {
    kind: 'p2-r2-tfng-diagram',
    code: 'r2fw',
    label: 'TFNG + Diagram',
    description: 'TFNG Q14–19 + diagram labeling ONE WORD Q20–26 — Cam11 Test 1 P2 (The Falkirk Wheel).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_2.jpg',
  },
  {
    kind: 'p2-r2-headings-tfng-sentence',
    code: 'r2hl',
    label: 'Headings + TFNG + Sentence',
    description: 'Matching headings Q14–20 + TFNG Q21–24 + sentence completion ONE WORD Q25–26 — Cam12 Test 8 P2 (The Lost City).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_7.jpg',
  },
  {
    kind: 'p2-r2-mc-summary-ynng',
    code: 'r2ms',
    label: 'MC + Summary + YNNG',
    description: 'Multiple choice Q14–18 + summary word bank A–F Q19–22 + YNNG Q23–26 — Cam12 Test 8 P2 (Bring back the big cats).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_8.jpg',
  },
  {
    kind: 'p2-r2-headings-match-summary',
    code: 'r2hms',
    label: 'Headings + Match + Summary',
    description: 'Matching headings Q14–19 (A–F) + match ideas Q20–23 + summary ONE WORD Q24–26 — Cam13 Test 1 P2 (Boredom).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_9.jpg',
  },
  {
    kind: 'p2-r2-match-choose-two-summary',
    code: 'r2cs',
    label: 'Match đoạn + Choose TWO + Summary',
    description: 'Which section Q14–18 + 2× Choose TWO Q19–22 + summary ONE WORD Q23–26 — Cam14 Test 1 P2 (Bike-sharing).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_10.jpg',
  },
  {
    kind: 'p2-r2-match-tfng-choose-two',
    code: 'r2mt',
    label: 'Match đoạn + TFNG + Choose TWO',
    description: 'Which section Q14–17 (A–G) + TFNG Q18–22 + Choose TWO Q23–24 — Cam (Zoos / animals in captivity).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_11.jpg',
  },
  {
    kind: 'p2-r2-tfng-notes',
    code: 'r2tn',
    label: 'TFNG + Notes',
    description: 'TFNG Q14–19 + notes ONE WORD Q20–26 (notePassage, section headings) — Cam (Silbo Gomero).',
    previewUrl: '/ielts-wizard/reading/p2/Teamplate_Part2_12.jpg',
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
  {
    kind: 'p3-r3-mc-summary-ynng',
    code: 'r3my',
    label: 'MC + Summary + YNNG',
    description: 'Multiple choice Q27–30 + summary word bank Q31–33 + YNNG Q34–39 — Cam11 Test 2 P3 (Art and the Brain).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_2.jpg',
  },
  {
    kind: 'p3-r3-match-paragraph-sentence',
    code: 'r3ps',
    label: 'Match đoạn + Sentence',
    description: 'Matching paragraph Q27–34 (A–G) + sentence completion ONE WORD Q35–40 — Cam11 Test 3 P3 (Mathematical Reasoning).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_3.jpg',
  },
  {
    kind: 'p3-r3-headings-summary-ynng',
    code: 'r3hy',
    label: 'Headings + Summary + YNNG',
    description: 'Matching headings Q27–32 (A–F) + summary word bank Q33–36 + YNNG Q37–40 — Cam11 Test 4 P3 (This Marvellous Invention).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_4.jpg',
  },
  {
    kind: 'p3-r3-headings-gap-ynng',
    code: 'r3ag',
    label: 'Headings + Gap + YNNG',
    description: 'Matching headings Q27–32 (A–F) + summary TWO WORDS Q33–36 + YNNG Q37–40 — Cam12 Test 5 P3 (What\'s the Purpose of Gaining Knowledge).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_5.jpg',
  },
  {
    kind: 'p3-r3-headings-mc-ynng',
    code: 'r3hmy',
    label: 'Headings + MC + YNNG',
    description: 'Matching headings Q27–32 (A–F, i–viii) + MC A–D Q33–35 + YNNG Q36–40 (claims of writer) — Cam (AI attitudes).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_11.jpg',
  },
  {
    kind: 'p3-r3-table-ynng-match',
    code: 'r3ty',
    label: 'Table + YNNG + Match',
    description: 'Table completion Q27–31 (Test|Findings) + YNNG Q32–36 + match đoạn Q37–40 (A–G) — Cam12 Test 2 P3 (The Benefits of Being Bilingual).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_6.jpg',
  },
  {
    kind: 'p3-r3-summary-mc-endings',
    code: 'r3se',
    label: 'Summary + MC + Endings',
    description: 'Summary TWO WORDS Q27–31 + MC A–D Q32–36 + sentence endings Q37–40 — Cam12 Test 3 P3 (The Montreal Study / Music and the emotions).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_7.jpg',
  },
  {
    kind: 'p3-r3-features-ynng-summary',
    code: 'r3fy',
    label: 'Features + YNNG + Summary',
    description: 'Matching features Q27–31 (người A–G) + YNNG Q32–36 (claims of writer) + summary ONE WORD Q37–40 — Cam (Guided play / children\'s play).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_8.jpg',
  },
  {
    kind: 'p3-r3-tfng-notes-mc',
    code: 'r3tn',
    label: 'TFNG + Notes + MC',
    description: 'TFNG Q27–33 + notes ONE WORD Q34–39 (notePassage như r1n8) + MC title Q40 — Cam14 T4 P3 (Marine debris / Rochman).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_9.jpg',
  },
  {
    kind: 'p3-r3-endings-summary-mc',
    code: 'r3em',
    label: 'Endings + Summary bank + MC',
    description: 'Sentence endings A–F Q27–31 + summary word bank A–I Q32–36 + MC A–D Q37–40 — Cam (Fairy tales / Tehrani / Little Red Riding Hood).',
    previewUrl: '/ielts-wizard/reading/p3/Teamplate_Part3_10.jpg',
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

/** Nhẹ — dùng khi load ExamTrackPage / persist nháp; không kéo ieltsReadingPartTemplates. */
export function resolveReadingTemplateKind(
  passageNumber: IeltsReadingPassageNumber,
  kind: string,
): IeltsReadingWizardTemplateKind {
  if (isKnownReadingTemplateKind(passageNumber, kind)) {
    return kind
  }
  return IELTS_READING_DEFAULT_TEMPLATES[passageNumber]
}

export type { IeltsReadingP1TemplateKind, IeltsReadingP2TemplateKind, IeltsReadingP3TemplateKind }