import { lazy, Suspense, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Eye, EyeOff, FileJson, FileText, Headphones, Loader2, Sparkles } from 'lucide-react'
import { examBackupRepo, examRepo, listeningExamRepo } from '@ryan/db'
import {
  CAMBRIDGE_EXAM_LEVELS,
  filterReadingForCambridgeLevel,
  filterReadingForIelts,
  getCambridgeExamLevel,
  isCambridgeLevelSlug,
} from './cambridgeExamLevels'
import { getExamTrack } from './examTracks'
import { listAllReadingExams } from './examLoader'
import { listAllListeningExams } from './listeningExamLoader'
import { getPartQuestions } from './examData'
import { getListeningExamQuestions } from './listeningExamData'
import type { ListeningExamType } from './listeningExamData'
import type { ReadingExam } from './examData'
import type { ListeningExam } from './listeningExamData'
import {
  canDeleteReadingExamId,
  isImportedReadingExamId,
} from './importReadingManualUtils'
import {
  canDeleteListeningExamId,
  isUserImportedListeningExamId,
} from './examListFilter'
import { db } from '@ryan/db'
import { deletePublishedReadingExam } from './readingExamPublish'
import { deletePublishedListeningExam } from './listeningExamPublish'
import {
  hideListeningCatalogExam,
  hideReadingCatalogExam,
  isCatalogStyleExamId,
} from './examCatalogHide'
import { isSystemReadingExamId } from './importReadingManualUtils'
import { isSystemListeningExamId } from './examListFilter'
import {
  clearListeningDraft,
  clearReadingDraft,
  readListeningDraftCompletion,
  readReadingDraftCompletion,
} from './examCompletion'
import { useExamDraftRevision } from './useExamDraftRevision'
import {
  filterListeningExamsForDisplay,
  filterReadingExamsForDisplay,
} from './examListFilter'
import { useExamImportsOnlyFilter } from './useExamImportsOnlyFilter'
import { hasIeltsListeningWizardDraft } from './ieltsListeningWizard/ieltsListeningWizardPersist'
import { hasIeltsReadingWizardDraft } from './ieltsReadingWizard/ieltsReadingWizardPersist'
import { isIeltsReadingWizardEditable } from './ieltsReadingWizard/ieltsReadingWizardEdit'
import ExamTrackErrorBoundary from './ExamTrackErrorBoundary'
import ExamSkillPicker, { type ExamSkillPick } from './ExamSkillPicker'
import IeltsLibraryArchive from './IeltsLibraryArchive'
import { useIsAdmin } from '../auth/useIsAdmin'
import './examHub.css'

function isExamSkillParam(v: string | undefined): v is ExamSkillPick {
  return v === 'reading' || v === 'listening'
}

function safeDraftFlag(read: () => boolean): boolean {
  try {
    return read()
  } catch (err) {
    console.warn('[ExamTrackPage] draft flag failed', err)
    return false
  }
}

function safeReadingRow(exam: ReadingExam, isAdmin: boolean): {
  id: string
  title: string
  meta: string
  done?: boolean
  canDelete?: boolean
  canEdit?: boolean
} {
  try {
    const parts = Array.isArray(exam.parts) ? exam.parts : []
    const qCount = parts.reduce((s, p) => {
      try {
        return s + getPartQuestions(p).length
      } catch {
        return s
      }
    }, 0)
    const completion = readReadingDraftCompletion(exam)
    const parsed = exam.title.match(/Test\s*(\d+)/i)
    return {
      id: exam.id,
      title: parsed ? `Test ${parsed[1]}` : exam.title,
      meta: completion
        ? `Đúng ${completion.correct}/${completion.total} câu`
        : exam.bandHint || `${parts.length} part · ${qCount} câu`,
      done: Boolean(completion),
      canDelete: canDeleteReadingExamId(exam.id, { isAdmin }),
      canEdit: isImportedReadingExamId(exam.id) && isIeltsReadingWizardEditable(exam),
    }
  } catch (err) {
    console.warn('[ExamTrackPage] reading row failed', exam.id, err)
    return {
      id: exam.id,
      title: exam.title || exam.id,
      meta: 'Không đọc được metadata đề',
      canDelete: canDeleteReadingExamId(exam.id, { isAdmin }),
    }
  }
}

