import { unzip } from 'fflate'
import { audioRepo, examRepo } from '@ryan/db'
import { backupReadingExam } from '../examAutoBackup'
import { type ReadingExam, type ReadingPart } from '../examData'
import { publishedAnswersPath, PUBLISHED_ANSWER_FIELDS } from '../examAnswerSecurity'
import { examRecordFromReading } from '../examLoader'
import { readingExamMediaKey } from '../importReadingManualUtils'
import { publishReadingExamToCloud } from '../readingExamPublish'
import { sanitizeReadingExam } from '../readingExamSanitize'

export type BatchReadingZipImportItemStatus = 'pending' | 'success' | 'failed' | 'skipped'

export type BatchReadingZipImportItemResult = {
  fileName: string
  examId?: string
  title?: string
  status: BatchReadingZipImportItemStatus
  errors: string[]
  warnings: string[]
  message?: string
  questionCount?: number
  answerCount?: number
  imageCount?: number
  partCount?: number
}

export type BatchReadingZipImportOptions = {
  overwriteExisting?: boolean
  dryRun?: boolean
  examTrack?: 'ielts' | 'cambridge'
  cambridgeLevel?: 'a2' | 'b1' | 'b2' | 'c1' | 'c2'
  publishToCloud?: boolean
}

type AnswersVault = {
  examId?: string
  answers?: Record<string, Record<string, unknown>>
}

type ZipImageAsset = {
  path: string
  file: File
}

type ZipExamBundle = {
  fileName: string
  bodyPath?: string
  answersPath?: string
  metaPath?: string
  body?: ReadingExam
  answers?: AnswersVault
  meta?: Record<string, unknown>
  imageAssets: ZipImageAsset[]
  rawEntryPaths: string[]
}

type ValidationContext = {
  bundle: ZipExamBundle
}

type ImporterDeps = {
  readEntries(file: File): Promise<Record<string, Uint8Array>>
  getExistingExam(examId: string): Promise<unknown>
  persistExam(exam: ReadingExam, sourceFilename: string, options: BatchReadingZipImportOptions): Promise<void>
  putMedia(key: string, blob: Blob): Promise<void>
}

const BODY_RE = /(^|\/)catalog\/exams\/reading\/catalog-reading-.*\.json$/i
const ANSWERS_RE = /(^|\/)catalog\/exams\/reading\/catalog-reading-.*\.answers\.json$/i
const META_RE = /(^|\/)meta-entry-to-paste-into-catalog-reading-meta\.json$/i
const IMAGE_RE = /(^|\/)catalog\/reading\/.+\.(png|jpe?g|webp|gif)$/i

