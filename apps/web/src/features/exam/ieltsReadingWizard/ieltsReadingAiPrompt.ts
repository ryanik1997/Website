import { getIeltsReadingWizardTemplatePart } from './ieltsReadingPartTemplates'
import { findReadingTemplateOption } from './ieltsReadingTemplateCatalog'
import {
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
- answer: lowercase cho gap/MC id; TFNG = "true"|"false"|"not-given"; matching = chữ cái đoạn
- explanation: tiếng Việt ngắn
- KHÔNG placeholder; KHÔNG field null thừa
- NGẮT DÒNG: giữ nguyên đoạn văn — không gộp paragraph; mỗi paragraph = 1 block passage
`.trim()

const GROUP_TYPES = `
questionGroups.type (chọn đúng):
- tfng — True/False/Not Given (questions type: true-false-not-given, options TRUE/FALSE/NOT GIVEN)
- matching-paragraph — Which paragraph (paragraphLetters + questions type matching-paragraph)
- matching-features — Match features (features[] + questions)
- multiple-choice — MC A/B/C/D
- gap-fill | sentence-completion | summary-completion — điền từ (wordBank nếu chọn từ list)
`.trim()

function passageExtraRules(
  passageNumber: IeltsReadingPassageNumber,
  templateKind: IeltsReadingWizardTemplateKind,
): string {
  if (templateKind === 'p1-r1-tfng-mc') {
    return '- r1: thường TFNG trước + MC sau; passage không có label hoặc ít label'
  }
  if (templateKind === 'p2-r2-match-mc') {
    return '- r2: passage PHẢI có label A–G; matching-paragraph trước; note "NB You may use any letter more than once" nếu đề có'
  }
  if (templateKind === 'p3-r3-tfng-mc') {
    return '- r3: TFNG + MC; passage dài, ít label'
  }
  return `- Passage ${passageNumber}: theo mẫu SAMPLE`
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
  const [qFrom, qTo] = [1, 13, 14, 26, 27, 40][(passageNumber - 1) * 2] !== undefined
    ? (passageNumber === 1 ? [1, 13] : passageNumber === 2 ? [14, 26] : [27, 40])
    : [1, 13]

  return [
    {
      role: 'system',
      content: [
        `You convert IELTS Academic Reading Passage ${passageNumber} into import JSON for Ryan English app.`,
        `Layout: ${option?.label ?? templateKind} — ${option?.description ?? ''}`,
        COMMON_RULES,
        GROUP_TYPES,
        passageExtraRules(passageNumber, templateKind),
        'Follow SAMPLE PART structure — same fields, nesting, question order.',
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