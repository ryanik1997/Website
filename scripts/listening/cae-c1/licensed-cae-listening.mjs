import { createHash } from 'node:crypto'
import { existsSync, statSync } from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const ROOT = path.resolve(HERE, '../../..')
export const DEFAULT_INPUT_ROOT = path.join(ROOT, 'tmp', 'cae-listening-licensed-input')

const PART_RULES = new Map([
  [1, { from: 1, to: 6, type: 'multiple-choice', optionIds: ['A', 'B', 'C'] }],
  [2, { from: 7, to: 14, type: 'gap-fill', optionIds: [] }],
  [3, { from: 15, to: 20, type: 'multiple-choice', optionIds: ['A', 'B', 'C', 'D'] }],
  [4, { from: 21, to: 30, type: 'matching', optionIds: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] }],
])

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function error(errors, code, message, location) {
  errors.push({ code, message, ...(location ? { location } : {}) })
}

function normalizeHostname(source) {
  const value = text(source)
  if (!value) return null
  try {
    return new URL(value).hostname.toLowerCase().replace(/\.$/, '')
  } catch {
    return null
  }
}

function isEngExamHost(hostname) {
  return hostname === 'engexam.info' || hostname?.endsWith('.engexam.info')
}

function safeAudioFilename(value) {
  const name = text(value)
  if (!name || path.isAbsolute(name) || name.includes('/') || name.includes('\\')) return false
  if (name === '.' || name === '..' || name.includes('..')) return false
  return path.extname(name).toLowerCase() === '.mp3'
}

function exactIds(options, expected) {
  if (!Array.isArray(options)) return false
  const ids = options.map(option => text(option?.id))
  return ids.length === expected.length && ids.every((id, index) => id === expected[index])
}

function getAnswerRecord(answers, number) {
  const raw = answers?.[String(number)]
  if (typeof raw === 'string') return { answer: raw }
  return isPlainObject(raw) ? raw : null
}

function folderTestNumber(testDir) {
  const match = testDir ? /^test-(\d{2})$/.exec(path.basename(testDir)) : null
  return match ? Number(match[1]) : null
}

