/**
 * Auto-backup đề Reading/Listening khi import / Wizard lưu.
 *
 * Lớp lưu (từ bền → tiện):
 * 1. Dexie `examBackups` (sống sót clear site data của tab khác? — cùng origin)
 * 2. OPFS `exam-backups/` (Origin Private File System)
 * 3. (tuỳ chọn) tải file .json về máy
 *
 * Không thay thế Publish cloud — chạy song song với publish.
 */
import { examBackupRepo, examRepo, listeningExamRepo, settingsRepo } from '@ryan/db'
import type { ReadingExam } from './examData'
import type { ListeningExam } from './listeningExamData'

export const EXAM_AUTO_BACKUP_ENABLED_KEY = 'exam-auto-backup-enabled'
export const EXAM_AUTO_BACKUP_DOWNLOAD_KEY = 'exam-auto-backup-download'

export type ExamBackupSkill = 'reading' | 'listening'

export interface ExamBackupResult {
  id: string
  skill: ExamBackupSkill
  dexie: boolean
  opfs: boolean
  download: boolean
  errors: string[]
}

function safeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)
}

export async function isExamAutoBackupEnabled(): Promise<boolean> {
  const v = await settingsRepo.getSetting(EXAM_AUTO_BACKUP_ENABLED_KEY)
  if (v === false || v === 'false') return false
  return true // default ON
}

export async function isExamAutoBackupDownloadEnabled(): Promise<boolean> {
  const v = await settingsRepo.getSetting(EXAM_AUTO_BACKUP_DOWNLOAD_KEY)
  if (v === false || v === 'false') return false
  return true // default ON — user đã mất 39 đề
}

export async function setExamAutoBackupEnabled(on: boolean): Promise<void> {
  await settingsRepo.putSetting(EXAM_AUTO_BACKUP_ENABLED_KEY, on)
}

export async function setExamAutoBackupDownloadEnabled(on: boolean): Promise<void> {
  await settingsRepo.putSetting(EXAM_AUTO_BACKUP_DOWNLOAD_KEY, on)
}

function downloadJsonBlob(filename: string, data: unknown): boolean {
  try {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    return true
  } catch {
    return false
  }
}

async function writeOpfsBackup(
  skill: ExamBackupSkill,
  id: string,
  filename: string,
  data: unknown,
): Promise<boolean> {
  try {
    if (!('storage' in navigator) || typeof navigator.storage?.getDirectory !== 'function') {
      return false
    }
    const root = await navigator.storage.getDirectory()
    const backups = await root.getDirectoryHandle('exam-backups', { create: true })
    const skillDir = await backups.getDirectoryHandle(skill, { create: true })
    // Keep both latest by id and timestamped copy
    const latestName = `${safeFilename(id)}.json`
    const stampName = `${safeFilename(filename)}`
    const json = JSON.stringify(data, null, 2)
    for (const name of [latestName, stampName]) {
      const fh = await skillDir.getFileHandle(name, { create: true })
      const w = await fh.createWritable()
      await w.write(json)
      await w.close()
    }
    return true
  } catch {
    return false
  }
}

