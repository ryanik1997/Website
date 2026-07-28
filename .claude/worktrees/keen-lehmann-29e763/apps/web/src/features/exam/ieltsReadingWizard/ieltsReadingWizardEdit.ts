import type { ReadingExam, ReadingPart, ReadingQuestion, ReadingQuestionGroup } from '../examData'
import type { ReadingImportPartJson, ReadingImportQuestionGroupJson } from '../importReadingManualUtils'
import {
  bestTemplateByRoleMultiset,
  classifyReadingGroupRole,
  isChooseTwoGroup,
  partRoleMultisetKey,
  partRoleSignature,
} from './ieltsReadingGroupRoles'
import { getIeltsReadingWizardTemplatePart } from './ieltsReadingPartTemplates'
import { templateOptionsForPassage } from './ieltsReadingTemplateCatalog'
import {
  IELTS_READING_DEFAULT_TEMPLATES,
  IELTS_READING_PASSAGE_NUMBERS,
  type IeltsReadingPassageNumber,
  type IeltsReadingWizardTemplateKind,
} from './ieltsReadingWizardConfig'
import type { PersistedPassageDraft } from './ieltsReadingWizardPersist'
import { createEmptyReadingWizardDrafts } from './ieltsReadingWizardPersist'

export function isIeltsReadingWizardEditable(exam: ReadingExam): boolean {
  return exam.examTrack === 'ielts' && exam.parts.length === 3
    && exam.parts.every(p => p.partNumber >= 1 && p.partNumber <= 3)
}

export function readingPartToImportJson(part: ReadingPart): ReadingImportPartJson {
  const mapGroup = (group: ReadingQuestionGroup): ReadingImportQuestionGroupJson => ({
    range: group.range,
    instruction: group.instruction,
    note: group.note,
    imageFile: group.imageFile,
    noteTable: group.noteTable,
    notePassage: group.notePassage,
    notesTitle: group.notesTitle,
    type: group.type,
    paragraphLetters: group.paragraphLetters,
    headings: group.headings,
    features: group.features,
    wordBank: group.wordBank,
    questions: group.questions.map(q => ({
      number: q.number,
      type: q.type,
      prompt: q.prompt,
      options: q.options,
      answer: q.answer,
      explanation: q.explanation,
      ...(q.minWords ? { minWords: q.minWords } : {}),
    })),
  })

  return {
    partNumber: part.partNumber,
    rangeLabel: part.rangeLabel,
    passageTitle: part.passageTitle,
    passageSubtitle: part.passageSubtitle,
    passage: part.passage.map(block => ({
      label: block.label,
      text: block.text,
    })),
    questionGroups: part.questionGroups.map(mapGroup),
  }
}

function groupTypeSignature(part: ReadingImportPartJson): string {
  return part.questionGroups.map(g => g.type).join('|')
}