export function validateLicensedCaePayload({ manifest, questions, answers, transcripts, testDir }) {
  const errors = []

  if (!isPlainObject(manifest)) {
    error(errors, 'manifest.invalid', 'manifest.json must contain an object.')
  } else {
    if (!Number.isInteger(manifest.testNumber) || manifest.testNumber < 1 || manifest.testNumber > 99) {
      error(errors, 'manifest.testNumber', 'testNumber must be an integer from 1 to 99.', 'manifest.testNumber')
    }
    const expectedFolderNumber = folderTestNumber(testDir)
    if (expectedFolderNumber != null && manifest.testNumber !== expectedFolderNumber) {
      error(errors, 'manifest.folderMismatch', `testNumber ${manifest.testNumber} must match folder ${path.basename(testDir)}.`, 'manifest.testNumber')
    }
    if (!text(manifest.title)) error(errors, 'manifest.title', 'title must be non-empty.', 'manifest.title')
    if (manifest.level !== 'c1') error(errors, 'manifest.level', 'level must be exactly "c1".', 'manifest.level')
    if (manifest.family !== 'cae') error(errors, 'manifest.family', 'family must be exactly "cae".', 'manifest.family')

    const license = manifest.license
    if (!isPlainObject(license)) {
      error(errors, 'license.missing', 'manifest.license must contain an object.', 'manifest.license')
    } else {
      if (!text(license.owner)) error(errors, 'license.owner', 'license.owner must be non-empty.', 'manifest.license.owner')
      if (!text(license.permission)) error(errors, 'license.permission', 'license.permission must be non-empty.', 'manifest.license.permission')
      if (!text(license.source)) error(errors, 'license.source', 'license.source must be non-empty.', 'manifest.license.source')
      const authorizations = [license.userOwned === true, license.licensed === true].filter(Boolean).length
      if (authorizations !== 1) {
        error(errors, 'license.authorization', 'Exactly one of license.userOwned or license.licensed must be true.', 'manifest.license')
      }
      const hostname = normalizeHostname(license.source)
      if (isEngExamHost(hostname) && !(license.writtenPermission === true && text(license.permissionEvidence))) {
        error(errors, 'license.engexam', 'engexam.info sources require writtenPermission=true and non-empty permissionEvidence.', 'manifest.license')
      }
    }

    if (!isPlainObject(manifest.audio)) {
      error(errors, 'audio.map', 'manifest.audio must contain part1 through part4.', 'manifest.audio')
    } else {
      for (let partNumber = 1; partNumber <= 4; partNumber += 1) {
        const key = `part${partNumber}`
        const filename = manifest.audio[key]
        if (!safeAudioFilename(filename)) {
          error(errors, 'audio.filename', `${key} must be a local .mp3 filename without path traversal.`, `manifest.audio.${key}`)
          continue
        }
        if (testDir) {
          const audioPath = path.join(testDir, filename)
          if (!existsSync(audioPath)) {
            error(errors, 'audio.missing', `Missing audio file ${filename}.`, `manifest.audio.${key}`)
          } else {
            const audioStat = statSync(audioPath)
            if (!audioStat.isFile()) error(errors, 'audio.notFile', `${filename} must be a regular file.`, `manifest.audio.${key}`)
            else if (audioStat.size === 0) error(errors, 'audio.empty', `${filename} must not be empty.`, `manifest.audio.${key}`)
          }
        }
      }
    }
  }

  const questionParts = Array.isArray(questions?.parts) ? questions.parts : null
  if (!questionParts || questionParts.length !== 4) {
    error(errors, 'questions.parts', 'questions.json must contain exactly four parts.', 'questions.parts')
  }

  const seenNumbers = new Set()
  const questionByNumber = new Map()
  if (questionParts) {
    for (const [index, part] of questionParts.entries()) {
      const partNumber = part?.partNumber
      const rule = PART_RULES.get(partNumber)
      if (!rule) {
        error(errors, 'questions.partNumber', `Invalid partNumber at parts[${index}].`, `questions.parts[${index}]`)
        continue
      }
      if (!text(part.rangeLabel)) error(errors, 'questions.rangeLabel', `Part ${partNumber} rangeLabel must be non-empty.`, `questions.parts[${index}].rangeLabel`)
      if (!text(part.instruction)) error(errors, 'questions.instruction', `Part ${partNumber} instruction must be non-empty.`, `questions.parts[${index}].instruction`)
      if (partNumber === 4) {
        if (part.matchingDualTask !== true) error(errors, 'questions.dualTask', 'Part 4 matchingDualTask must be true.', `questions.parts[${index}].matchingDualTask`)
        if (!text(part.taskOneInstruction)) error(errors, 'questions.taskOneInstruction', 'Part 4 taskOneInstruction must be non-empty.', `questions.parts[${index}].taskOneInstruction`)
        if (!text(part.taskTwoInstruction)) error(errors, 'questions.taskTwoInstruction', 'Part 4 taskTwoInstruction must be non-empty.', `questions.parts[${index}].taskTwoInstruction`)
      }
      const expectedCount = rule.to - rule.from + 1
      if (!Array.isArray(part.questions) || part.questions.length !== expectedCount) {
        error(errors, 'questions.count', `Part ${partNumber} must contain ${expectedCount} questions.`, `questions.parts[${index}].questions`)
        continue
      }
      for (const [questionIndex, question] of part.questions.entries()) {
        const location = `questions.parts[${index}].questions[${questionIndex}]`
        const expectedNumber = rule.from + questionIndex
        if (question?.number !== expectedNumber) error(errors, 'question.number', `Expected question ${expectedNumber}.`, `${location}.number`)
        if (seenNumbers.has(question?.number)) error(errors, 'question.duplicate', `Duplicate question number ${question?.number}.`, `${location}.number`)
        seenNumbers.add(question?.number)
        questionByNumber.set(question?.number, { question, rule })
        if (question?.type !== rule.type) error(errors, 'question.type', `Question ${expectedNumber} must be ${rule.type}.`, `${location}.type`)
        if (!text(question?.prompt)) error(errors, 'question.prompt', `Question ${expectedNumber} prompt must be non-empty.`, `${location}.prompt`)
        for (const forbidden of ['answer', 'acceptableAnswers', 'acceptedAnswers', 'explanation', 'correctAnswer']) {
          if (Object.prototype.hasOwnProperty.call(question ?? {}, forbidden)) {
            error(errors, 'question.answerLeak', `${forbidden} must live in answers.json, not questions.json.`, `${location}.${forbidden}`)
          }
        }
        if (rule.type === 'gap-fill') {
          if (Array.isArray(question?.options) && question.options.length > 0) error(errors, 'question.options', `Gap-fill question ${expectedNumber} must not have options.`, `${location}.options`)
        } else if (!exactIds(question?.options, rule.optionIds)) {
          error(errors, 'question.options', `Question ${expectedNumber} options must be ${rule.optionIds.join('/')}.`, `${location}.options`)
        } else if (question.options.some(option => !text(option?.label))) {
          error(errors, 'question.optionLabel', `Question ${expectedNumber} option labels must be non-empty.`, `${location}.options`)
        }
      }
    }
  }

  if (seenNumbers.size !== 30 || Array.from({ length: 30 }, (_, index) => index + 1).some(number => !seenNumbers.has(number))) {
    error(errors, 'questions.range', 'Question numbers must be unique and exactly 1 through 30.', 'questions.parts')
  }

  const answerMap = isPlainObject(answers?.answers) ? answers.answers : null
  if (!answerMap) {
    error(errors, 'answers.map', 'answers.json must contain an answers object.', 'answers.answers')
  } else {
    const keys = Object.keys(answerMap)
    const expectedKeys = Array.from({ length: 30 }, (_, index) => String(index + 1))
    if (keys.length !== 30 || expectedKeys.some(key => !Object.prototype.hasOwnProperty.call(answerMap, key))) {
      error(errors, 'answers.count', 'answers must contain exactly keys 1 through 30.', 'answers.answers')
    }
    for (const key of keys) {
      if (!expectedKeys.includes(key)) error(errors, 'answers.extra', `Unexpected answer key ${key}.`, `answers.answers.${key}`)
    }
    for (let number = 1; number <= 30; number += 1) {
      const record = getAnswerRecord(answerMap, number)
      if (!record || !text(record.answer)) {
        error(errors, 'answer.missing', `Answer ${number} must be non-empty.`, `answers.answers.${number}`)
        continue
      }
      const questionInfo = questionByNumber.get(number)
      if (questionInfo && questionInfo.rule.type !== 'gap-fill') {
        const validIds = questionInfo.question.options?.map(option => option.id) ?? []
        if (!validIds.includes(record.answer)) error(errors, 'answer.option', `Answer ${number} must match one of the question option IDs.`, `answers.answers.${number}.answer`)
      }
      if (record.acceptableAnswers != null && (!Array.isArray(record.acceptableAnswers) || record.acceptableAnswers.some(value => !text(value)))) {
        error(errors, 'answer.acceptableAnswers', `Answer ${number} acceptableAnswers must contain non-empty strings.`, `answers.answers.${number}.acceptableAnswers`)
      }
    }
  }

  let transcriptMode = null
  if (isPlainObject(transcripts?.parts)) {
    const partKeys = Object.keys(transcripts.parts)
    const complete = ['1', '2', '3', '4'].every(key => text(transcripts.parts[key]))
    if (!complete || partKeys.some(key => !['1', '2', '3', '4'].includes(key))) {
      error(errors, 'transcripts.parts', 'transcripts.parts must contain exactly non-empty parts 1 through 4.', 'transcripts.parts')
    } else {
      transcriptMode = 'parts'
    }
  } else if (text(transcripts?.fullTranscript) && text(transcripts?.mappingPolicy)) {
    transcriptMode = 'full'
  } else {
    error(errors, 'transcripts.missing', 'Provide four part transcripts or fullTranscript with mappingPolicy.', 'transcripts')
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      testNumber: Number.isInteger(manifest?.testNumber) ? manifest.testNumber : null,
      title: text(manifest?.title) || null,
      sourceHostname: normalizeHostname(manifest?.license?.source),
      authorization: manifest?.license?.userOwned === true ? 'user-owned' : manifest?.license?.licensed === true ? 'licensed' : null,
      questionCount: seenNumbers.size,
      answerCount: answerMap ? Object.keys(answerMap).length : 0,
      transcriptMode,
    },
  }
}

