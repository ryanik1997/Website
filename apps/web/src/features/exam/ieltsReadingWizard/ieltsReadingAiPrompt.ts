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
- table-completion (r1t/r1tt/r3tb/r3ty): questionGroups[].noteTable = { title?, headers[], rows[{ cells[] }] }; mỗi hàng = cells.length === headers.length; ô thường = [ { type:"static", text:"..." }, { type:"gap", number:9 } ]; xuống dòng = { type:"break" }; MERGE: ô gộp dọc = { rowSpan:N, blocks:[...] }; ô gộp ngang = { colSpan:N, blocks:[...] }; ô bị gộp = { skip:true }; title = tiêu đề bảng (vd. THE COCONUT PALM) — KHÔNG gộp vào header row — BẮT BUỘC giữ noteTable từ SAMPLE; KHÔNG imageFile
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
    'p1-r1-notes-tfng-8': [
      '- Cam12 T8 P1: note completion Q1–8 + TFNG Q9–13',
      '- notePassage[]: bullet (•) + static + gap { type:"gap", number }; notesTitle (vd. The History of Glass)',
      '- ONE WORD ONLY; prompt = "Gap (1)"; passage không label',
      '- TFNG sau notes; đủ 13 câu',
    ].join('\n'),
    'p1-r1-tfng-gap-table': [
      '- Cam10 T1 P1: TFNG Q1–5 + gap-fill Q6–8 + table completion Q9–13',
      '- Nhóm table: noteTable.headers (4 cột) + rows[].cells[][] — gap { type:"gap", number } trong ô',
      '- prompt câu gap: "Gap (9)"; answer = từ passage; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-table-tfng': [
      '- Table completion Q1–8 (hoặc Q1–7) + TFNG sau — Cam13 T4 P1 (Coconut palm) hoặc Cam13 T1 P1 (NZ website)',
      '- noteTable: 2–3 cột (vd. Part|Description|Uses); title = tiêu đề bảng IN HOA',
      '- Bảng đơn giản: mỗi ô = [ { type:"static" }, { type:"gap", number } ] — đủ headers.length ô/hàng',
      '- Bảng có MERGE (copy Word/PDF): nhãn cột 1 gộp nhiều hàng (vd. "fruits" rowSpan 5) → hàng đầu { rowSpan:5, blocks:[{type:"static",text:"fruits"}] }; 4 hàng sau cùng cột = { skip:true }; cột Description/Uses vẫn đủ ô mỗi hàng',
      '- Ô trống (không gap): [] hoặc blocks rỗng; gap { type:"gap", number }; ONE WORD ONLY; prompt = "Gap (1)"',
      '- TFNG sau table; passage có thể A–G hoặc đoạn liền; KHÔNG imageFile',
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
    'p1-r1-headings-notes': [
      '- Cam12 T5 P1: matching-headings Q1–7 (passage A–G) + note completion Q8–13',
      '- headings[] i–viii (nhiều hơn số đoạn); prompt "Paragraph A"…; answer = id heading',
      '- notePassage[]: bullet (•) + static + gap { type:"gap", number }; notesTitle (vd. The decline of the Galápagos tortoise)',
      '- ONE WORD ONLY; prompt = "Gap (8)"; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-gap-mc': [
      '- Gap-fill hoặc sentence completion Q1–6 + MC Q7–13',
      '- Không TFNG; gap trước MC sau',
    ].join('\n'),
    'p1-r1-tfng-match-notes': [
      '- Cam11 T2 P1: TFNG Q1–4 + matching-features Q5–8 + note completion Q9–13',
      '- features[] = mốc thời gian A–G (vd. 1836, 1965…); prompt = câu mô tả sự kiện, answer = id chữ cái',
      '- notePassage[]: bullet (•) + static + gap { type:"gap", number }; notesTitle nếu có tiêu đề notes',
      '- prompt gap: "Gap (9)"; ONE/TWO WORDS từ passage; passage không label',
    ].join('\n'),
    'p1-r1-tfng-match-summary': [
      '- Cam11 T4 P1: TFNG Q1–4 + matching-features Q5–9 (người A–C) + summary-completion Q10–13 (word bank A–F)',
      '- features[] 3 nhà nghiên cứu A–C; prompt = statement; answer = id chữ cái (a, b, c)',
      '- Nhóm summary: note = đoạn văn liền (tiêu đề "Epigenetic processes"), gap = 10________ … 13________',
      '- wordBank[] A–F (phrases); prompt = "Gap (10)" …; answer = id bank; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-match-choose-two': [
      '- Cam12 T6 P1: matching-paragraph Q1–3 (passage A–I) + matching-features Q4–9 (người A–G) + Choose TWO Q10–13',
      '- Passage PHẢI có label A–I; instruction "Which paragraph contains the following information?"',
      '- paragraphLetters[] A–I; prompt = statement; answer = chữ cái đoạn (a, b, h…)',
      '- features[] 7 người A–G; note "NB You may use any letter more than once" nếu đề có',
      '- Choose TWO: 2 nhóm MC (Q10–11 và Q12–13), mỗi nhóm 2 câu multiple-choice cùng prompt/options A–E',
      '- answer mỗi câu = 1 chữ cái (vd. Q10="d", Q11="e"); KHÔNG TFNG; KHÔNG imageFile',
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
    'p2-r2-headings-summary-mc': [
      '- Cam11 T4 P2: matching-headings Q14–20 (passage A–G) + summary ONE WORD Q21–24 + Choose TWO Q25–26',
      '- headings[] i–ix (dư hơn số đoạn); prompt = "Paragraph A" …; answer = id heading (i, ii…)',
      '- Nhóm summary: note = đoạn văn liền + tiêu đề (vd. Jared Diamond\'s View), gap = 21________ … 24________',
      '- Choose TWO: 2 câu multiple-choice cùng prompt/options A–E; answer mỗi câu = 1 chữ cái (vd. "b", "c")',
    ].join('\n'),
    'p2-r2-summary-ynng-mc': [
      '- Summary-completion (wordBank) Q14–17 + YNNG Q18–22 + MC Q23–26',
      '- YNNG: views of writer; summary answer = id bank (a, b…)',
    ].join('\n'),
    'p2-r2-tfng-endings-summary': [
      '- Cam11 T3 P2: TFNG Q14–18 + matching sentence endings Q19–22 (word bank A–G) + summary ONE WORD Q23–26',
      '- TFNG về facts trong passage (TRUE/FALSE/NOT GIVEN), không phải views of writer',
      '- Nhóm endings: wordBank[] A–G (cụm kết câu); prompt = câu gốc + "…"; answer = id bank (a, b…)',
      '- Nhóm summary: note = đoạn văn liền (tiêu đề "The migration of pronghorns"), gap = 23________ … 26________',
      '- KHÔNG MC; KHÔNG imageFile',
    ].join('\n'),
    'p2-r2-mc-tfng-endings': [
      '- Cam11 T4 P2: multiple-choice Q14–18 + TFNG Q19–23 + matching sentence endings Q24–26 (word bank A–E)',
      '- MC trước TFNG; instruction MC = "Choose the correct letter, A, B, C or D."; options A–D',
      '- TFNG về facts trong passage (TRUE/FALSE/NOT GIVEN), không phải views of writer',
      '- Nhóm endings: wordBank[] A–E (cụm kết câu); prompt = câu gốc; answer = id bank (a, b…)',
      '- KHÔNG imageFile',
    ].join('\n'),
    'p2-r2-tfng-diagram': [
      '- Cam11 T1 P2: TFNG Q14–19 + diagram labeling Q20–26 (ONE WORD from passage)',
      '- TFNG về facts trong passage (TRUE/FALSE/NOT GIVEN), không phải views of writer',
      '- Nhóm diagram: type gap-fill; imageFile = "falkirk-wheel-diagram.jpg" (hoặc tên ảnh diagram trong bundle)',
      '- prompt = "Gap (20)" … "Gap (26)"; answer = ONE WORD từ passage',
    ].join('\n'),
    'p2-r2-headings-tfng-sentence': [
      '- Cam12 T8 P2: matching-headings Q14–20 (passage A–G) + TFNG Q21–24 + sentence-completion ONE WORD Q25–26',
      '- headings[] i–viii (dư hơn số đoạn); prompt = "Paragraph A" …; answer = id heading (i, ii, iv…)',
      '- TFNG về facts trong passage (TRUE/FALSE/NOT GIVEN), không phải views of writer',
      '- Sentence completion: type sentence-completion; ONE WORD ONLY; prompt = câu có ___',
      '- KHÔNG MC; KHÔNG imageFile',
    ].join('\n'),
    'p2-r2-mc-summary-ynng': [
      '- Cam12 T8 P2: multiple-choice Q14–18 + summary-completion Q19–22 (word bank A–F) + YNNG Q23–26',
      '- MC trước summary; instruction MC = "Choose the correct answer."; options A–D',
      '- Nhóm summary: note = đoạn văn liền (tiêu đề "Reintroducing the lynx to Britain"), gap = 19________ … 22________',
      '- wordBank[] A–F (phrases); questions prompt = "Gap (19)" …; answer = id bank (a, b…)',
      '- YNNG: claims of the writer (KHÔNG phải facts); KHÔNG imageFile',
    ].join('\n'),
    'p2-r2-headings-match-summary': [
      '- Cam13 T1 P2: matching-headings Q14–19 (passage A–F) + matching-features Q20–23 + summary ONE WORD Q24–26',
      '- headings[] i–viii (dư hơn số đoạn); prompt "Paragraph A" …; answer = id heading',
      '- features[] = list ideas A–E; prompt = tên người (Peter Toohey…); answer = id chữ cái',
      '- Nhóm summary: note inline (tiêu đề "Responses to boredom"), gap = 24________ … 26________',
      '- KHÔNG imageFile; KHÔNG noteTable',
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
    'p3-r3-mc-summary-ynng': [
      '- Cam11 T2 P3: multiple-choice Q27–30 + summary-completion Q31–33 (word bank A–H) + YNNG Q34–39',
      '- MC trước summary; instruction MC = "Choose the correct answer."; options A–D',
      '- Nhóm summary: note = đoạn văn liền (tiêu đề "Art and the Brain"), gap = 31________ … 33________',
      '- wordBank[] A–H (phrases); questions prompt = "Gap (31)" …; answer = id bank (a, b…)',
      '- YNNG: claims of the writer (KHÔNG phải facts); KHÔNG imageFile',
    ].join('\n'),
    'p3-r3-match-paragraph-sentence': [
      '- Cam11 T3 P3: matching-paragraph Q27–34 (passage A–G) + sentence-completion Q35–40',
      '- Match đoạn: instruction "Which section contains the following information?"; note NB có thể dùng lại chữ cái',
      '- paragraphLetters[] A–G; prompt = statement text; answer = chữ cái đoạn (a, b…)',
      '- Sentence completion: "Choose ONE WORD ONLY from the passage"; type sentence-completion; prompt = câu có ___',
      '- KHÔNG MC; KHÔNG imageFile',
    ].join('\n'),
    'p3-r3-headings-summary-ynng': [
      '- Cam11 T4 P3: matching-headings Q27–32 (passage A–F) + summary-completion Q33–36 (word bank A–G) + YNNG Q37–40',
      '- Headings: headings[] i–vii; prompt = "Paragraph A" …; answer = roman numeral (vi, iv…)',
      '- Summary: note = "The importance of language" + gap 33________ … 36________; wordBank[] A–G (single words)',
      '- YNNG: views of the writer (KHÔNG phải facts); KHÔNG imageFile',
    ].join('\n'),
    'p3-r3-headings-gap-ynng': [
      '- Cam12 T5 P3: matching-headings Q27–32 (sections A–F) + gap-fill summary Q33–36 (NO MORE THAN TWO WORDS) + YNNG Q37–40',
      '- Headings: headings[] i–viii; prompt = "Section A" / "Paragraph A" …; answer = roman numeral (vi, viii…)',
      '- Summary: note = tiêu đề + gap 33________ … 36________ inline; type gap-fill; KHÔNG wordBank',
      '- YNNG: views/claims of the writer; KHÔNG imageFile',
    ].join('\n'),
    'p3-r3-table-ynng-match': [
      '- Cam12 T2 P3: table Q27–31 (noteTable 2 cột Test|Findings) + YNNG Q32–36 + matching-paragraph Q37–40 (A–G)',
      '- Table: gap trong ô static text; headers ["Test","Findings"]; prompt = "Gap (27)" …; TWO WORDS ONLY',
      '- YNNG: claims of the writer (YES/NO/NOT GIVEN); KHÔNG phải facts',
      '- Match đoạn: paragraphLetters[] A–G; prompt = statement text; answer = chữ cái đoạn (a, b…)',
      '- KHÔNG MC; KHÔNG imageFile',
    ].join('\n'),
    'p3-r3-summary-mc-endings': [
      '- Cam12 T3 P3: summary Q27–31 (note inline + 27________) + MC Q32–36 (A–D) + sentence endings Q37–40 (wordBank A–F)',
      '- Summary: note = tiêu đề "The Montreal Study" + gap 27________ … 31________; type gap-fill; TWO WORDS ONLY',
      '- MC: type multiple-choice; 4 options a–d; instruction "Choose the correct answer."',
      '- Endings: type summary-completion + wordBank[] A–F; prompt = câu chưa hoàn chỉnh; answer = id bank',
      '- KHÔNG imageFile; KHÔNG noteTable',
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