const TEMPLATE_SIGNATURES: Record<IeltsReadingPassageNumber, Record<string, IeltsReadingWizardTemplateKind>> = {
  1: {
    'tfng|multiple-choice': 'p1-r1-tfng-mc',
    'gap-fill|tfng': 'p1-r1-notes-tfng',
    'tfng|gap-fill': 'p1-r1-tfng-gap',
    'tfng|sentence-completion': 'p1-r1-tfng-gap',
    'tfng|gap-fill|gap-fill': 'p1-r1-tfng-gap-table',
    'matching-headings|multiple-choice': 'p1-r1-headings-mc',
    'sentence-completion|multiple-choice': 'p1-r1-sentence-mc',
    'matching-headings|gap-fill': 'p1-r1-headings-gap',
    'matching-headings|sentence-completion': 'p1-r1-headings-gap',
    'gap-fill|multiple-choice': 'p1-r1-gap-mc',
    'tfng|matching-features|gap-fill': 'p1-r1-tfng-match-notes',
    'tfng|matching-features|summary-completion': 'p1-r1-tfng-match-summary',
    'matching-paragraph|matching-features|multiple-choice': 'p1-r1-match-choose-two',
    'matching-paragraph|ynng|matching-features': 'p1-r1-match-ynng-features',
    'gap-fill|tfng|gap-fill': 'p1-r1-notes-tfng-table',
    'gap-fill|gap-fill|tfng': 'p1-r1-notes-table-tfng',
    'sentence-completion|gap-fill|tfng': 'p1-r1-sentence-table-tfng',
    'matching-paragraph|gap-fill|matching-features': 'p1-r1-match-summary-features',
    'matching-paragraph|summary-completion|matching-features': 'p1-r1-match-summary-features',
    'matching-paragraph|gap-fill|multiple-choice|multiple-choice': 'p1-r1-match-summary-choose-two',
    'matching-paragraph|gap-fill|multiple-choice': 'p1-r1-match-summary-choose-two',
  },
  2: {
    'matching-paragraph|matching-features|multiple-choice': 'p2-r2-match-mc',
    'ynng|matching-paragraph|matching-features|multiple-choice': 'p2-r2-ynng-match',
    'matching-headings|gap-fill|ynng': 'p2-r2-headings-ynng',
    'matching-headings|sentence-completion|ynng': 'p2-r2-headings-ynng',
    'tfng|matching-paragraph|matching-features|multiple-choice': 'p2-r2-tfng-match',
    'gap-fill|matching-paragraph|multiple-choice': 'p2-r2-gap-match',
    'sentence-completion|matching-paragraph|multiple-choice': 'p2-r2-gap-match',
    'gap-fill|matching-features|matching-paragraph': 'p2-r2-gap-match',
    'matching-headings|gap-fill|multiple-choice': 'p2-r2-headings-summary-mc',
    'summary-completion|ynng|multiple-choice': 'p2-r2-summary-ynng-mc',
    'tfng|summary-completion|gap-fill': 'p2-r2-tfng-endings-summary',
    'multiple-choice|tfng|summary-completion': 'p2-r2-mc-tfng-endings',
    'tfng|gap-fill': 'p2-r2-tfng-diagram',
    'matching-headings|tfng|sentence-completion': 'p2-r2-headings-tfng-sentence',
    'multiple-choice|summary-completion|ynng': 'p2-r2-mc-summary-ynng',
    'matching-headings|matching-features|gap-fill': 'p2-r2-headings-match-summary',
    'matching-paragraph|multiple-choice|multiple-choice|gap-fill': 'p2-r2-match-choose-two-summary',
    'matching-paragraph|multiple-choice|multiple-choice|sentence-completion': 'p2-r2-match-choose-two-summary',
    'matching-paragraph|tfng|multiple-choice': 'p2-r2-match-tfng-choose-two',
    'matching-paragraph|matching-features|sentence-completion': 'p2-r2-match-features-sentence',
    // match|features|gap: r2mfs (sentence last) vs r2mfu (summary note last) — resolve in infer
    'matching-paragraph|matching-features|gap-fill': 'p2-r2-match-features-sentence',
    'matching-paragraph|sentence-completion|matching-features': 'p2-r2-match-sentence-features',
    'matching-paragraph|gap-fill|matching-features': 'p2-r2-match-sentence-features',
    'matching-paragraph|matching-features|summary-completion': 'p2-r2-match-features-summary',
    'multiple-choice|ynng|summary-completion': 'p2-r2-mc-ynng-summary',
    'multiple-choice|ynng|gap-fill': 'p2-r2-mc-ynng-summary',
    'matching-headings|multiple-choice|gap-fill': 'p2-r2-headings-mc-summary',
    'matching-headings|multiple-choice|summary-completion': 'p2-r2-headings-mc-summary',
    'multiple-choice|matching-features|ynng': 'p2-r2-mc-features-ynng',
    'matching-paragraph|sentence-completion|multiple-choice|multiple-choice': 'p2-r2-match-sentence-choose-two',
    // match|gap|c2|c2: r2msc (sentence giữa) vs r2ms2 (summary giữa) — resolve in infer
    'matching-paragraph|gap-fill|multiple-choice|multiple-choice': 'p2-r2-match-sentence-choose-two',
    'matching-paragraph|sentence-completion|multiple-choice': 'p2-r2-match-sentence-choose-two',
    'matching-paragraph|summary-completion|multiple-choice|multiple-choice': 'p2-r2-match-summary-choose-two',
    // headings + 2× Choose TWO + notes (r2h2n — coral reefs Part2_20)
    'matching-headings|multiple-choice|multiple-choice|gap-fill': 'p2-r2-headings-choose-two-notes',
    'matching-headings|multiple-choice|multiple-choice|sentence-completion': 'p2-r2-headings-choose-two-notes',
  },
  3: {
    'tfng|multiple-choice': 'p3-r3-tfng-mc',
    'gap-fill|tfng|summary-completion|multiple-choice': 'p3-r3-gap-tfng-flow-mc',
    'gap-fill|tfng|sentence-completion|summary-completion|multiple-choice': 'p3-r3-gap-tfng-flow-mc',
    'ynng|multiple-choice': 'p3-r3-ynng-mc',
    'gap-fill|ynng|multiple-choice': 'p3-r3-gap-ynng-mc',
    'sentence-completion|ynng|multiple-choice': 'p3-r3-gap-ynng-mc',
    // summary|ynng|mc: r3sy vs r3sb — resolve trong inferTemplateKindFromPart (số gap/bank)
    'summary-completion|ynng|multiple-choice': 'p3-r3-summary-ynng-mc',
    'summary-completion|multiple-choice|ynng': 'p3-r3-summary-mc-ynng',
    'gap-fill|tfng|multiple-choice': 'p3-r3-gap-tfng-mc',
    'sentence-completion|tfng|multiple-choice': 'p3-r3-gap-tfng-mc',
    'matching-paragraph|gap-fill|matching-features': 'p3-r3-match-table-features',
    'matching-paragraph|summary-completion|matching-features': 'p3-r3-match-summary-features',
    // match đoạn + features + summary ONE WORD (r3mfs — guard dogs Part3_20)
    'matching-paragraph|matching-features|gap-fill': 'p3-r3-match-features-summary',
    'matching-paragraph|matching-features|summary-completion': 'p3-r3-match-features-summary',
    'multiple-choice|summary-completion|ynng': 'p3-r3-mc-summary-ynng',
    'multiple-choice|gap-fill|ynng': 'p3-r3-mc-summary-ynng',
    'matching-paragraph|sentence-completion': 'p3-r3-match-paragraph-sentence',
    'matching-headings|summary-completion|ynng': 'p3-r3-headings-summary-ynng',
    'matching-headings|gap-fill|ynng': 'p3-r3-headings-gap-ynng',
    'matching-headings|multiple-choice|ynng': 'p3-r3-headings-mc-ynng',
    'gap-fill|ynng|matching-paragraph': 'p3-r3-table-ynng-match',
    'gap-fill|multiple-choice|summary-completion': 'p3-r3-summary-mc-endings',
    'matching-features|ynng|gap-fill': 'p3-r3-features-ynng-summary',
    'matching-features|ynng|sentence-completion': 'p3-r3-features-ynng-summary',
    // features + sentence endings + MC (r3fem — robots Part3_19)
    'matching-features|summary-completion|multiple-choice': 'p3-r3-features-endings-mc',
    'matching-features|gap-fill|multiple-choice': 'p3-r3-features-endings-mc',
    'tfng|gap-fill|multiple-choice': 'p3-r3-tfng-notes-mc',
    'summary-completion|summary-completion|multiple-choice': 'p3-r3-endings-summary-mc',
    // ynng|summary|mc: r3ysm vs r3ysb — resolve in infer (số câu YNNG/bank/MC)
    'ynng|summary-completion|multiple-choice': 'p3-r3-ynng-summary-mc',
    'ynng|gap-fill|multiple-choice': 'p3-r3-ynng-summary-mc',
  },
}