export async function readLicensedCaeTest(testDir) {
  const filenames = ['manifest.json', 'questions.json', 'answers.json', 'transcripts.json']
  const missing = filenames.filter(filename => !existsSync(path.join(testDir, filename)))
  if (missing.length > 0) {
    return {
      ok: false,
      errors: missing.map(filename => ({ code: 'file.missing', message: `Missing ${filename}.`, location: filename })),
      summary: { testNumber: null, title: null, sourceHostname: null, authorization: null, questionCount: 0, answerCount: 0, transcriptMode: null },
      testDir,
    }
  }

  try {
    const [manifest, questions, answers, transcripts] = await Promise.all(
      filenames.map(filename => fs.readFile(path.join(testDir, filename), 'utf8').then(JSON.parse)),
    )
    return {
      ...validateLicensedCaePayload({ manifest, questions, answers, transcripts, testDir }),
      testDir,
      payload: { manifest, questions, answers, transcripts },
    }
  } catch (caught) {
    return {
      ok: false,
      errors: [{ code: 'file.json', message: caught instanceof Error ? caught.message : String(caught) }],
      summary: { testNumber: null, title: null, sourceHostname: null, authorization: null, questionCount: 0, answerCount: 0, transcriptMode: null },
      testDir,
    }
  }
}

