import { getIeltsListeningWizardTemplatePart } from './ieltsListeningPartTemplates'
import { findWizardTemplateOption } from './ieltsListeningTemplateCatalog'
import {
  IELTS_WIZARD_PART_RANGES,
  rangeLabelForPart,
  type IeltsListeningWizardTemplateKind,
  type IeltsWizardPartNumber,
} from './ieltsListeningWizardConfig'

const COMMON_RULES = `
RULES CHUNG (bắt buộc):
- Output: { "part": { ...ListeningImportPartJson } } — JSON only
- audioFile: "listening.mp3"
- Đúng 10 câu trong range của Part — không thiếu, không trùng số
- answer: lowercase (gap-fill); MC/matching = chữ cái; Choose TWO = "A/E" hoặc "C/E"
- explanation: tiếng Việt ngắn
- KHÔNG prompt "placeholder"; KHÔNG field null thừa
- Choose TWO: type "matching", 2 câu LIÊN TIẾP, cùng prompt, options A–E nhãn ĐẦY ĐỦ
- Map labelling: mapLabel: true, imageFile: "map.jpg" trên part hoặc câu
- Diagram: diagramLabel: true, imageFile: "diagram.jpg"
- Flow-chart: flowChart: true, flowChartEnd khi mẫu có
- NGẮT DÒNG (quan trọng): 1 dòng trong text Word user dán = 1 block static riêng (hoặc example/section)
- KHÔNG gộp nhiều dòng đề thành 1 block; KHÔNG chèn \\n trong 1 block để tách dòng giả
- Đoạn nối trên CÙNG dòng đề giấy (sau gap, trong ngoặc, tên riêng…) vẫn là block riêng — app tự gom khi hiển thị
- Có xuống dòng trong Word = 2 block; cùng 1 dòng Word = không tách/block-merge
- sectionTitle: KHÔNG lặp passageTitle trên mọi câu — passageTitle 1 lần ở part; sectionTitle chỉ khi nhóm con khác (vd. noteTables.title)
- MC/map trước notes: MC/map KHÔNG có sectionTitle; gap notes có sectionTitle chỉ nếu khác passageTitle
`.trim()

const P1_EXTRA = `
PART 1:
- notePassage blocks: static | section | gap | example; bullet •
- Hybrid a1/a6: notePassageSections (Q1–6) + noteTables (Q7–10), layout "form"
- notePassageSections: [{ gapNumbers, instruction, title, blocks }] — KHÔNG { type, text, blocks } per field
- a6: form label (Name:, Address:), Example block; bảng 3 cột Area | Work to be done | Notes; ONE WORD cả part
- Includes column: type "break" giữa bullet (a1)
`.trim()

const P2_EXTRA = `
PART 2:
- Monologue — có thể có passageTitle, notePassage, noteTable, noteTables
- MC: 3 options A/B/C hoặc A–E tùy đề
- sectionRange + sectionInstruction trên câu đầu mỗi nhóm
- a15: MC Q11–15 + noteTables Q16–20, layout "table", 3 cột (Place | Features | Advice)
`.trim()

const P3_EXTRA = `
PART 3:
- Conversation 2–4 người — có thể notePassageSections nhiều khối
- Matching A–G: options đủ nhãn, answer một chữ cái
`.trim()

const P4_EXTRA = `
PART 4:
- Lecture — passageTitle, notePassage: static | section | gap
- GIỮ section headings đề gốc (vd. "Leaders", "Conclusion", "The Chronic Factor")
- GIỮ static bullets KHÔNG có gap (vd. "inspire promotion focus in followers", Prevention/Conclusion lines)
- Q40 thường nằm dưới section "Conclusion" — kèm 2 dòng kết sau gap 40
- wordLimit theo instruction (thường 1)
- d4: MC Q31–33 (multiple-choice) + notePassage Q34–40; passageTitle cho nhóm notes
`.trim()