export function inferTemplateKindFromPart(
  passageNumber: IeltsReadingPassageNumber,
  part: ReadingImportPartJson,
): IeltsReadingWizardTemplateKind {
  const sig = groupTypeSignature(part)
  if (passageNumber === 1 && sig === 'tfng|gap-fill|gap-fill') {
    const tableGroup = part.questionGroups.find(g => g.noteTable?.headers?.length)
    if (tableGroup) return 'p1-r1-tfng-gap-table'
  }
  if (passageNumber === 1 && sig === 'tfng|gap-fill') {
    // Chỉ coi là table template nếu instruction thật sự là table (không summary/sentence)
    const tableGroup = part.questionGroups.find(
      g => g.noteTable?.headers?.length
        && /complete the table|table below/i.test(g.instruction ?? ''),
    )
    if (tableGroup) return 'p1-r1-tfng-table'
    const notesGroup = part.questionGroups.find(g => g.notePassage?.length)
    // r1tn: TFNG trước + notes (notePassage) — khác r1g (sentence/gap không notePassage)
    if (notesGroup) return 'p1-r1-tfng-notes'
    // Instruction "Complete the notes" dù AI quên notePassage
    if (/complete the notes|notes below/i.test(part.questionGroups[1]?.instruction ?? '')) {
      return 'p1-r1-tfng-notes'
    }
    return 'p1-r1-tfng-gap'
  }
  if (passageNumber === 1 && sig === 'gap-fill|tfng') {
    const tableGroup = part.questionGroups.find(g => g.noteTable?.headers?.length)
    if (tableGroup) return 'p1-r1-table-tfng'
    const notesGroup = part.questionGroups.find(g => g.notePassage?.length)
    if (notesGroup) {
      const gapCount = notesGroup.questions?.length ?? 0
      if (gapCount >= 8) return 'p1-r1-notes-tfng-8'
      return 'p1-r1-notes-tfng'
    }
  }
  if (passageNumber === 1 && sig === 'matching-headings|gap-fill') {
    const notesGroup = part.questionGroups.find(g => g.notePassage?.length)
    if (notesGroup) return 'p1-r1-headings-notes'
  }
  if (passageNumber === 1 && sig === 'gap-fill|tfng|gap-fill') {
    const notesFirst = part.questionGroups[0]?.notePassage?.length
    const tableLast = part.questionGroups.some(g => g.noteTable?.headers?.length)
    if (notesFirst && tableLast) return 'p1-r1-notes-tfng-table'
  }
  if (passageNumber === 1 && sig === 'gap-fill|gap-fill|tfng') {
    const notesFirst = part.questionGroups[0]?.notePassage?.length
    const tableMid = part.questionGroups[1]?.noteTable?.headers?.length
    if (notesFirst && tableMid) return 'p1-r1-notes-table-tfng'
    // Sentence + table + TFNG (r1st) — AI hay type gap-fill cho sentence
    if (tableMid && /complete the sentences/i.test(part.questionGroups[0]?.instruction ?? '')) {
      return 'p1-r1-sentence-table-tfng'
    }
  }
  if (passageNumber === 1 && sig === 'sentence-completion|gap-fill|tfng') {
    const tableMid = part.questionGroups[1]?.noteTable?.headers?.length
      || /complete the table|table below/i.test(part.questionGroups[1]?.instruction ?? '')
    if (tableMid) return 'p1-r1-sentence-table-tfng'
  }
  if (passageNumber === 1 && sig === 'matching-paragraph|gap-fill|matching-features') {
    // Summary ONE WORD (không table) — Teamplate_Part1_12 (r1msf)
    if (!part.questionGroups.some(g => g.noteTable?.headers?.length)) {
      return 'p1-r1-match-summary-features'
    }
  }
  if (passageNumber === 1 && (sig === 'matching-paragraph|gap-fill|multiple-choice' || sig.startsWith('matching-paragraph|gap-fill|multiple-choice'))) {
    const hasSummary = part.questionGroups.some(
      g => g.note && /\d{1,2}_{2,}/.test(g.note) && /summary/i.test(g.instruction ?? ''),
    )
    const hasChooseTwo = part.questionGroups.some(g => /choose two/i.test(g.instruction ?? ''))
    if (hasSummary && hasChooseTwo) return 'p1-r1-match-summary-choose-two'
  }
  if (passageNumber === 3 && sig === 'matching-paragraph|gap-fill|matching-features') {
    const tableGroup = part.questionGroups.find(g => g.noteTable?.headers?.length)
    if (tableGroup) return 'p3-r3-match-table-features'
    // Summary inline note (ONE WORD) + match features — Teamplate_Part3_13 (r3ms)
    const summaryGroup = part.questionGroups.find(
      g => g.note && /\d{1,2}_{2,}/.test(g.note) && !g.noteTable?.headers?.length,
    )
    if (summaryGroup) return 'p3-r3-match-summary-features'
  }
  if (passageNumber === 3 && sig === 'matching-paragraph|summary-completion|matching-features') {
    return 'p3-r3-match-summary-features'
  }
  if (passageNumber === 3 && sig === 'gap-fill|ynng|matching-paragraph') {
    const tableGroup = part.questionGroups.find(g => g.noteTable?.headers?.length)
    if (tableGroup) return 'p3-r3-table-ynng-match'
  }
  if (passageNumber === 3 && sig === 'tfng|gap-fill|multiple-choice') {
    const notesGroup = part.questionGroups.find(g => g.notePassage?.length)
    if (notesGroup) return 'p3-r3-tfng-notes-mc'
  }
  // P3 ynng|summary|mc: r3ysb (6 YNNG + 5 bank + 3 MC) vs r3ysm (4 YNNG + 6 bank + 4 MC)
  if (passageNumber === 3 && (sig === 'ynng|summary-completion|multiple-choice' || sig === 'ynng|gap-fill|multiple-choice')) {
    const ynngG = part.questionGroups.find(g => g.type === 'ynng' || classifyReadingGroupRole(g) === 'ynng')
    const bankG = part.questionGroups.find(g =>
      (g.wordBank?.length ?? 0) >= 4
      || /list of (phrases|words|options)/i.test(g.instruction ?? ''),
    )
    const mcG = part.questionGroups.find(g => g.type === 'multiple-choice' && !isChooseTwoGroup(g))
    const ynngN = ynngG?.questions?.length ?? 0
    const bankN = bankG?.questions?.length ?? 0
    const mcN = mcG?.questions?.length ?? 0
    if (ynngN >= 6 || (ynngN === 6 && bankN === 5) || (ynngN >= 5 && bankN === 5 && mcN === 3)) {
      return 'p3-r3-ynng-summary-bank-mc'
    }
  }
  // P3 summary|ynng|mc: r3sb (A–K, 6 gaps + 5 YNNG + 3 MC) vs r3sy (bank nhỏ hơn)
  if (passageNumber === 3 && (sig === 'summary-completion|ynng|multiple-choice' || sig === 'gap-fill|ynng|multiple-choice')) {
    const bankG = part.questionGroups.find(g => (g.wordBank?.length ?? 0) >= 4 || /list of phrases/i.test(g.instruction ?? ''))
    const ynngG = part.questionGroups.find(g => g.type === 'ynng' || classifyReadingGroupRole(g) === 'ynng')
    const mcG = part.questionGroups.find(g => g.type === 'multiple-choice' && !isChooseTwoGroup(g))
    const bankN = bankG?.questions?.length ?? 0
    const bankSize = bankG?.wordBank?.length ?? 0
    const ynngN = ynngG?.questions?.length ?? 0
    const mcN = mcG?.questions?.length ?? 0
    if (bankN >= 6 || bankSize >= 10 || (ynngN === 5 && mcN === 3)) {
      return 'p3-r3-summary-bank-ynng-mc'
    }
  }
  // P3 MC|summary|ynng: r3mey (endings) vs r3mgy (ONE WORD note) vs r3my (word bank note)
  if (passageNumber === 3 && (sig === 'multiple-choice|summary-completion|ynng' || sig === 'multiple-choice|gap-fill|ynng')) {
    const midG = part.questionGroups.find(g =>
      g.type === 'summary-completion'
      || g.type === 'gap-fill'
      || classifyReadingGroupRole(g) === 'summary-bank'
      || classifyReadingGroupRole(g) === 'summary-gap'
      || classifyReadingGroupRole(g) === 'gap',
    )
    const ynngG = part.questionGroups.find(g => g.type === 'ynng' || classifyReadingGroupRole(g) === 'ynng')
    const mcG = part.questionGroups.find(g => g.type === 'multiple-choice' && !isChooseTwoGroup(g))
    const midN = midG?.questions?.length ?? 0
    const ynngN = ynngG?.questions?.length ?? 0
    const mcN = mcG?.questions?.length ?? 0
    const midInstr = midG?.instruction ?? ''
    const hasBank = (midG?.wordBank?.length ?? 0) >= 4
    const endingsInstr = /complete each sentence with the correct ending|list of options|ending/i.test(midInstr)
    const halfSentencePrompts = (midG?.questions ?? []).filter(q =>
      /[a-z]\s*$/i.test((q.prompt ?? '').trim()) && !(q.prompt ?? '').includes('Gap'),
    ).length
    const oneWordSummary = /one word only|complete the summary below/i.test(midInstr)
      && !hasBank
      && !/list of phrases|list of words/i.test(midInstr)
    if (
      endingsInstr
      || halfSentencePrompts >= 3
      || (mcN === 4 && midN === 4 && ynngN === 6 && hasBank)
      || ((midG?.wordBank?.length ?? 0) <= 6 && midN === 4 && ynngN >= 5 && hasBank)
    ) {
      return 'p3-r3-mc-endings-ynng'
    }
    if (oneWordSummary || (mcN === 4 && midN === 5 && ynngN === 5 && !hasBank)) {
      return 'p3-r3-mc-summary-gap-ynng'
    }
  }
  // P2: TFNG + Notes (notePassage) vs TFNG + Diagram (imageFile)
  if (passageNumber === 2 && sig === 'tfng|gap-fill') {
    const notesGroup = part.questionGroups.find(g => g.notePassage?.length)
    if (notesGroup) return 'p2-r2-tfng-notes'
    const diagramGroup = part.questionGroups.find(g => Boolean(g.imageFile))
    if (diagramGroup) return 'p2-r2-tfng-diagram'
  }
  // P2: match + (sentence|summary) + 2× Choose TWO — r2msc vs r2ms2
  if (passageNumber === 2) {
    const chooseTwoCount = part.questionGroups.filter(g => isChooseTwoGroup(g)).length
    const hasMatch = part.questionGroups.some(g => classifyReadingGroupRole(g) === 'matching-paragraph')
    const summaryG = part.questionGroups.find(g =>
      /complete the summary/i.test(g.instruction ?? '')
      || (Boolean(g.note && /\d{1,2}_{2,}/.test(g.note)) && /one word only|summary/i.test(g.instruction ?? '')),
    )
    const hasSentence = part.questionGroups.some(g => {
      const r = classifyReadingGroupRole(g)
      return r === 'sentence'
        || (r === 'gap' && /complete the sentences|complete each sentence/i.test(g.instruction ?? ''))
    })
    if (hasMatch && chooseTwoCount >= 2 && summaryG && !hasSentence) {
      return 'p2-r2-match-summary-choose-two'
    }
    if (hasMatch && hasSentence && chooseTwoCount >= 2) {
      return 'p2-r2-match-sentence-choose-two'
    }
    // gap-fill giữa match và 2× Choose TWO: tóm tắt theo instruction
    if (
      hasMatch
      && chooseTwoCount >= 2
      && (sig === 'matching-paragraph|gap-fill|multiple-choice|multiple-choice'
        || sig === 'matching-paragraph|summary-completion|multiple-choice|multiple-choice')
    ) {
      const mid = part.questionGroups[1]
      if (/complete the summary/i.test(mid?.instruction ?? '') || mid?.note) {
        return 'p2-r2-match-summary-choose-two'
      }
      if (/complete the sentences/i.test(mid?.instruction ?? '')) {
        return 'p2-r2-match-sentence-choose-two'
      }
    }
  }
  // P2 match|features|gap: r2mfu (summary note Q24–26) vs r2mfs (sentence completion last)
  if (
    passageNumber === 2
    && (sig === 'matching-paragraph|matching-features|gap-fill'
      || sig === 'matching-paragraph|matching-features|summary-completion')
  ) {
    const last = part.questionGroups[part.questionGroups.length - 1]
    const featuresG = part.questionGroups.find(g => g.type === 'matching-features' || classifyReadingGroupRole(g) === 'matching-features')
    const featN = featuresG?.questions?.length ?? 0
    const lastIsSummaryNote = /complete the summary/i.test(last?.instruction ?? '')
      || (Boolean(last?.note && /\d{1,2}_{2,}/.test(last.note)) && /one word only/i.test(last?.instruction ?? ''))
    const lastIsSentence = /complete the sentences|complete each sentence/i.test(last?.instruction ?? '')
      || last?.type === 'sentence-completion'
    if (lastIsSummaryNote || (featN >= 5 && !lastIsSentence)) {
      return 'p2-r2-match-features-summary'
    }
  }

  // Multiset + assignment theo dải Q — ưu tiên hơn signature thuần type
  // (paste xáo trộn: type order = r3ysm nhưng số câu = r3my → chọn r3my)
  const candidates = listTemplateRoleCandidates(passageNumber)
  const byMulti = bestTemplateByRoleMultiset(part, candidates)

  // Exact order signature (type string)
  const exact = TEMPLATE_SIGNATURES[passageNumber][sig]
  // Role-ordered signature (instruction-aware)
  const roleSig = partRoleSignature(part)
  const byRoleOrder = TEMPLATE_SIGNATURES[passageNumber][roleSig]

  if (byMulti && exact && byMulti !== exact) {
    // Hai ứng viên: chấm SAMPLE assignment — dải Q thắng thứ tự type
    return byMulti
  }
  if (exact) return exact
  if (byRoleOrder) return byRoleOrder
  if (byMulti) return byMulti

  return IELTS_READING_DEFAULT_TEMPLATES[passageNumber]
}