export async function discoverLicensedCaeInput(inputRoot = DEFAULT_INPUT_ROOT) {
  if (!existsSync(inputRoot)) return { testDirs: [], unexpectedDirectories: [] }
  const entries = await fs.readdir(inputRoot, { withFileTypes: true })
  const directories = entries.filter(entry => entry.isDirectory())
  return {
    testDirs: directories
      .filter(entry => /^test-\d{2}$/.test(entry.name))
      .map(entry => path.join(inputRoot, entry.name))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true })),
    unexpectedDirectories: directories
      .filter(entry => !/^test-\d{2}$/.test(entry.name))
      .map(entry => path.join(inputRoot, entry.name))
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true })),
  }
}

export async function discoverLicensedCaeTests(inputRoot = DEFAULT_INPUT_ROOT) {
  return (await discoverLicensedCaeInput(inputRoot)).testDirs
}

function transcriptForPart(transcripts, partNumber) {
  if (isPlainObject(transcripts.parts)) return text(transcripts.parts[String(partNumber)])
  return text(transcripts.fullTranscript)
}

export function buildCatalogExam(payload) {
  const { manifest, questions, answers, transcripts } = payload
  const testNumber = manifest.testNumber
  const id = `catalog-listening-cae-c1-test${testNumber}`
  const slug = `cae-c1-test${testNumber}`
  const answerMap = answers.answers

  const parts = questions.parts.map(part => {
    const partId = `${id}-part-${part.partNumber}`
    const audioFilename = manifest.audio[`part${part.partNumber}`]
    return {
      id: partId,
      partNumber: part.partNumber,
      rangeLabel: part.rangeLabel,
      instruction: part.instruction,
      audioUrl: `/catalog/listening/${slug}/${audioFilename}`,
      transcript: transcriptForPart(transcripts, part.partNumber),
      ...(part.passageTitle ? { passageTitle: part.passageTitle } : {}),
      ...(part.audioIntro ? { audioIntro: part.audioIntro } : {}),
      ...(part.matchingDualTask ? { matchingDualTask: true } : {}),
      ...(part.taskOneInstruction ? { taskOneInstruction: part.taskOneInstruction } : {}),
      ...(part.taskTwoInstruction ? { taskTwoInstruction: part.taskTwoInstruction } : {}),
      questions: part.questions.map(question => {
        const answer = getAnswerRecord(answerMap, question.number)
        return {
          id: `${id}-q-${question.number}`,
          number: question.number,
          type: question.type,
          prompt: question.prompt,
          options: question.options ?? [],
          answer: answer.answer,
          explanation: text(answer.explanation),
          ...(Array.isArray(answer.acceptableAnswers) ? { acceptableAnswers: answer.acceptableAnswers } : {}),
          ...(Number.isInteger(question.wordLimit) ? { wordLimit: question.wordLimit } : {}),
          ...(question.context ? { context: question.context } : {}),
        }
      }),
    }
  })

  return {
    id,
    title: manifest.title,
    durationMinutes: Number.isFinite(manifest.durationMinutes) ? manifest.durationMinutes : 40,
    bandHint: 'C1 Advanced Listening · 4 parts · 30 câu',
    examType: 'cae',
    examMode: 'practice',
    parts,
    catalogSlug: slug,
    catalogBase: `/catalog/listening/${slug}`,
  }
}