function safeListeningRow(exam: ListeningExam, isAdmin: boolean): {
  id: string
  title: string
  meta: string
  done?: boolean
  canDelete?: boolean
} {
  try {
    const qCount = getListeningExamQuestions(exam).length
    const completion = readListeningDraftCompletion(exam)
    const parsed = exam.title.match(/Test\s*(\d+)/i)
    const sourceLabel = exam.id.startsWith('catalog-')
      ? 'Builtin · '
      : exam.id.startsWith('listening-import-')
        ? 'Import · '
        : ''
    const typeLabel = (exam.examType ?? 'ielts').toString().toUpperCase()
    return {
      id: exam.id,
      title: parsed ? `Test ${parsed[1]}` : exam.title,
      meta: completion
        ? `Đúng ${completion.correct}/${completion.total} câu`
        : `${sourceLabel}${exam.bandHint || `${typeLabel} · ${qCount} câu · ${exam.examMode ?? 'practice'}`}`,
      done: Boolean(completion),
      canDelete: canDeleteListeningExamId(exam.id, { isAdmin }),
    }
  } catch (err) {
    console.warn('[ExamTrackPage] listening row failed', exam.id, err)
    return {
      id: exam.id,
      title: exam.title || exam.id,
      meta: 'Không đọc được metadata đề',
      canDelete: canDeleteListeningExamId(exam.id, { isAdmin }),
    }
  }
}

const ImportReadingManualModal = lazy(() => import('./ImportReadingManualModal'))
const ImportListeningModal = lazy(() => import('./ImportListeningModal'))
const IeltsListeningImportWizard = lazy(() => import('./ieltsListeningWizard/IeltsListeningImportWizard'))
const IeltsReadingImportWizard = lazy(() => import('./ieltsReadingWizard/IeltsReadingImportWizard'))
const ImportListeningWordModal = lazy(() => import('./ImportListeningWordModal'))

function filterListeningByTypes(exams: ListeningExam[], types: ListeningExamType[]): ListeningExam[] {
  return exams.filter(e => types.includes(e.examType))
}

export default function ExamTrackPage() {
  return (
    <ExamTrackErrorBoundary label="IELTS / Cambridge track">
      <ExamTrackPageInner />
    </ExamTrackErrorBoundary>
  )
}

