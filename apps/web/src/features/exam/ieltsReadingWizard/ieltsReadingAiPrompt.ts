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
  • "Complete the sentences below. Choose NO MORE THAN TWO WORDS / ONE WORD ONLY…":
    – MỖI câu trên đề = 1 question riêng; prompt = đúng 1 dòng câu (có ___), KHÔNG gộp 2+ câu vào 1 prompt
    – Nếu dùng note (summary-style sentences): MỖI câu = 1 dòng; NGẮT DÒNG = "\\n\\n" giữa các câu (hoặc "\\n" sau mỗi 14________)
    – VÍ DỤ note đúng: "Title\\n\\nSentence one 14________ end.\\n\\nSentence two 15________ end."
    – SAI: dán tất cả câu thành 1 đoạn không xuống dòng
    – answer = ONE/TWO WORDS từ passage (lowercase)
- summary-completion — chọn từ wordBank (flow-chart / summary có bank A–G)
- summary-completion đoạn văn liền (r3sm): questionGroups[].note = full summary + gap 27________ (8 gạch dưới); prompt = "Gap (27)" — KHÔNG imageFile
- gap-fill summary đoạn văn liền (r2g): questionGroups[].note = full summary + gap 14________ … 18________; prompt = "Gap (14)" — KHÔNG imageFile
- table-completion (r1t/r1tt/r1nt/r1ntf/r3tb/r3ty + mọi noteTable): **LUÔN lưới n cột × m dòng**
  • noteTable = { title?, headers[n], rows[m] } — headers.length = n (≥2); rows.length = m (≥1)
  • MỌI hàng: cells.length === n (đúng bằng số headers) — pad ô trống [] nếu thiếu; KHÔNG bỏ cột
  • Ô thường = [ { type:"static", text }, { type:"gap", number } ]; xuống dòng trong ô = { type:"break" }
  • MERGE (nếu đề gộp ô): rowSpan/colSpan + skip — vẫn đếm đủ n ô logic/hàng (ô skip = { skip:true })
  • title = tiêu đề bảng (vd. "Traditional uses of the huarango tree") — KHÔNG nhét title vào header/rows
  • BẮT BUỘC giữ noteTable từ SAMPLE; KHÔNG imageFile