const ANSWER_FIELDS = new Set(['answer', 'acceptedAnswers', 'acceptableAnswers', 'explanation', 'correct', 'correctAnswer', 'correctAnswers', 'solution', 'solutions', 'answerKey', 'key', 'feedback'])

export function stripAnswerFields(value) {
  if (Array.isArray(value)) return value.map(stripAnswerFields)
  if (!isPlainObject(value)) return value
  return Object.fromEntries(Object.entries(value).filter(([key]) => !ANSWER_FIELDS.has(key)).map(([key, child]) => [key, stripAnswerFields(child)]))
}

export function buildAnswerVault(exam) {
  const vault = {}
  for (const part of exam.parts) {
    for (const question of part.questions) {
      vault[question.id] = {
        answer: question.answer,
        ...(question.acceptableAnswers ? { acceptableAnswers: question.acceptableAnswers } : {}),
        explanation: question.explanation ?? '',
      }
    }
  }
  return { examId: exam.id, version: 1, mode: 'answers-vault', answers: vault }
}

export function buildRuntimeBody(exam) {
  return {
    ...stripAnswerFields(exam),
    answersPath: `catalog/exams/listening/${exam.id}.answers.json`,
    answersRemote: true,
    bodyRemote: true,
  }
}

export function buildCatalogStub(exam) {
  return {
    id: exam.id,
    title: exam.title,
    durationMinutes: exam.durationMinutes,
    bandHint: exam.bandHint,
    examType: exam.examType,
    examMode: exam.examMode,
    questionCount: 30,
    bodyPath: `catalog/exams/listening/${exam.id}.json`,
    answersPath: `catalog/exams/listening/${exam.id}.answers.json`,
    bodyRemote: true,
    answersRemote: true,
    parts: exam.parts.map(part => ({ id: part.id, partNumber: part.partNumber, rangeLabel: part.rangeLabel, questions: [] })),
  }
}

export function stableJson(value, compact = false) {
  return `${JSON.stringify(value, null, compact ? 0 : 2)}${compact ? '' : '\n'}`
}

export function sha256(value) {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(typeof value === 'string' ? value : stableJson(value))
  return createHash('sha256').update(buffer).digest('hex')
}

export function parseCliArgs(argv = process.argv.slice(2)) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const [rawKey, inline] = token.slice(2).split('=', 2)
    if (inline != null) args[rawKey] = inline
    else if (argv[index + 1] && !argv[index + 1].startsWith('--')) args[rawKey] = argv[++index]
    else args[rawKey] = true
  }
  return args
}

export function resolveProjectLocalPath(raw, fallback) {
  const target = raw ? path.resolve(ROOT, raw) : fallback
  const relative = path.relative(ROOT, target)
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Path must stay inside project: ${target}`)
  return target
}