function ExamTrackPageInner() {
  const navigate = useNavigate()
  const { trackId, arg2, arg3 } = useParams<{ trackId: string; arg2?: string; arg3?: string }>()
  /** Import / Wizard / Ẩn đề mẫu — chỉ Admin (user thường chỉ luyện đề đã publish). */
  const isAdmin = useIsAdmin()
  const canImport = isAdmin === true

  const [showImportManual, setShowImportManual] = useState(false)
  const [showImportListening, setShowImportListening] = useState(false)
  const [showIeltsWizard, setShowIeltsWizard] = useState(false)
  const [showReadingWizard, setShowReadingWizard] = useState(false)
  const [showImportWord, setShowImportWord] = useState(false)
  const [wizardHasDraft, setWizardHasDraft] = useState(() => safeDraftFlag(hasIeltsListeningWizardDraft))
  const [readingWizardHasDraft, setReadingWizardHasDraft] = useState(() => safeDraftFlag(hasIeltsReadingWizardDraft))
  const [readingWizardEdit, setReadingWizardEdit] = useState<{
    exam: ReadingExam
    sourceFilename?: string
  } | null>(null)
  const { importsOnly, toggleImportsOnly } = useExamImportsOnlyFilter()

  const readingExams = useLiveQuery(() => listAllReadingExams(), []) ?? []
  const listeningExams = useLiveQuery(() => listAllListeningExams(), []) ?? []
  useExamDraftRevision()

  if (trackId === 'ket') {
    return <Navigate to="/app/exam/track/cambridge/a2" replace />
  }

  const track = trackId ? getExamTrack(trackId) : null
  const cambridgeLevelSlug = track?.id === 'cambridge' && arg2 && isCambridgeLevelSlug(arg2) ? arg2 : null
  const cambridgeLevel = cambridgeLevelSlug ? getCambridgeExamLevel(cambridgeLevelSlug) : null
  const activeSkill: ExamSkillPick | null = track?.id === 'ielts'
    ? (isExamSkillParam(arg2) ? arg2 : null)
    : (isExamSkillParam(arg3) ? arg3 : null)

  if (!track) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy track.</p>
      </div>
    )
  }

  if (track.id === 'ielts' && arg2 && !isExamSkillParam(arg2)) {
    return <Navigate to="/app/exam/track/ielts" replace />
  }

  if (track.id === 'cambridge' && arg2 && !cambridgeLevel) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy cấp độ Cambridge.</p>
      </div>
    )
  }

  if (track.id === 'cambridge' && cambridgeLevel && arg3 && !isExamSkillParam(arg3)) {
    return <Navigate to={`/app/exam/track/cambridge/${cambridgeLevel.slug}`} replace />
  }

  if (track.id === 'cambridge' && !arg2) {
    return (
      <div className="exam-hub-page exam-hub-page--cambridge-selector">
        <div className="exam-hub-page__inner">
          <button type="button" className="exam-hub-back" onClick={() => navigate('/app/exam')}>
            <ArrowLeft size={14} />
            Luyện thi
          </button>

          <section className="exam-full-mock-hero">
            <p className="exam-hub-kicker">{track.title}</p>
            <h1 className="exam-hub-title">Select CEFR level</h1>
            <p className="exam-hub-desc">{track.description}</p>
          </section>

          <div className="exam-hub-tracks exam-hub-tracks--levels">
            {CAMBRIDGE_EXAM_LEVELS.map(level => (
              <button
                key={level.slug}
                type="button"
                className="exam-hub-track-card"
                onClick={() => navigate(`/app/exam/track/cambridge/${level.slug}`)}
              >
                <p className="exam-hub-track-card__title">{level.label}</p>
                <p className="exam-hub-track-card__sub">{level.exam} · {level.cefr}</p>
                <p className="exam-hub-track-card__desc">{level.description}</p>
                <div className="exam-hub-track-skills">
                  {level.skills.map(skill => (
                    <span key={skill} className="exam-hub-skill-tag">{skill}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeTrack = track.id === 'cambridge' && cambridgeLevel
    ? {
      title: cambridgeLevel.label,
      subtitle: cambridgeLevel.subtitle,
      description: cambridgeLevel.description,
      skills: cambridgeLevel.skills,
    }
    : {
      title: track.title,
      subtitle: track.subtitle,
      description: track.description,
      skills: track.skills,
    }

  const readingListAll = track.id === 'ielts'
    ? filterReadingForIelts(readingExams)
    : cambridgeLevel
      ? filterReadingForCambridgeLevel(readingExams, cambridgeLevel.slug)
      : []
  const listeningListAll = track.id === 'ielts'
    ? filterListeningByTypes(listeningExams, ['ielts'])
    : cambridgeLevel
      ? filterListeningByTypes(listeningExams, cambridgeLevel.listeningExamTypes)
      : []

  // User thường luôn xem full catalog (không ẩn đề mẫu / filter import)
  const effectiveImportsOnly = canImport && importsOnly
  const readingList = filterReadingExamsForDisplay(readingListAll, effectiveImportsOnly)
  const listeningList = filterListeningExamsForDisplay(listeningListAll, effectiveImportsOnly)
  const hiddenReadingCount = readingListAll.length - readingList.length
  const hiddenListeningCount = listeningListAll.length - listeningList.length

  const defaultListeningType = track.id === 'ielts'
    ? 'ielts'
    : cambridgeLevel?.listeningExamTypes[0] ?? 'ket'

  const importedReading = readingList.filter(e => isImportedReadingExamId(e.id))
  const importedListening = listeningList.filter(e => isUserImportedListeningExamId(e.id))

  async function openReadingWizardEdit(examId: string) {
    if (!canImport) return
    const exam = readingList.find(e => e.id === examId)
    if (!exam || !isIeltsReadingWizardEditable(exam)) return
    const record = await examRepo.get(examId)
    setReadingWizardEdit({ exam, sourceFilename: record?.sourceFilename })
    setShowReadingWizard(true)
  }

  /**
   * Xóa đề Reading khỏi Library:
   * - Import: local + cloud publish + backup
   * - Catalog/IELTS (Admin): ẩn catalog + gỡ cloud + local + backup
   */
  async function deleteReading(exam: ReadingExam) {
    if (!canDeleteReadingExamId(exam.id, { isAdmin: canImport })) {
      alert('Không xóa được đề này.')
      return
    }
    const isSystem = isSystemReadingExamId(exam.id) || isCatalogStyleExamId(exam.id)
    const msg = isSystem && canImport
      ? `Admin xóa đề hệ thống "${exam.title}"?\n\n• Ẩn khỏi Library (catalog)\n• Gỡ cloud publish\n• Xóa local + backup\n\n(File trong bundle deploy vẫn còn đến khi redeploy.)`
      : `Xóa đề "${exam.title}"?\n(Local + bản publish trên cloud nếu có)`
    if (!confirm(msg)) return
    try {
      if (isSystem && canImport) {
        await hideReadingCatalogExam(exam.id)
      }
      const prefix = `reading-exam:${exam.id}:`
      const keys = await db.audioBlobs.where('key').startsWith(prefix).primaryKeys()
      if (keys.length) await db.audioBlobs.bulkDelete(keys as string[])
      await examRepo.delete(exam.id)
      await examBackupRepo.delete(exam.id).catch(() => undefined)
      clearReadingDraft(exam.id)
      try {
        await deletePublishedReadingExam(exam.id)
      } catch (cloudErr) {
        console.warn('[deleteReading] cloud unpublish', cloudErr)
        if (canImport) {
          alert(
            `Đã xóa/ẩn local. Không gỡ được bản cloud: ${
              cloudErr instanceof Error ? cloudErr.message : cloudErr
            }\n(Kiểm tra quyền RLS Supabase trên reading_exam_published.)`,
          )
        }
      }
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Không xóa được đề Reading.')
    }
  }

  /**
   * Xóa đề Listening — Admin được xóa cả catalog IELTS.
   */
  async function deleteListening(exam: ListeningExam) {
    if (!canDeleteListeningExamId(exam.id, { isAdmin: canImport })) {
      alert('Không xóa được đề này.')
      return
    }
    const isSystem = isSystemListeningExamId(exam.id) || isCatalogStyleExamId(exam.id)
    const msg = isSystem && canImport
      ? `Admin xóa đề hệ thống "${exam.title}"?\n\n• Ẩn khỏi Library (catalog)\n• Gỡ cloud publish\n• Xóa local + backup`
      : `Xóa đề "${exam.title}"?\n(Local + bản publish trên cloud nếu có)`
    if (!confirm(msg)) return
    try {
      if (isSystem && canImport) {
        await hideListeningCatalogExam(exam.id)
      }
      const prefix = `listening-exam:${exam.id}:`
      const keys = await db.audioBlobs.where('key').startsWith(prefix).primaryKeys()
      if (keys.length) await db.audioBlobs.bulkDelete(keys as string[])
      await listeningExamRepo.delete(exam.id)
      await examBackupRepo.delete(exam.id).catch(() => undefined)
      clearListeningDraft(exam.id)
      try {
        await deletePublishedListeningExam(exam.id)
      } catch (cloudErr) {
        console.warn('[deleteListening] cloud unpublish', cloudErr)
        if (canImport) {
          alert(
            `Đã xóa/ẩn local. Không gỡ được bản cloud: ${
              cloudErr instanceof Error ? cloudErr.message : cloudErr
            }\n(Kiểm tra quyền RLS Supabase trên listening_exam_published.)`,
          )
        }
      }
    } catch (err) {
      console.error(err)
      alert(err instanceof Error ? err.message : 'Không xóa được đề Listening.')
    }
  }

  const skillBasePath = track.id === 'ielts'
    ? '/app/exam/track/ielts'
    : cambridgeLevel
      ? `/app/exam/track/cambridge/${cambridgeLevel.slug}`
      : '/app/exam/track/cambridge'

  const skillPickerBackPath = track.id === 'cambridge' && cambridgeLevel
    ? '/app/exam/track/cambridge'
    : '/app/exam'

  const skillPickerBackLabel = track.id === 'cambridge' && cambridgeLevel
    ? 'Cambridge A2–C2'
    : 'Luyện thi'

  const brandTitle = track.id === 'cambridge' && cambridgeLevel
    ? `${cambridgeLevel.exam} · ${cambridgeLevel.cefr}`
    : track.title

  const isIeltsTrack = track.id === 'ielts'
  const useLibraryArchiveLayout = isIeltsTrack || Boolean(cambridgeLevel)
  const libraryBrandLabel = cambridgeLevel?.exam ?? 'IELTS'
  const libraryArchiveMode = isIeltsTrack ? 'ielts' as const : 'cambridge' as const

  // Chưa chọn skill → Page1 (Listening / Reading)
  if (useLibraryArchiveLayout && !activeSkill) {
    const skills = activeTrack.skills.filter(
      (s): s is ExamSkillPick => s === 'reading' || s === 'listening',
    )
    return (
      <>
        <ExamSkillPicker
          brandTitle={brandTitle}
          backLabel={skillPickerBackLabel}
          onBack={() => navigate(skillPickerBackPath)}
          listeningCount={listeningList.length}
          readingCount={readingList.length}
          skills={skills}
          readingTitle={cambridgeLevel ? 'Reading - Writing' : 'Reading'}
          onPick={skill => navigate(`${skillBasePath}/${skill}`)}
        />
        {canImport && showImportListening && (
          <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <ImportListeningModal
              defaultExamType={defaultListeningType}
              onClose={() => setShowImportListening(false)}
              onCreated={id => {
                setShowImportListening(false)
                navigate(`/app/exam/listening/${id}`)
              }}
            />
          </Suspense>
        )}
      </>
    )
  }

  const showReadingArchive = activeSkill === 'reading' && activeTrack.skills.includes('reading')
  const showListeningArchive = activeSkill === 'listening' && activeTrack.skills.includes('listening')

  return (
    <div className={`exam-hub-page${useLibraryArchiveLayout ? ' exam-hub-page--ielts' : ''}${activeSkill ? ` exam-hub-page--${activeSkill}` : ''}`}>
      <div className="exam-hub-page__inner">
        <button type="button" className="exam-hub-back" onClick={() => navigate(skillBasePath)}>
          <ArrowLeft size={14} />
          {brandTitle}
        </button>

        <section className="exam-full-mock-hero">
          <p className="exam-hub-kicker">{brandTitle}</p>
          <h1 className="exam-hub-title">
            {activeSkill === 'listening'
              ? 'Listening'
              : cambridgeLevel
                ? 'Reading - Writing'
                : 'Reading'}
          </h1>
          <p className="exam-hub-desc">
            {activeSkill === 'listening'
              ? 'Chọn sách / đề Listening trong Library Archives.'
              : cambridgeLevel
                ? 'Chọn sách / đề Reading - Writing trong Library Archives.'
                : 'Chọn sách / đề Reading trong Library Archives.'}
          </p>

          {canImport && (
            <>
              <div className="exam-hub-actions">
                <button
                  type="button"
                  className={`exam-hub-cta exam-hub-cta--ghost${effectiveImportsOnly ? ' is-active' : ''}`}
                  onClick={toggleImportsOnly}
                  title={effectiveImportsOnly ? 'Hiện lại đề mẫu và đề builtin của hệ thống' : 'Ẩn đề mẫu hệ thống — chỉ hiện đề bạn đã import'}
                >
                  {effectiveImportsOnly ? <Eye size={14} /> : <EyeOff size={14} />}
                  {effectiveImportsOnly ? 'Hiện đề mẫu hệ thống' : 'Chỉ đề import'}
                </button>
                {showReadingArchive && (
                  <button type="button" className="exam-hub-cta exam-hub-cta--ghost" onClick={() => setShowImportManual(true)}>
                    <FileJson size={14} />
                    Import thủ công Reading
                  </button>
                )}
                {track.id === 'ielts' && showReadingArchive && (
                  <button
                    type="button"
                    className="exam-hub-cta exam-hub-cta--ghost"
                    onClick={() => {
                      setReadingWizardEdit(null)
                      setShowReadingWizard(true)
                    }}
                  >
                    <Sparkles size={14} />
                    Import Wizard Reading
                    {readingWizardHasDraft && <span className="exam-hub-cta__badge">Có nháp</span>}
                  </button>
                )}
                {showListeningArchive && (
                  <button type="button" className="exam-hub-cta exam-hub-cta--ghost" onClick={() => setShowImportListening(true)}>
                    <Headphones size={14} />
                    Import thủ công Listening
                  </button>
                )}
                {track.id === 'ielts' && showListeningArchive && (
                  <button
                    type="button"
                    className="exam-hub-cta exam-hub-cta--ghost"
                    onClick={() => setShowImportWord(true)}
                  >
                    <FileText size={14} />
                    Import Word
                  </button>
                )}
                {track.id === 'ielts' && showListeningArchive && (
                  <button
                    type="button"
                    className="exam-hub-cta exam-hub-cta--ghost"
                    onClick={() => setShowIeltsWizard(true)}
                  >
                    <Sparkles size={14} />
                    Import Wizard
                    {wizardHasDraft && <span className="exam-hub-cta__badge">Có nháp</span>}
                  </button>
                )}
              </div>
              {effectiveImportsOnly && (hiddenReadingCount > 0 || hiddenListeningCount > 0) && (
                <p className="exam-hub-filter-note">
                  Đang ẩn {hiddenReadingCount > 0 ? `${hiddenReadingCount} Reading` : ''}
                  {hiddenReadingCount > 0 && hiddenListeningCount > 0 ? ' · ' : ''}
                  {hiddenListeningCount > 0 ? `${hiddenListeningCount} Listening` : ''} đề mẫu/builtin hệ thống.
                </p>
              )}
            </>
          )}
        </section>

        {showReadingArchive && (
          <IeltsLibraryArchive
            skill="reading"
            archiveMode={libraryArchiveMode}
            brandLabel={libraryBrandLabel}
            showUngrouped={canImport && libraryArchiveMode === 'ielts'}
            exams={readingList}
            buildRow={exam => {
              const row = safeReadingRow(exam, canImport)
              // Admin: xóa được catalog; user: không Sửa wizard
              if (!canImport) return { ...row, canEdit: false }
              return row
            }}
            onOpenExam={id => navigate(
              libraryArchiveMode === 'ielts'
                ? `/app/exam/reading-picker/${id}`
                : `/app/exam/reading/${id}`,
            )}
            onRetryExam={id => {
              clearReadingDraft(id)
              navigate(`/app/exam/reading/${id}`)
            }}
            onEditExam={canImport ? id => void openReadingWizardEdit(id) : undefined}
            onDeleteExam={id => {
              const target = readingList.find(e => e.id === id)
              if (target) void deleteReading(target)
            }}
          />
        )}

        {showListeningArchive && (
          <IeltsLibraryArchive
            skill="listening"
            archiveMode={libraryArchiveMode}
            brandLabel={libraryBrandLabel}
            showUngrouped={canImport}
            exams={listeningList}
            buildRow={exam => safeListeningRow(exam, canImport)}
            onOpenExam={id => navigate(`/app/exam/listening/${id}`)}
            onRetryExam={id => {
              clearListeningDraft(id)
              navigate(`/app/exam/listening/${id}`)
            }}
            onDeleteExam={id => {
              const target = listeningList.find(e => e.id === id)
              if (target) void deleteListening(target)
            }}
          />
        )}

        {canImport && (importedReading.length > 0 || importedListening.length > 0) && (
          <p className="exam-hub-desc" style={{ marginTop: '1rem' }}>
            Đề import: {importedReading.length} Reading, {importedListening.length} Listening
            {' · '}
            {canImport
              ? 'Admin: thùng rác xóa được mọi đề (kể cả catalog IELTS — ẩn + gỡ cloud).'
              : 'Có thể xóa đề import bằng nút thùng rác (không xóa đề mẫu hệ thống).'}
          </p>
        )}
      </div>

      {canImport && showImportListening && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
          <ImportListeningModal
            defaultExamType={defaultListeningType}
            onClose={() => setShowImportListening(false)}
            onCreated={id => {
              setShowImportListening(false)
              navigate(`/app/exam/listening/${id}`)
            }}
          />
        </Suspense>
      )}

      {canImport && showImportWord && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
          <ImportListeningWordModal
            onClose={() => setShowImportWord(false)}
            onCreated={id => {
              setShowImportWord(false)
              navigate(`/app/exam/listening/${id}`)
            }}
          />
        </Suspense>
      )}

      {canImport && showIeltsWizard && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
          <IeltsListeningImportWizard
            onClose={() => {
              setShowIeltsWizard(false)
              setWizardHasDraft(safeDraftFlag(hasIeltsListeningWizardDraft))
            }}
            onCreated={id => {
              setShowIeltsWizard(false)
              setWizardHasDraft(false)
              navigate(`/app/exam/listening/${id}`)
            }}
          />
        </Suspense>
      )}

      {canImport && showReadingWizard && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
          <IeltsReadingImportWizard
            editExam={readingWizardEdit?.exam ?? null}
            editSourceFilename={readingWizardEdit?.sourceFilename}
            onClose={() => {
              setShowReadingWizard(false)
              setReadingWizardEdit(null)
              setReadingWizardHasDraft(safeDraftFlag(hasIeltsReadingWizardDraft))
            }}
            onCreated={id => {
              setShowReadingWizard(false)
              setReadingWizardEdit(null)
              setReadingWizardHasDraft(false)
              navigate(`/app/exam/reading/${id}`)
            }}
          />
        </Suspense>
      )}

      {canImport && showImportManual && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
          <ImportReadingManualModal
            examTrack={track.id === 'ielts' ? 'ielts' : 'cambridge'}
            cambridgeLevel={cambridgeLevel?.slug}
            onClose={() => setShowImportManual(false)}
            onCreated={id => {
              setShowImportManual(false)
              navigate(`/app/exam/reading/${id}`)
            }}
          />
        </Suspense>
      )}

    </div>
  )
}