/** Cache SAMPLE multiset theo passage — cho infer không phụ thuộc thứ tự. */
const _roleCandidateCache = new Map<
  IeltsReadingPassageNumber,
  Array<{
    kind: IeltsReadingWizardTemplateKind
    multisetKey: string
    roleSig: string
    sample: ReadingImportPartJson
  }>
>()

function listTemplateRoleCandidates(passageNumber: IeltsReadingPassageNumber) {
  const hit = _roleCandidateCache.get(passageNumber)
  if (hit) return hit
  const list: Array<{
    kind: IeltsReadingWizardTemplateKind
    multisetKey: string
    roleSig: string
    sample: ReadingImportPartJson
  }> = []
  for (const opt of templateOptionsForPassage(passageNumber)) {
    try {
      const sample = getIeltsReadingWizardTemplatePart(passageNumber, opt.kind)
      list.push({
        kind: opt.kind,
        multisetKey: partRoleMultisetKey(sample),
        roleSig: partRoleSignature(sample),
        sample,
      })
    } catch {
      // builder chưa sẵn (HMR)
    }
  }
  _roleCandidateCache.set(passageNumber, list)
  return list
}

function formatAnswerForKey(q: ReadingQuestion): string {
  const a = q.answer.trim().toLowerCase()
  if (q.type === 'true-false-not-given') {
    if (a === 'true') return 'TRUE'
    if (a === 'false') return 'FALSE'
    return 'NOT GIVEN'
  }
  if (q.type === 'yes-no-not-given') {
    if (a === 'yes') return 'YES'
    if (a === 'no') return 'NO'
    return 'NOT GIVEN'
  }
  if (q.type === 'multiple-choice' || q.type === 'matching-features') {
    return q.answer.toUpperCase()
  }
  return q.answer
}

