import { db } from '@ryan/db'

const BACKUP_VERSION = 1 as const
const APP_NAME = 'RyanEnglish'

const BACKUP_TABLES = [
  'groups',
  'decks',
  'cards',
  'srs',
  'reviewLog',
  'lessons',
  'writingDocs',
  'writingHistory',
  'errorBank',
  'mindmaps',
  'aiUsage',
  'settings',
  'translationSets',
] as const

type BackupTable = (typeof BACKUP_TABLES)[number]

export type BackupData = Record<BackupTable, unknown[]>

export interface BackupPayload {
  version: typeof BACKUP_VERSION
  exportedAt: string
  app: typeof APP_NAME
  data: BackupData
}

function formatDateForFilename(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatEstimatedSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `~${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `~${Math.round(bytes / 1024)} KB`
  return `~${bytes} B`
}

async function readAllTables(): Promise<BackupData> {
  const [
    groups,
    decks,
    cards,
    srs,
    reviewLog,
    lessons,
    writingDocs,
    writingHistory,
    errorBank,
    mindmaps,
    aiUsage,
    settings,
    translationSets,
  ] = await Promise.all([
    db.groups.toArray(),
    db.decks.toArray(),
    db.cards.toArray(),
    db.srs.toArray(),
    db.reviewLog.toArray(),
    db.lessons.toArray(),
    db.writingDocs.toArray(),
    db.writingHistory.toArray(),
    db.errorBank.toArray(),
    db.mindmaps.toArray(),
    db.aiUsage.toArray(),
    db.settings.toArray(),
    db.translationSets.toArray(),
  ])

  return {
    groups,
    decks,
    cards,
    srs,
    reviewLog,
    lessons,
    writingDocs,
    writingHistory,
    errorBank,
    mindmaps,
    aiUsage,
    settings,
    translationSets,
  }
}

async function countRecords(): Promise<number> {
  const counts = await Promise.all([
    db.groups.count(),
    db.decks.count(),
    db.cards.count(),
    db.srs.count(),
    db.reviewLog.count(),
    db.lessons.count(),
    db.writingDocs.count(),
    db.writingHistory.count(),
    db.errorBank.count(),
    db.mindmaps.count(),
    db.aiUsage.count(),
    db.settings.count(),
    db.translationSets.count(),
  ])
  return counts.reduce((sum, n) => sum + n, 0)
}

function isBackupPayload(raw: unknown): raw is BackupPayload {
  if (!raw || typeof raw !== 'object') return false
  const obj = raw as Record<string, unknown>
  if (obj.version !== BACKUP_VERSION) return false
  if (obj.app !== APP_NAME) return false
  if (!obj.data || typeof obj.data !== 'object') return false
  return true
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

export async function exportBackup(): Promise<void> {
  const data = await readAllTables()
  const payload: BackupPayload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: APP_NAME,
    data,
  }
  const json = JSON.stringify(payload, null, 2)
  const filename = `ryan-english-backup-${formatDateForFilename(new Date())}.json`
  downloadJson(filename, json)
}

export async function importBackup(file: File): Promise<{ counts: Record<string, number> }> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('File JSON không hợp lệ.')
  }

  if (!isBackupPayload(parsed)) {
    throw new Error('File backup không đúng format Ryan English (version 1).')
  }

  const counts: Record<string, number> = {}

  await db.transaction(
    'rw',
    [
      db.groups,
      db.decks,
      db.cards,
      db.srs,
      db.reviewLog,
      db.lessons,
      db.writingDocs,
      db.writingHistory,
      db.errorBank,
      db.mindmaps,
      db.aiUsage,
      db.settings,
      db.translationSets,
    ],
    async () => {
      for (const table of BACKUP_TABLES) {
        const rows = asArray(parsed.data[table])
        if (rows.length === 0) {
          counts[table] = 0
          continue
        }
        await db.table(table).bulkPut(rows)
        counts[table] = rows.length
      }
    },
  )

  return { counts }
}

export async function estimateBackupSize(): Promise<string> {
  const total = await countRecords()
  const estimatedBytes = total * 750
  return `${formatEstimatedSize(estimatedBytes)} (${total.toLocaleString('vi-VN')} records)`
}

export const BACKUP_TABLE_LABELS: Partial<Record<BackupTable, string>> = {
  groups: 'nhóm',
  decks: 'bộ thẻ',
  cards: 'từ vựng',
  srs: 'SRS',
  reviewLog: 'lịch sử ôn',
  lessons: 'bài nghe',
  writingDocs: 'bài viết',
  writingHistory: 'lịch sử chấm',
  errorBank: 'lỗi thường gặp',
  mindmaps: 'mindmap',
  aiUsage: 'AI usage',
  settings: 'cài đặt',
  translationSets: 'bộ dịch',
}

export function formatImportSummary(counts: Record<string, number>): string {
  const parts = BACKUP_TABLES
    .filter(t => (counts[t] ?? 0) > 0)
    .map(t => `${counts[t]} ${BACKUP_TABLE_LABELS[t] ?? t}`)

  return parts.length > 0 ? parts.join(', ') : 'Không có dữ liệu mới'
}