function partExtraRules(
  partNumber: IeltsWizardPartNumber,
  templateKind: IeltsListeningWizardTemplateKind,
): string {
  if (partNumber === 1) {
    if (templateKind === 'p1-hybrid-a6') {
      return [
        P1_EXTRA,
        '- a6: sectionTitle "THORNDYKE\'S BUILDERS" trên câu 1 + notePassageSections.title — hiển thị 1 lần trong box',
        '- a6: GIỮ dòng Phone number (static, không gap); Kitchen lặp 2 hàng trong bảng',
        '- a6 Address: MỖI đoạn = 1 block static riêng theo đúng dòng đề gốc:',
        '  "Address: Flat 4," → gap 2 → "Park Flats" → "(Behind the" → gap 3 → ")"',
        '  KHÔNG gộp "Park Flats (Behind the" hay xuống dòng \\n trong 1 block',
        '  GIỮ nguyên thứ tự từng dòng như text Word user dán — không tóm tắt, không merge',
      ].join('\n')
    }
    return P1_EXTRA
  }
  if (partNumber === 2) {
    if (templateKind === 'p2-a15') {
      return [
        P2_EXTRA,
        '- a15: MC Q11–15 KHÔNG sectionTitle; chỉ sectionRange + sectionInstruction',
        '- a15: sectionTitle "Tourist attractions in Manham" CHỈ trên câu 16 + noteTables.title',
        '- a15: KHÔNG notePassage cho MC; gap CHỈ trong noteTables',
      ].join('\n')
    }
    return P2_EXTRA
  }
  if (partNumber === 3) return P3_EXTRA
  if (templateKind === 'p4-d4') {
    return [
      P4_EXTRA,
      '- d4: MC 31–33 KHÔNG sectionTitle; chỉ sectionRange + sectionInstruction',
      '- d4: sectionTitle "Uses of Nanotechnology" CHỈ trên câu 34 (nhóm notes Q34–40)',
      '- d4: passageTitle có thể trùng sectionTitle; MC 31–33 không gap trong notePassage',
    ].join('\n')
  }
  return P4_EXTRA
}

export function buildIeltsPartAiMessages(
  partNumber: IeltsWizardPartNumber,
  templateKind: IeltsListeningWizardTemplateKind,
  examText: string,
  answerKey: string,
): Array<{ role: 'system' | 'user'; content: string }> {
  const option = findWizardTemplateOption(partNumber, templateKind)
  const samplePart = getIeltsListeningWizardTemplatePart(partNumber, templateKind)
  const sampleJson = JSON.stringify(samplePart, null, 2)
  const [qFrom, qTo] = IELTS_WIZARD_PART_RANGES[partNumber]

  return [
    {
      role: 'system',
      content: [
        `You convert IELTS Listening Part ${partNumber} exam text into import JSON for Ryan English app.`,
        `Layout: ${option.label} (${option.code}) — ${option.description}`,
        COMMON_RULES,
        partExtraRules(partNumber, templateKind),
        'Follow SAMPLE PART structure — same fields, nesting, question order.',
        'Return valid JSON only.',
      ].join('\n\n'),
    },
    {
      role: 'user',
      content: [
        'SAMPLE PART (schema — replace content, keep structure):',
        '```json',
        sampleJson,
        '```',
        '',
        `ANSWER KEY (questions ${qFrom}–${qTo}):`,
        answerKey.trim() || '(chưa có — suy từ đề)',
        '',
        `EXAM TEXT (Part ${partNumber}):`,
        examText.trim(),
        '',
        `Generate { "part": { ... } } — partNumber: ${partNumber}, rangeLabel: "${rangeLabelForPart(partNumber)}".`,
      ].join('\n'),
    },
  ]
}

/** @deprecated */
export function buildIeltsP1AiMessages(
  templateKind: IeltsListeningWizardTemplateKind,
  examText: string,
  answerKey: string,
) {
  return buildIeltsPartAiMessages(1, templateKind, examText, answerKey)
}