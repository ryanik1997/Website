/**
 * Export pilot IELTS Reading bundles từ builtin exams.
 *
 *   pnpm ielts:reading:export-pilots
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ReadingExam, ReadingPart, ReadingQuestionGroup } from '../apps/web/src/features/exam/examData.ts'
import { READING_EXAMS } from '../apps/web/src/features/exam/examData.ts'
import type { ReadingImportPartJson, ReadingImportQuestionGroupJson } from '../apps/web/src/features/exam/importReadingManualUtils.ts'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const IELTS_ROOT = join(ROOT, 'Tainguyen', 'IELTS')

function partToPassageJson(part: ReadingPart): ReadingImportPartJson {
  const mapGroup = (group: ReadingQuestionGroup): ReadingImportQuestionGroupJson => ({
    range: group.range,
    instruction: group.instruction,
    note: group.note,
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
      ...(block.imageKey ? { imageFile: `part${part.partNumber}-p${part.passage.indexOf(block)}.jpg` } : {}),
    })),
    questionGroups: part.questionGroups.map(mapGroup),
  }
}

function writePassages(dir: string, exam: ReadingExam) {
  mkdirSync(dir, { recursive: true })
  for (const part of exam.parts) {
    const file = `exam_passage${part.partNumber}.json`
    writeFileSync(join(dir, file), `${JSON.stringify(partToPassageJson(part), null, 2)}\n`, 'utf8')
    console.log(`  ✓ ${file}`)
  }
}

function updateMeta(dir: string, cam: number, test: number, templates: [string, string, string]) {
  const metaPath = join(dir, 'meta.json')
  if (!existsSync(metaPath)) return
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'))
  meta.passages = meta.passages.map((p: { partNumber: number }, i: number) => ({
    ...p,
    template: templates[i] ?? p.template,
  }))
  meta.title = `IELTS Reading — Cambridge ${cam} Test ${test}`
  meta.bandHint = `IELTS Academic · Cambridge ${cam} · Test ${test} · 3 passages · 40 câu`
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8')
}

function cloneExam(exam: ReadingExam, title: string): ReadingExam {
  return JSON.parse(JSON.stringify({ ...exam, title })) as ReadingExam
}

function buildCam11Test3(): ReadingExam {
  const mock = READING_EXAMS.find(e => e.id === 'ielts-reading-01')!
  const demo = READING_EXAMS.find(e => e.id === 'ielts-reading-types-demo')!
  const exam = cloneExam(mock, 'IELTS Reading — Cambridge 11 Test 3')

  const headingsPart = demo.parts[0]
  const p1: ReadingPart = {
    ...headingsPart,
    id: 'pilot-p1',
    partNumber: 1,
    rangeLabel: 'Read the text and answer questions 1–13.',
    questionGroups: [
      headingsPart.questionGroups[0],
      {
        id: 'p1-g2',
        range: 'Questions 8–13',
        type: 'multiple-choice',
        instruction: 'Choose the correct letter, A, B, C or D.',
        questions: mock.parts[0].questionGroups[1].questions.slice(1).map((q, i) => ({
          ...q,
          number: 8 + i,
          id: `pilot-q${8 + i}`,
        })),
      },
    ],
  }

  exam.parts = [p1, { ...mock.parts[1] }, { ...mock.parts[2] }]
  return exam
}

function buildCam10Test4(): ReadingExam {
  const mock = READING_EXAMS.find(e => e.id === 'ielts-reading-01')!
  const demo = READING_EXAMS.find(e => e.id === 'ielts-reading-types-demo')!
  const exam = cloneExam(mock, 'IELTS Reading — Cambridge 10 Test 4')

  const ynngGroup = demo.parts[1].questionGroups[0]
  const origP2 = mock.parts[1]
  const matchPara = origP2.questionGroups[0]
  const matchFeat = origP2.questionGroups[1]
  const mc = origP2.questionGroups[2]

  const rebuiltP2: ReadingPart = {
    ...origP2,
    questionGroups: [
      {
        ...ynngGroup,
        id: 'p2-g1',
        range: 'Questions 14–18',
        questions: ynngGroup.questions.map((q, i) => ({
          ...q,
          number: 14 + i,
          id: `pilot-q${14 + i}`,
        })),
      },
      {
        ...matchPara,
        range: 'Questions 19–22',
        questions: matchPara.questions.slice(0, 4).map((q, i) => ({
          ...q,
          number: 19 + i,
          id: `pilot-q${19 + i}`,
        })),
      },
      {
        ...matchFeat,
        range: 'Questions 23–25',
        questions: matchFeat.questions.slice(0, 3).map((q, i) => ({
          ...q,
          number: 23 + i,
          id: `pilot-q${23 + i}`,
        })),
      },
      {
        ...mc,
        range: 'Questions 26',
        questions: mc.questions.slice(0, 1).map(q => ({
          ...q,
          number: 26,
          id: 'pilot-q26',
        })),
      },
    ],
  }

  exam.parts = [{ ...mock.parts[0] }, rebuiltP2, { ...mock.parts[2] }]
  return exam
}

const pilots: Array<{ folder: string; cam: number; test: number; exam: ReadingExam; templates: [string, string, string] }> = [
  {
    folder: 'Reading IELTS_Test1_Cam10',
    cam: 10,
    test: 1,
    exam: READING_EXAMS.find(e => e.id === 'ielts-reading-01')!,
    templates: ['r1-tfng-mc', 'r2-match-mc', 'r3-tfng-mc'],
  },
  {
    folder: 'Reading IELTS_Test3_Cam11',
    cam: 11,
    test: 3,
    exam: buildCam11Test3(),
    templates: ['r1-headings-mc', 'r2-match-mc', 'r3-tfng-mc'],
  },
  {
    folder: 'Reading IELTS_Test4_Cam10',
    cam: 10,
    test: 4,
    exam: buildCam10Test4(),
    templates: ['r1-tfng-mc', 'r2-ynng-match', 'r3-tfng-mc'],
  },
]

console.log('📦 Export IELTS Reading pilots\n')

for (const pilot of pilots) {
  const dir = join(IELTS_ROOT, pilot.folder)
  console.log(`\n${pilot.folder}`)
  writePassages(dir, pilot.exam)
  updateMeta(dir, pilot.cam, pilot.test, pilot.templates)
}

console.log('\n✓ Xong. Chạy: pnpm ielts:reading:bundle cho từng pilot.')