export async function backupReadingExam(
  exam: ReadingExam,
  meta?: { sourceFilename?: string; forceDownload?: boolean },
): Promise<ExamBackupResult> {
  const errors: string[] = []
  const enabled = await isExamAutoBackupEnabled()
  if (!enabled) {
    return { id: exam.id, skill: 'reading', dexie: false, opfs: false, download: false, errors: ['disabled'] }
  }

  const payload = {
    version: 1,
    skill: 'reading' as const,
    backedUpAt: new Date().toISOString(),
    sourceFilename: meta?.sourceFilename,
    exam,
  }

  let dexie = false
  try {
    await examBackupRepo.upsert({
      id: exam.id,
      skill: 'reading',
      title: exam.title,
      sourceFilename: meta?.sourceFilename,
      payload,
    })
    dexie = true
  } catch (e) {
    errors.push(e instanceof Error ? e.message : 'dexie failed')
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const fileBase = safeFilename(
    meta?.sourceFilename?.replace(/\.json$/i, '')
      || exam.title
      || exam.id,
  )
  const filename = `${fileBase}-${stamp}.json`

  const opfs = await writeOpfsBackup('reading', exam.id, filename, payload)

  let download = false
  const wantDl = meta?.forceDownload === true
    || (meta?.forceDownload !== false && await isExamAutoBackupDownloadEnabled())
  if (wantDl) {
    download = downloadJsonBlob(filename, payload)
    if (!download) errors.push('download failed')
  }

  return { id: exam.id, skill: 'reading', dexie, opfs, download, errors }
}

export async function backupListeningExam(
  exam: ListeningExam,
  meta?: { sourceFilename?: string; forceDownload?: boolean },
): Promise<ExamBackupResult> {
  const errors: string[] = []
  const enabled = await isExamAutoBackupEnabled()
  if (!enabled) {
    return { id: exam.id, skill: 'listening', dexie: false, opfs: false, download: false, errors: ['disabled'] }
  }

  const payload = {
    version: 1,
    skill: 'listening' as const,
    backedUpAt: new Date().toISOString(),
    sourceFilename: meta?.sourceFilename,
    exam,
  }

  let dexie = false
  try {
    await examBackupRepo.upsert({
      id: exam.id,
      skill: 'listening',
      title: exam.title,
      sourceFilename: meta?.sourceFilename,
      payload,
    })
    dexie = true
  } catch (e) {
    errors.push(e instanceof Error ? e.message : 'dexie failed')
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const fileBase = safeFilename(
    meta?.sourceFilename?.replace(/\.json$/i, '')
      || exam.title
      || exam.id,
  )
  const filename = `${fileBase}-${stamp}.json`
  const opfs = await writeOpfsBackup('listening', exam.id, filename, payload)

  let download = false
  const wantDl = meta?.forceDownload === true
    || (meta?.forceDownload !== false && await isExamAutoBackupDownloadEnabled())
  if (wantDl) {
    download = downloadJsonBlob(filename, payload)
    if (!download) errors.push('download failed')
  }

  return { id: exam.id, skill: 'listening', dexie, opfs, download, errors }
}

/** Backup tất cả đề Reading local (Dexie readingExams) → 1 file + từng bản examBackups. */
export async function backupAllLocalReadingExams(opts?: {
  forceDownload?: boolean
}): Promise<{ count: number; download: boolean }> {
  const records = await examRepo.list()
  const exams = records.map(r => ({
    id: r.id,
    title: r.title,
    durationMinutes: r.durationMinutes,
    bandHint: r.bandHint,
    parts: r.parts,
    examTrack: r.examTrack,
    cambridgeLevel: r.cambridgeLevel,
    source: r.source,
    sourceFilename: r.sourceFilename,
  }))

  for (const exam of exams) {
    await backupReadingExam(exam as ReadingExam, {
      sourceFilename: exam.sourceFilename,
      forceDownload: false,
    })
  }

  const bundle = {
    version: 1,
    skill: 'reading' as const,
    backedUpAt: new Date().toISOString(),
    count: exams.length,
    exams,
  }

  let download = false
  if (opts?.forceDownload !== false) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    download = downloadJsonBlob(`reading-exams-all-${stamp}.json`, bundle)
  }

  return { count: exams.length, download }
}

export async function backupAllLocalListeningExams(opts?: {
  forceDownload?: boolean
}): Promise<{ count: number; download: boolean }> {
  const records = await listeningExamRepo.list()
  for (const exam of records) {
    await backupListeningExam(exam as unknown as ListeningExam, {
      sourceFilename: exam.sourceFilename,
      forceDownload: false,
    })
  }

  const bundle = {
    version: 1,
    skill: 'listening' as const,
    backedUpAt: new Date().toISOString(),
    count: records.length,
    exams: records,
  }

  let download = false
  if (opts?.forceDownload !== false) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    download = downloadJsonBlob(`listening-exams-all-${stamp}.json`, bundle)
  }

  return { count: records.length, download }
}

/** Export mọi bản trong bảng examBackups ra 1 file. */
export async function exportAllExamBackupsDownload(): Promise<{ count: number; download: boolean }> {
  const rows = await examBackupRepo.list()
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const bundle = {
    version: 1,
    backedUpAt: new Date().toISOString(),
    count: rows.length,
    backups: rows,
  }
  const download = downloadJsonBlob(`exam-backups-all-${stamp}.json`, bundle)
  return { count: rows.length, download }
}