- notes-completion (r1n/r1n8/r1nt/r3tn + mọi Part 1–3 có notes): notePassage[] + notesTitle
  • block = static | section | gap | example | break
  • gap { type:"gap", number:1 }; bullet dùng "•"/"–" trong text static
  • NGẮT DÒNG BẮT BUỘC theo đề giấy:
    – Mỗi dòng notes trên đề = block riêng (hoặc { "type":"break" } giữa hai dòng)
    – Heading thập niên/kỷ nguyên (1930s, 1940s, 1950s, 17th century…) = { "type":"section", "text":"1940s" } — KHÔNG gộp vào bullet trước/sau
    – Dòng trống trên đề = { "type":"break" }
    – KHÔNG gộp "1940s" + "• Moore turns…" thành 1 static
  • KHÔNG imageFile
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
      '- notePassage[]: section (heading), static (•/– dòng), gap, break khi đề ngắt dòng',
      '- notesTitle: topic trong khung notes (vd. Wildfires); prompt = "Gap (1)"',
      '- Heading thập niên (1930s/1940s…) = type section, mỗi decade 1 block riêng',
    ].join('\n'),
    'p1-r1-notes-tfng-8': [
      '- Cam12 T8 / Cam15 Moore: note completion (notePassage) + TFNG',
      '- notePassage[]: section (1930s/1940s/1950s) + bullet (•) + static + gap; break giữa nhóm decade',
      '- VÍ DỤ đúng: {type:"section",text:"1940s"}, {type:"static",text:"• Moore turns to drawing because "}, {type:"gap",number:9}',
      '- SAI: gộp "1940s • Moore…" hoặc gộp 1940s với 1950s trong 1 static',
      '- ONE WORD ONLY; notesTitle; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-tfng-gap-table': [
      '- Cam10 T1 P1: TFNG Q1–5 + gap-fill Q6–8 + table completion Q9–13',
      '- Nhóm table: noteTable.headers (4 cột) + rows[].cells[][] — gap { type:"gap", number } trong ô',
      '- prompt câu gap: "Gap (9)"; answer = từ passage; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-table-tfng': [
      '- Table completion Q1–8 (hoặc Q1–7) + TFNG sau — Cam13 T4 P1 (Coconut palm) hoặc Cam13 T1 P1 (NZ website)',
      '- noteTable **luôn n cột × m dòng**: headers[n] (vd. n=3 Part|Description|Uses); rows[m]; mỗi hàng cells.length === n',
      '- title = tiêu đề bảng IN HOA — không gộp vào headers',
      '- Ô = [ static, gap ]; MERGE dọc: { rowSpan:N, blocks } + { skip:true } trên hàng sau — vẫn n ô/hàng',
      '- ONE WORD ONLY; prompt = "Gap (1)"; TFNG sau table; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-notes-tfng-table': [
      '- Notes Q1–4 (notePassage như r1n8) + TFNG Q5–7 + table Q8–13 (noteTable merge như r1tt) — vd. Nutmeg',
      '- NHÓM 1 Notes: type gap-fill; notesTitle; notePassage[] bullet • + static + gap; ngắt dòng = block riêng hoặc break',
      '  GIỮ ĐỦ text tĩnh notes; prompt "Gap (1)"…; ONE WORD ONLY; KHÔNG note string inline',
      '- NHÓM 2 TFNG: TRUE/FALSE/NOT GIVEN về facts (KHÔNG YNNG)',
      '- NHÓM 3 Table: noteTable 2 cột (Period|Events) hoặc timeline; MERGE dọc (vd. "17th century" rowSpan) + skip',
      '  gap { type:"gap", number:8…13 }; title nếu có; ONE WORD ONLY',
      '- Thứ tự BẮT BUỘC: notes → TFNG → table; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-notes-table-tfng': [
      '- Notes Q1–5 (notePassage) + table Q6–8 (noteTable) + TFNG Q9–13 — vd. Huarango tree',
      '- NHÓM 1 Notes: type gap-fill; notesTitle; notePassage[] bullet • + static + gap; ngắt dòng = block riêng / break',
      '  ONE WORD ONLY; KHÔNG note string inline',
      '- NHÓM 2 Table: noteTable **luôn n cột × m dòng** (vd. n=2: Part of tree|Traditional use; m=3 hàng data)',
      '  title riêng (vd. "Traditional uses of the huarango tree"); headers[n]; mỗi rows[i].cells.length === n',
      '  gap trong ô; NO MORE THAN TWO WORDS nếu đề ghi vậy; KHÔNG gộp notes vào table',
      '- NHÓM 3 TFNG: TRUE/FALSE/NOT GIVEN về facts',
      '- Thứ tự BẮT BUỘC: notes → table → TFNG; KHÔNG imageFile',
    ].join('\n'),
    'p1-r1-tfng-gap': [
      '- Cam9 P1: TFNG Q1–7 + gap-fill/sentence completion Q8–13',
      '- Sentence completion: type sentence-completion; MỖI câu = 1 question; prompt 1 dòng có ___; KHÔNG gộp nhiều câu 1 prompt',
      '- Nếu note inline: mỗi câu 1 dòng, "\\n\\n" giữa câu; instruction "Complete the sentences below…"',
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
      '- type sentence-completion; MỖI câu = 1 prompt 1 dòng (___); NGẮT DÒNG — không dán nối các câu',
      '- ONE/TWO WORDS từ passage; không TFNG đầu',
    ].join('\n'),
    'p1-r1-headings-gap': [
      '- Matching headings Q1–7 + gap/sentence completion Q8–13 (không MC)',
      '- Headings trước; sentence/gap sau: mỗi câu 1 dòng / 1 question; "\\n\\n" nếu note multi-sentence',
      '- đủ 13 câu',
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
    'p1-r1-match-ynng-features': [
      '- Match đoạn Q1–3 (A–J) + YNNG Q4–6 + matching-features Q7–13 (list 3 options A–C)',
      '- Passage PHẢI có label A–J; instruction "Which section contains the following information?"',
      '- paragraphLetters[] A–J; prompt = statement; answer = chữ cái đoạn (a, b, j…)',
      '- YNNG: claims of the writer (YES/NO/NOT GIVEN) — KHÔNG phải TFNG facts',
      '- features[] = 3 nhãn A–C (vd. Hamiltonian / Jeffersonian / Jacksonian); note "NB You may use any letter more than once"',
      '- prompt features = statement; answer = id chữ cái (a, b, c); KHÔNG imageFile; KHÔNG MC',
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
    'p2-r2-tfng-notes': [
      '- TFNG Q14–19 + notes ONE WORD Q20–26 (notePassage) — vd. Silbo Gomero',
      '- TFNG trước: TRUE/FALSE/NOT GIVEN về facts (KHÔNG YNNG)',
      '- Notes: type gap-fill; notesTitle (vd. "Silbo Gomero"); BẮT BUỘC notePassage[]',
      '- NGẮT DÒNG BẮT BUỘC theo đề (KHÔNG gộp dòng):',
      '  • Mỗi section heading trên đề = { type:"section", text:"How Silbo is produced" } — 1 block riêng',
      '  • Mỗi bullet = 1 static bắt đầu "• " (+ gap inline nếu có)',
      '  • Dòng trống giữa section = { type:"break" } (tuỳ chọn)',
      '  • VÍ DỤ đúng: section "How Silbo is produced" → bullets → section "How Silbo is used" → bullets → section "The future of Silbo"',
      '  • SAI: gộp "How Silbo is produced" + "How Silbo is used" vào 1 static; gộp nhiều bullet 1 block',
      '- prompt gap = "Gap (20)" …; ONE WORD ONLY; KHÔNG wordBank; KHÔNG note string; KHÔNG imageFile',
    ].join('\n'),
    'p2-r2-headings-tfng-sentence': [
      '- Cam12 T8 P2: matching-headings Q14–20 (passage A–G) + TFNG Q21–24 + sentence-completion ONE WORD Q25–26',
      '- headings[] i–viii (dư hơn số đoạn); prompt = "Paragraph A" …; answer = id heading (i, ii, iv…)',
      '- TFNG về facts trong passage (TRUE/FALSE/NOT GIVEN), không phải views of writer',
      '- Sentence completion: type sentence-completion; ONE WORD ONLY; MỖI câu 1 prompt 1 dòng có ___; KHÔNG gộp 2 câu 1 prompt',
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
    'p2-r2-match-choose-two-summary': [
      '- Cam14 T1 P2 (Bike-sharing): matching-paragraph Q14–18 + Choose TWO Q19–20 + Choose TWO Q21–22 + summary ONE WORD Q23–26',
      '- Passage PHẢI có label A–G; instruction "Which section/paragraph contains the following information?"',
      '- paragraphLetters[] A–G; prompt = statement (vd. "a description of how people misused…"); answer = chữ cái đoạn',
      '- note "NB You may use any letter more than once" nếu đề có',
      '- Hai nhóm Choose TWO riêng: mỗi nhóm type multiple-choice, 2 câu cùng prompt/options A–E',
      '- answer mỗi câu = 1 chữ cái (vd. Q19="a", Q20="d"); instruction "Choose TWO correct answers, A–E."',
      '- Nhóm summary: note = đoạn văn liền (tiêu đề "The first urban bike-sharing scheme"), gap = 23________ … 26________',
      '- prompt gap = "Gap (23)" …; ONE WORD ONLY từ passage; KHÔNG wordBank; KHÔNG imageFile',
    ].join('\n'),
    'p2-r2-match-tfng-choose-two': [
      '- Match đoạn Q14–17 (A–G) + TFNG Q18–22 + Choose TWO Q23–24 (thêm Q25–26 nếu đề có)',
      '- Passage PHẢI có label A–G; instruction "Which section contains the following information?"',
      '- paragraphLetters[] A–G; prompt = statement; answer = chữ cái đoạn (a–g)',
      '- TFNG: TRUE/FALSE/NOT GIVEN về facts trong passage (KHÔNG phải YNNG / views of writer)',
      '- Choose TWO: type multiple-choice; 2 câu cùng prompt/options A–E; instruction "Choose TWO correct answers, A–E."',
      '- answer mỗi câu Choose TWO = 1 chữ cái; KHÔNG imageFile',
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
      '- Sentence completion: "Complete the sentences… ONE WORD / NO MORE THAN TWO WORDS"; type sentence-completion',
      '  MỖI câu = 1 question, prompt 1 dòng có ___; NGẮT DÒNG — không dán nối; nếu note multi-sentence: "\\n\\n" giữa câu',
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
    'p3-r3-headings-mc-ynng': [
      '- Matching headings Q27–32 (passage A–F) + MC Q33–35 + YNNG Q36–40 — vd. AI attitudes',
      '- Headings: headings[] i–viii (dư hơn số đoạn); prompt "Paragraph A" …; answer = id heading (i, ii…)',
      '  instruction "Choose the correct heading… Write the correct number, i–viii"',
      '- MC: type multiple-choice; options A–D; instruction "Choose the correct answer."',
      '- YNNG: claims of the writer (YES/NO/NOT GIVEN) — KHÔNG phải TFNG facts',
      '- Thứ tự BẮT BUỘC: headings → MC → YNNG; KHÔNG imageFile',
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
    'p3-r3-features-ynng-summary': [
      '- Matching-features Q27–31 (list người A–G) + YNNG Q32–36 + summary ONE WORD Q37–40',
      '- features[] = tên nhà nghiên cứu A–G (Elkind, Miller & Almon…); note "NB You may use any letter more than once" nếu đề có',
      '- prompt features = statement; answer = id chữ cái (a, b…)',
      '- YNNG: claims of the writer (YES/NO/NOT GIVEN) — KHÔNG phải TFNG facts',
      '- Summary: note = đoạn văn liền (tiêu đề "Guided play"), gap = 37________ … 40________; type gap-fill',
      '- prompt gap = "Gap (37)" …; ONE WORD ONLY từ passage; KHÔNG wordBank; KHÔNG imageFile',
    ].join('\n'),
    'p3-r3-tfng-notes-mc': [
      '- TFNG Q27–33 + notes completion Q34–39 (notePassage giống r1n8 Glass) + multiple-choice Q40 (best title)',
      '- TFNG trước: TRUE/FALSE/NOT GIVEN về facts trong passage (KHÔNG phải YNNG); đủ 7 câu Q27–33',
      '- Notes (BẮT BUỘC notePassage, giống Cam notes layout r1n8):',
      '  • type gap-fill; notesTitle = tiêu đề notes (vd. "Findings related to marine debris")',
      '  • notePassage[]: section (heading) + static bullet "• …" / sub "– …" + gap { type:"gap", number: 34…39 }',
      '  • Ngắt dòng: mỗi heading/bullet = block riêng; decade/era = type section; dòng trống = type break',
      '  • GIỮ ĐỦ text tĩnh của đề; KHÔNG rút gọn notes thành summary `note` string; KHÔNG wordBank; KHÔNG noteTable',
      '  • prompt gap = "Gap (34)" … "Gap (39)"; ONE WORD ONLY từ passage',
      '- MC cuối: 1 câu Q40; options A–D (best title); instruction "Choose the correct answer."',
      '- KHÔNG imageFile',
    ].join('\n'),
    'p3-r3-endings-summary-mc': [
      '- Sentence endings Q27–31 + summary word bank Q32–36 + MC Q37–40 — vd. Fairy tales / Tehrani',
      '- NHÓM 1 Endings: type summary-completion; instruction "Complete each sentence with the correct ending, A–F"',
      '  wordBank[] A–F (cụm kết câu); prompt = nửa câu; answer = id bank (a, b…); KHÔNG note inline',
      '- NHÓM 2 Summary: type summary-completion; note = đoạn văn liền + tiêu đề (vd. "Phylogenetic analysis of Little Red Riding Hood")',
      '  gap = 32________ … 36________; wordBank[] A–I (phrases ngắn); prompt = "Gap (32)" …; answer = id bank',
      '- NHÓM 3 MC: type multiple-choice; options A–D; instruction "Choose the correct answer."',
      '- Thứ tự BẮT BUỘC: endings → summary bank → MC; KHÔNG imageFile; KHÔNG noteTable',
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