export function buildAnswerKeyFromExam(parts: ReadingPart[]): string {
  const questions = parts
    .flatMap(p => p.questionGroups.flatMap(g => g.questions))
    .sort((a, b) => a.number - b.number)

  return questions.map(q => `${q.number} ${formatAnswerForKey(q)}`).join('\n')
}

export function parseCamTestFromExam(title: string, sourceFilename?: string): { cambridge: string; test: string } {
  const fromFile = sourceFilename?.match(/cam(\d+)-test(\d+)/i)
  if (fromFile) {
    return { cambridge: fromFile[1], test: fromFile[2] }
  }

  const fromTitle = title.match(/Cambridge\s*(\d+)[\s\S]*?Test\s*(\d+)/i)
  if (fromTitle) {
    return { cambridge: fromTitle[1], test: fromTitle[2] }
  }

  const camOnly = title.match(/Cam(?:bridge)?\s*(\d+)/i)
  const testOnly = title.match(/Test\s*(\d+)/i)
  return {
    cambridge: camOnly?.[1] ?? '10',
    test: testOnly?.[1] ?? '1',
  }
}

export function passageDraftFromPart(part: ReadingPart): PersistedPassageDraft {
  const passageNumber = part.partNumber as IeltsReadingPassageNumber
  const importPart = readingPartToImportJson(part)
  return {
    templateKind: inferTemplateKindFromPart(passageNumber, importPart),
    examText: '',
    part: importPart,
    rawJson: JSON.stringify(importPart, null, 2),
    warnings: [],
  }
}

