import { getIeltsReadingWizardTemplatePart } from './ieltsReadingPartTemplates'
import { findReadingTemplateOption } from './ieltsReadingTemplateCatalog'
import {
  IELTS_READING_PASSAGE_RANGES,
  rangeLabelForPassage,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'

const COMMON_RULES = `
RULES CHUNG (bắt buộc):
- Output: { "part": { ...ReadingImportPartJson } } — JSON only
- partNumber, rangeLabel, passageTitle, passage[], questionGroups[]
- passage[]: [{ label?: "A", text: "..." }] — GIỮ paragraph labels A/B/C khi đề có
- questionGroups[]: mỗi nhóm câu = 1 object (type, range, instruction, questions)
- answer: lowercase cho gap/MC id; TFNG = "true"|"false"|"not-given"; YNNG = "yes"|"no"|"not-given"; matching = chữ cái đoạn/heading id
- explanation: tiếng Việt ngắn
- KHÔNG placeholder; KHÔNG field null thừa
- NGẮT DÒNG: giữ nguyên đoạn văn — không gộp paragraph; mỗi paragraph = 1 block passage
- Đủ số câu theo range passage (P1: 1–13, P2: 14–26, P3: 27–40)
`.trim()

const GROUP_TYPES = `
questionGroups.type (chọn đúng):
- tfng — True/False/Not Given (questions type: true-false-not-given, options TRUE/FALSE/NOT GIVEN)
- ynng — Yes/No/Not Given (questions type: yes-no-not-given, options YES/NO/NOT GIVEN) — views of WRITER
- matching-headings — headings[] (id i,ii,iii + label) + questions per paragraph (type matching-headings, answer=heading id)
- matching-paragraph — Which paragraph (paragraphLetters + questions type matching-paragraph)
- matching-features — Match features (features[] + questions)
- multiple-choice — MC A/B/C/D
- gap-fill | sentence-completion — điền từ từ passage (prompt có ___ hoặc câu chưa hoàn chỉnh)
- summary-completion — chọn từ wordBank (flow-chart / summary có bank A–G)
- summary-completion đoạn văn liền (r3sm): questionGroups[].note = full summary + gap 27________ (8 gạch dưới); prompt = "Gap (27)" — KHÔNG imageFile
- gap-fill summary đoạn văn liền (r2g): questionGroups[].note = full summary + gap 14________ … 18________; prompt = "Gap (14)" — KHÔNG imageFile
- table-completion (r1t/r3tb): questionGroups[].noteTable = { title?, headers[], rows[{ cells[][] }] }; ô gap = { type:"gap", number:9 }; static = { type:"static", text:"..." }; xuống dòng = { type:"break" } — KHÔNG imageFile
- notes-completion (r1n): notePassage[] + notesTitle; block = static|section|gap|example; gap { type:"gap", number:1 }; bullet dùng "•"/"–" trong text static — KHÔNG imageFile
`.trim()

function passageExtraRules(
  passageNumber: IeltsReadingPassageNumber,
  templateKind: IeltsReadingWizardTemplateKind,
): string {
  const rules: Record<IeltsReadingWizardTemplateKind, string> = {
    'p1-r1-tfng-mc': [
      '- r1: TFNG trước + MC sau; passage thường không có label hoặc ít label',
      '- TFNG: thông tin trong passage (không phải ý kiến writer)',
    ].join('\n'),
    'p1-r1-notes-tfng': [
      '- Cam10 T4 P1: gap-fill notes Q1–6 + TFNG Q7–13',
      '- notePassage[]: section (• heading), static (– dòng + chữ), gap { type:"gap", number }',
      '- notesTitle: topic trong khung notes (vd. Wildfires); prompt = "Gap (1)"',
    ].join('\n'),
    'p1-r1-tfng-gap-table': [
      '- Cam10 T1 P1: TFNG Q1–5 + gap-fill Q6–8 + table completion Q9–13',
      '- Nhóm table: noteTable.headers (4 cột) + rows[].cells[][] — gap { type:"gap", number } trong ô',
      '- prompt câu gap: "Gap (9)"; answer = từ passage; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-tfng-gap': [
      '- Cam9 P1: TFNG Q1–7 + gap-fill/sentence completion Q8–13',
      '- Gap: NO MORE THAN TWO WORDS (hoặc đúng giới hạn đề); answer lowercase',
      '- passage không label hoặc đoạn liền',
    ].join('\n'),
    'p1-r1-headings-mc': [
      '- Cam11 P1: matching-headings Q1–7 (passage A–G) + MC Q8–13',
      '- headings[] nhiều hơn số paragraph; note "more headings than paragraphs"',
      '- Mỗi câu headings: prompt "Paragraph A" (hoặc B/C…), answer = id heading (i, ii…)',
    ].join('\n'),
    'p1-r1-sentence-mc': [
      '- Sentence completion Q1–8 + MC Q9–13; passage A–G hoặc đoạn liền',
      '- type sentence-completion; ONE/TWO WORDS từ passage; không TFNG đầu',
    ].join('\n'),
    'p1-r1-headings-gap': [
      '- Matching headings Q1–7 + gap/sentence completion Q8–13 (không MC)',
      '- Headings trước; gap sau; đủ 13 câu',
    ].join('\n'),
    'p1-r1-gap-mc': [
      '- Gap-fill hoặc sentence completion Q1–6 + MC Q7–13',
      '- Không TFNG; gap trước MC sau',
    ].join('\n'),
    'p2-r2-match-mc': [
      '- r2: passage PHẢI có label A–G',
      '- matching-paragraph trước; note "NB You may use any letter more than once" nếu đề có',
      '- matching-features (list người A–C) + MC cuối',
    ].join('\n'),
    'p2-r2-ynng-match': [
      '- Cam10 T4 P2: YNNG Q14–18 (views of writer) → matching-paragraph → matching-features → MC',
      '- YNNG: YES/NO/NOT GIVEN — chỉ về quan điểm/ý kiến của WRITER, không phải fact TFNG',
      '- passage có label A–G',
    ].join('\n'),
    'p2-r2-headings-ynng': [
      '- Cam9 T2: matching-headings Q14–17 + gap Q18–20 + YNNG Q21–26',
      '- Headings: ít paragraph hơn P1 (vd. A–D); headings[] đủ dư',
      '- Gap: ONE/TWO WORDS từ passage; YNNG cuối — views of writer',
    ].join('\n'),
    'p2-r2-tfng-match': [
      '- TFNG Q14–18 (facts) → matching-paragraph → matching-features → MC',
      '- Passage label A–G; TFNG về thông tin passage, KHÔNG phải views of writer',
    ].join('\n'),
    'p2-r2-gap-match': [
      '- Cam10 T4 P2: gap-fill summary Q14–18 (note inline) + matching-features Q19–22 + matching-paragraph Q23–26',
      '- Nhóm summary: note = đoạn văn liền, gap = 14________ … 18________; prompt = "Gap (14)"',
      '- Passage A–H; features[] A–G (người); KHÔNG MC; KHÔNG imageFile',
    ].join('\n'),
    'p2-r2-summary-ynng-mc': [
      '- Summary-completion (wordBank) Q14–17 + YNNG Q18–22 + MC Q23–26',
      '- YNNG: views of writer; summary answer = id bank (a, b…)',
    ].join('\n'),
    'p3-r3-tfng-mc': [
      '- r3: TFNG + MC; passage dài, ít label',
      '- TFNG về thông tin passage; MC A/B/C/D',
    ].join('\n'),
    'p3-r3-gap-tfng-flow-mc': [
      '- Cam9 T3: gap/summary Q27–30 + TFNG Q31–33 + summary-completion/flow-chart Q34–39 (wordBank) + MC Q40',
      '- Flow-chart = summary-completion + wordBank[]; answer = id chữ cái bank (a, b…)',
      '- Giữ thứ tự nhóm như SAMPLE; TFNG về facts không phải views',
    ].join('\n'),
    'p3-r3-ynng-mc': [
      '- YNNG Q27–32 (views of writer) + MC Q33–40',
      '- YNNG trước MC; passage dài, có thể nhiều quan điểm tác giả',
    ].join('\n'),
    'p3-r3-gap-ynng-mc': [
      '- Gap/sentence completion Q27–31 + YNNG Q32–36 + MC Q37–40',
      '- Layout phổ biến Cam11–18; YNNG về views of writer',
    ].join('\n'),
    'p3-r3-summary-ynng-mc': [
      '- Summary-completion (wordBank) Q27–31 + YNNG Q32–36 + MC Q37–40',
      '- wordBank[] đủ dư; answer = id chữ cái',
    ].join('\n'),
    'p3-r3-summary-mc-ynng': [
      '- Cam10 T2–3 P3: summary-completion Q27–31 + MC Q32–35 + YNNG Q36–40',
      '- Nhóm summary: note = đoạn văn liền (tiêu đề + paragraphs), gap = 27________ … 31________',
      '- wordBank[] A–L (hoặc A–J); questions prompt = "Gap (27)" …; answer = id bank (a, b…)',
      '- KHÔNG tách summary thành từng dòng prompt; KHÔNG imageFile — hiển thị note inline',
    ].join('\n'),
    'p3-r3-gap-tfng-mc': [
      '- Gap/sentence completion Q27–31 + TFNG Q32–36 + MC Q37–40',
      '- Không flow-chart; TFNG về facts trong passage',
    ].join('\n'),
    'p3-r3-match-table-features': [
      '- Cam11 T1 P3: matching-paragraph Q27–29 + table Q30–36 (noteTable) + matching-features Q37–40',
      '- Passage A–H; table 2 cột Procedure|Aim — noteTable.title + gap trong ô; prompt = "Gap (30)"',
      '- features[] 4 nhà khoa học A–D; KHÔNG MC; KHÔNG imageFile',
    ].join('\n'),
  }

  return rules[templateKind] ?? `- Passage ${passageNumber}: theo mẫu SAMPLE`
}

export function buildIeltsReadingPassageAiMessages(
  passageNumber: IeltsReadingPassageNumber,
  templateKind: IeltsReadingWizardTemplateKind,
  examText: string,
  answerKey: string,
): Array<{ role: 'system' | 'user'; content: string }> {
  const option = findReadingTemplateOption(passageNumber, templateKind)
  const samplePart = getIeltsReadingWizardTemplatePart(passageNumber, templateKind)
  const sampleJson = JSON.stringify(samplePart, null, 2)
  const [qFrom, qTo] = IELTS_READING_PASSAGE_RANGES[passageNumber]

  return [
    {
      role: 'system',
      content: [
        `You convert IELTS Academic Reading Passage ${passageNumber} into import JSON for Ryan English app.`,
        `Layout: ${option?.label ?? templateKind} — ${option?.description ?? ''}`,
        COMMON_RULES,
        GROUP_TYPES,
        passageExtraRules(passageNumber, templateKind),
        'Follow SAMPLE PART structure — same fields, nesting, question order, group types.',
        'Return valid JSON only.',
      ].join('\n\n'),
    },
    {
      role: 'user',
      content: [
        'SAMPLE PASSAGE (schema — replace content, keep structure):',
        '```json',
        sampleJson,
        '```',
        '',
        `ANSWER KEY (questions ${qFrom}–${qTo}):`,
        answerKey.trim() || '(chưa có — suy từ đề)',
        '',
        `EXAM TEXT (Reading Passage ${passageNumber} — passage + questions):`,
        examText.trim(),
        '',
        `Generate { "part": { ... } } — partNumber: ${passageNumber}, rangeLabel: "Read the text and answer ${rangeLabelForPassage(passageNumber).toLowerCase()}."`,
      ].join('\n'),
    },
  ]
}