const defaultDeps: ImporterDeps = {
  async readEntries(file) {
    const buffer = await file.arrayBuffer()
    return new Promise<Record<string, Uint8Array>>((resolve, reject) => {
      unzip(new Uint8Array(buffer), (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  },
  getExistingExam(examId) {
    return examRepo.get(examId)
  },
  async persistExam(exam, sourceFilename, options) {
    await examRepo.create(examRecordFromReading(exam, 'manual', sourceFilename))
    await backupReadingExam(exam, { sourceFilename }).catch(() => undefined)
    if (options.publishToCloud) {
      await publishReadingExamToCloud(exam, { source: 'manual', sourceFilename })
    }
  },
  putMedia(key, blob) {
    return audioRepo.put(key, blob)
  },
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '')
}

function normalizeCatalogRelativePath(path: string | undefined): string | undefined {
  const normalized = normalizePath(path ?? '')
  const catalogIndex = normalized.toLowerCase().indexOf('catalog/')
  if (catalogIndex >= 0) {
    return normalized.slice(catalogIndex)
  }
  return normalized || undefined
}

function basename(path: string): string {
  return normalizePath(path).split('/').pop() ?? path
}

function isMacMeta(path: string): boolean {
  const normalized = normalizePath(path)
  return normalized.startsWith('__MACOSX/') || normalized.includes('/._') || basename(normalized).startsWith('._')
}

function parseJson<T>(bytes: Uint8Array, label: string): T {
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T
  } catch {
    throw new Error(`${label}: JSON không hợp lệ.`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function questionEntries(exam: ReadingExam) {
  const rows: Array<{
    part: ReadingPart
    group: ReadingPart['questionGroups'][number]
    question: ReadingPart['questionGroups'][number]['questions'][number]
  }> = []
  for (const part of exam.parts ?? []) {
    for (const group of part.questionGroups ?? []) {
      for (const question of group.questions ?? []) {
        rows.push({ part, group, question })
      }
    }
  }
  return rows
}

function detectPetB1Exam(exam: ReadingExam): boolean {
  return exam.cambridgeLevel === 'b1'
    || /pet|preliminary|b1/i.test(`${exam.id} ${exam.title} ${exam.bandHint}`)
}

function mergeAnswersIntoBody(body: ReadingExam, answers: AnswersVault): { exam: ReadingExam; answerCount: number } {
  const answersMap = answers.answers ?? {}
  let answerCount = 0

  const parts = body.parts.map(part => ({
    ...part,
    questionGroups: part.questionGroups.map(group => ({
      ...group,
      questions: group.questions.map(question => {
        const answerPatch = answersMap[question.id]
        if (!answerPatch) return question
        answerCount += 1
        return {
          ...question,
          ...answerPatch,
        }
      }),
    })),
  }))

  return {
    exam: sanitizeReadingExam({ ...body, parts }),
    answerCount,
  }
}

function findImageAsset(assets: ZipImageAsset[], rawPath?: string): ZipImageAsset | undefined {
  if (!rawPath?.trim()) return undefined
  const normalized = normalizePath(rawPath).toLowerCase()
  return assets.find(asset => normalizePath(asset.path).toLowerCase() === normalized)
    ?? assets.find(asset => normalizePath(asset.path).toLowerCase().endsWith(`/${normalized}`))
    ?? assets.find(asset => basename(asset.path).toLowerCase() === basename(normalized).toLowerCase())
}

async function persistImageAssets(
  exam: ReadingExam,
  assets: ZipImageAsset[],
  deps: ImporterDeps,
): Promise<{ exam: ReadingExam; imageCount: number; warnings: string[] }> {
  let imageCount = 0
  const warnings: string[] = []

  const parts = await Promise.all(exam.parts.map(async part => {
    const passage = await Promise.all(part.passage.map(async (block, blockIndex) => {
      const asset = findImageAsset(assets, block.imageUrl)
      if (!asset) return block
      const key = readingExamMediaKey(exam.id, `batch-part${part.partNumber}-img-${blockIndex}`)
      await deps.putMedia(key, asset.file)
      imageCount += 1
      return { ...block, imageKey: key, imageUrl: undefined }
    }))

    const questionGroups = await Promise.all(part.questionGroups.map(async (group, groupIndex) => {
      const asset = findImageAsset(assets, group.imageUrl)
      if (!asset) return group
      const key = readingExamMediaKey(exam.id, `batch-part${part.partNumber}-group-img-${groupIndex}`)
      await deps.putMedia(key, asset.file)
      imageCount += 1
      return { ...group, imageKey: key, imageUrl: undefined }
    }))

    const topAsset = findImageAsset(assets, part.topImageUrl)
    const bottomAsset = findImageAsset(assets, part.bottomImageUrl)
    if (topAsset) warnings.push(`Part ${part.partNumber}: giữ nguyên topImageUrl vì local runtime chưa có blob slot riêng.`)
    if (bottomAsset) warnings.push(`Part ${part.partNumber}: giữ nguyên bottomImageUrl vì local runtime chưa có blob slot riêng.`)

    return { ...part, passage, questionGroups }
  }))

  return { exam: { ...exam, parts }, imageCount, warnings }
}

function buildBundleFromEntries(fileName: string, entries: Record<string, Uint8Array>): ZipExamBundle {
  const bodyPaths: string[] = []
  const answersPaths: string[] = []
  const metaPaths: string[] = []
  const imageAssets: ZipImageAsset[] = []
  const rawEntryPaths: string[] = []

  for (const [rawPath, bytes] of Object.entries(entries)) {
    if (isMacMeta(rawPath)) continue
    const path = normalizePath(rawPath)
    rawEntryPaths.push(path)
    if (BODY_RE.test(path) && !ANSWERS_RE.test(path)) bodyPaths.push(path)
    if (ANSWERS_RE.test(path)) answersPaths.push(path)
    if (META_RE.test(path)) metaPaths.push(path)
    if (IMAGE_RE.test(path)) {
      const name = basename(path)
      const type = name.toLowerCase().endsWith('.png')
        ? 'image/png'
        : name.toLowerCase().endsWith('.webp')
          ? 'image/webp'
          : name.toLowerCase().endsWith('.gif')
            ? 'image/gif'
            : 'image/jpeg'
      imageAssets.push({
        path,
        file: new File([new Uint8Array(bytes)], name, { type }),
      })
    }
  }

  const bundle: ZipExamBundle = {
    fileName,
    imageAssets,
    rawEntryPaths,
  }

  if (bodyPaths.length === 1) {
    bundle.bodyPath = bodyPaths[0]
    bundle.body = parseJson<ReadingExam>(entries[bodyPaths[0]], `${fileName} / body`)
  }
  if (answersPaths.length === 1) {
    bundle.answersPath = answersPaths[0]
    bundle.answers = parseJson<AnswersVault>(entries[answersPaths[0]], `${fileName} / answers`)
  }
  if (metaPaths.length >= 1) {
    bundle.metaPath = metaPaths[0]
    bundle.meta = parseJson<Record<string, unknown>>(entries[metaPaths[0]], `${fileName} / meta`)
  }

  return bundle
}

function validateBundle(context: ValidationContext): BatchReadingZipImportItemResult {
  const { bundle } = context
  const errors: string[] = []
  const warnings: string[] = []

  const bodyMatches = bundle.rawEntryPaths.filter(path => BODY_RE.test(path) && !ANSWERS_RE.test(path))
  if (bodyMatches.length === 0) errors.push('ZIP thiếu body JSON Reading.')
  if (bodyMatches.length > 1) errors.push('ZIP contains multiple reading body JSON files. Please split into one exam per zip.')

  const answerMatches = bundle.rawEntryPaths.filter(path => ANSWERS_RE.test(path))
  if (answerMatches.length === 0) errors.push('ZIP thiếu answers JSON.')
  if (answerMatches.length > 1) errors.push('ZIP chứa nhiều answers JSON.')

  if (!bundle.body || !bundle.answers) {
    return {
      fileName: bundle.fileName,
      status: 'failed',
      errors,
      warnings,
    }
  }

  const body = sanitizeReadingExam(bundle.body)
  const examQuestions = questionEntries(body)
  const ids = examQuestions.map(row => row.question.id)
  const uniqueIds = new Set(ids)
  const answerMap = bundle.answers.answers ?? {}
  const answerKeys = Object.keys(answerMap)

  if (!body.id?.trim()) errors.push('Body thiếu id.')
  if (body.id && !body.id.startsWith('catalog-reading-')) warnings.push('Body id không bắt đầu bằng "catalog-reading-".')
  if (!body.title?.trim()) errors.push('Body thiếu title.')
  if (!(body.durationMinutes > 0)) errors.push('durationMinutes phải > 0.')
  if (!Array.isArray(body.parts) || body.parts.length === 0) errors.push('Body thiếu parts.')

  for (const row of examQuestions) {
    const bodyQuestion = row.question as unknown as Record<string, unknown>
    for (const field of PUBLISHED_ANSWER_FIELDS) {
      const value = bodyQuestion[field]
      if (typeof value === 'string' && value.trim()) {
        warnings.push(`Question ${row.question.number}: body đã chứa field "${field}".`)
        break
      }
    }
  }

  if (uniqueIds.size !== ids.length) errors.push('Body có duplicate question.id.')
  if (bundle.answers.examId !== body.id) errors.push('answers.examId không khớp body.id.')
  if (!isRecord(bundle.answers.answers)) errors.push('answers.answers phải là object.')

  for (const row of examQuestions) {
    const patch = answerMap[row.question.id]
    if (!patch) {
      errors.push(`Thiếu answer cho question.id "${row.question.id}".`)
      continue
    }
    const answerValue = patch.answer
    if (typeof answerValue !== 'string' || !answerValue.trim()) {
      errors.push(`Answer rỗng cho question.id "${row.question.id}".`)
    }
    if (typeof patch.explanation !== 'string' || !patch.explanation.trim()) {
      warnings.push(`Question ${row.question.number}: explanation đang rỗng.`)
    }
  }

  for (const key of answerKeys) {
    if (!uniqueIds.has(key)) {
      errors.push(`answers có key dư "${key}".`)
    }
  }

  if (bundle.meta) {
    if (bundle.meta.id !== body.id) errors.push('Meta id không khớp body.id.')
    const normalizedMetaBodyPath = normalizeCatalogRelativePath(
      typeof bundle.meta.bodyPath === 'string' ? bundle.meta.bodyPath : undefined,
    )
    const normalizedBundleBodyPath = normalizeCatalogRelativePath(bundle.bodyPath)
    if (
      normalizedBundleBodyPath
      && normalizedMetaBodyPath
      && normalizedMetaBodyPath !== normalizedBundleBodyPath
    ) {
      warnings.push('Meta bodyPath không khớp path trong ZIP.')
    }
    const expectedAnswers = publishedAnswersPath(body.id, 'reading')
    const normalizedMetaAnswersPath = normalizeCatalogRelativePath(
      typeof bundle.meta.answersPath === 'string' ? bundle.meta.answersPath : undefined,
    )
    const normalizedExpectedAnswersPath = normalizeCatalogRelativePath(expectedAnswers)
    if (
      normalizedMetaAnswersPath
      && normalizedExpectedAnswersPath
      && normalizedMetaAnswersPath !== normalizedExpectedAnswersPath
    ) {
      warnings.push('Meta answersPath không khớp path answers chuẩn.')
    }
    if (typeof bundle.meta.questionCount === 'number' && bundle.meta.questionCount !== examQuestions.length) {
      errors.push('Meta questionCount không khớp số câu thực tế.')
    }
  }

  const imageRefs: string[] = []
  for (const part of body.parts) {
    if (part.topImageUrl) imageRefs.push(part.topImageUrl)
    if (part.bottomImageUrl) imageRefs.push(part.bottomImageUrl)
    for (const block of part.passage) if (block.imageUrl) imageRefs.push(block.imageUrl)
    for (const group of part.questionGroups) if (group.imageUrl) imageRefs.push(group.imageUrl)
  }

  for (const ref of imageRefs) {
    if (!findImageAsset(bundle.imageAssets, ref)) {
      errors.push(`Thiếu asset ảnh cho "${ref}".`)
    }
  }

  if (detectPetB1Exam(body)) {
    const expectedCounts = [5, 5, 5, 5, 6, 6]
    if (body.parts.length !== 6) errors.push('PET B1 phải có 6 parts.')
    if (examQuestions.length !== 32) errors.push(`PET B1 phải có 32 câu, hiện có ${examQuestions.length}.`)
    body.parts.forEach((part, index) => {
      const count = part.questionGroups.reduce((sum, group) => sum + group.questions.length, 0)
      if (expectedCounts[index] != null && count !== expectedCounts[index]) {
        errors.push(`Part ${part.partNumber} phải có ${expectedCounts[index]} câu, hiện có ${count}.`)
      }
    })
    const numbers = examQuestions.map(row => row.question.number).sort((a, b) => a - b)
    for (let i = 0; i < numbers.length; i += 1) {
      if (numbers[i] !== i + 1) {
        errors.push('PET B1 phải đánh số liên tục 1–32.')
        break
      }
    }
  }

  return {
    fileName: bundle.fileName,
    examId: body.id,
    title: body.title,
    status: errors.length ? 'failed' : 'pending',
    errors,
    warnings,
    questionCount: examQuestions.length,
    answerCount: answerKeys.length,
    imageCount: bundle.imageAssets.length,
    partCount: body.parts.length,
  }
}

async function importOneFile(
  file: File,
  options: BatchReadingZipImportOptions,
  deps: ImporterDeps,
): Promise<BatchReadingZipImportItemResult> {
  if (!file.name.toLowerCase().endsWith('.zip')) {
    return {
      fileName: file.name,
      status: 'failed',
      errors: ['Chỉ hỗ trợ file .zip.'],
      warnings: [],
    }
  }

  try {
    const entries = await deps.readEntries(file)
    const bundle = buildBundleFromEntries(file.name, entries)
    const validation = validateBundle({ bundle })
    if (validation.status === 'failed' || !bundle.body || !bundle.answers) {
      return validation
    }

    const existing = await deps.getExistingExam(bundle.body.id)
    if (existing && !options.overwriteExisting) {
      return {
        ...validation,
        status: 'skipped',
        message: 'Exam already exists',
      }
    }

    if (options.dryRun) {
      return validation
    }

    const merged = mergeAnswersIntoBody(bundle.body, bundle.answers)
    let exam = merged.exam
    if (!exam.examTrack && options.examTrack) exam = { ...exam, examTrack: options.examTrack }
    if (!exam.cambridgeLevel && options.cambridgeLevel) exam = { ...exam, cambridgeLevel: options.cambridgeLevel }
    const mediaPersisted = await persistImageAssets(exam, bundle.imageAssets, deps)
    exam = mediaPersisted.exam
    await deps.persistExam(exam, file.name, options)

    return {
      ...validation,
      status: 'success',
      message: existing ? 'Overwritten existing exam' : `Imported ${validation.questionCount ?? 0} questions`,
      answerCount: merged.answerCount,
      imageCount: mediaPersisted.imageCount,
      warnings: [...validation.warnings, ...mediaPersisted.warnings],
    }
  } catch (err) {
    return {
      fileName: file.name,
      status: 'failed',
      errors: [err instanceof Error ? err.message : 'Import batch thất bại.'],
      warnings: [],
    }
  }
}

export async function importReadingZipBatch(
  files: File[],
  options: BatchReadingZipImportOptions = {},
): Promise<BatchReadingZipImportItemResult[]> {
  const results: BatchReadingZipImportItemResult[] = []
  for (const file of files) {
    results.push(await importOneFile(file, options, defaultDeps))
  }
  return results
}

export const __batchReadingZipImportTestUtils = {
  buildBundleFromEntries,
  validateBundle,
  mergeAnswersIntoBody,
  persistImageAssets,
  importOneFile: (file: File, options: BatchReadingZipImportOptions, deps: Partial<ImporterDeps>) =>
    importOneFile(file, options, { ...defaultDeps, ...deps }),
}