export interface ReadingWizardEditState {
  activePassage: IeltsReadingPassageNumber
  title: string
  cambridge: string
  test: string
  answerKey: string
  drafts: Record<IeltsReadingPassageNumber, PersistedPassageDraft>
}

export function wizardEditStateFromExam(
  exam: ReadingExam,
  sourceFilename?: string,
): ReadingWizardEditState {
  const { cambridge, test } = parseCamTestFromExam(exam.title, sourceFilename)
  const drafts = createEmptyReadingWizardDrafts()

  for (const part of exam.parts) {
    if (part.partNumber < 1 || part.partNumber > 3) continue
    const n = part.partNumber as IeltsReadingPassageNumber
    drafts[n] = passageDraftFromPart(part)
  }

  return {
    activePassage: 1,
    title: exam.title,
    cambridge,
    test,
    answerKey: buildAnswerKeyFromExam(exam.parts),
    drafts,
  }
}

export function mergePassageImageKeys(oldParts: ReadingPart[], newParts: ReadingPart[]): ReadingPart[] {
  const oldByNum = new Map(oldParts.map(p => [p.partNumber, p]))

  return newParts.map(np => {
    const op = oldByNum.get(np.partNumber)
    if (!op) return np

    const passage = np.passage.map((block, i) => ({
      ...block,
      imageKey: block.imageKey ?? op.passage[i]?.imageKey,
      imageUrl: block.imageUrl ?? op.passage[i]?.imageUrl,
    }))

    const questionGroups = np.questionGroups.map((group, i) => ({
      ...group,
      imageKey: group.imageKey ?? op.questionGroups[i]?.imageKey,
      imageUrl: group.imageUrl ?? op.questionGroups[i]?.imageUrl,
      imageFile: group.imageFile ?? op.questionGroups[i]?.imageFile,
      noteTable: group.noteTable ?? op.questionGroups[i]?.noteTable,
      notePassage: group.notePassage ?? op.questionGroups[i]?.notePassage,
      notesTitle: group.notesTitle ?? op.questionGroups[i]?.notesTitle,
    }))

    return {
      ...np,
      passage,
      questionGroups,
      topImageUrl: np.topImageUrl ?? op.topImageUrl,
      bottomImageUrl: np.bottomImageUrl ?? op.bottomImageUrl,
    }
  })
}

export function allEditPassagesReady(
  drafts: Record<IeltsReadingPassageNumber, PersistedPassageDraft>,
): boolean {
  return IELTS_READING_PASSAGE_NUMBERS.every(n => drafts[n].part != null)
}