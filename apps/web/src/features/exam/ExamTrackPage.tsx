import { lazy, Suspense, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, Eye, EyeOff, FileJson, FileText, Headphones, Loader2, Sparkles } from 'lucide-react'
import { examRepo, listeningExamRepo } from '@ryan/db'
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
import { isImportedReadingExamId } from './importReadingManualUtils'
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
import IeltsLibraryArchive from './IeltsLibraryArchive'
import './examHub.css'

const ImportReadingManualModal = lazy(() => import('./ImportReadingManualModal'))
const ImportListeningModal = lazy(() => import('./ImportListeningModal'))
const IeltsListeningImportWizard = lazy(() => import('./ieltsListeningWizard/IeltsListeningImportWizard'))
const IeltsReadingImportWizard = lazy(() => import('./ieltsReadingWizard/IeltsReadingImportWizard'))
const ImportListeningWordModal = lazy(() => import('./ImportListeningWordModal'))

function filterListeningByTypes(exams: ListeningExam[], types: ListeningExamType[]): ListeningExam[] {
  return exams.filter(e => types.includes(e.examType))
}

export default function ExamTrackPage() {
  const navigate = useNavigate()
  const { trackId, level: levelParam } = useParams<{ trackId: string; level?: string }>()

  if (trackId === 'ket') {
    return <Navigate to="/app/exam/track/cambridge/a2" replace />
  }

  const track = trackId ? getExamTrack(trackId) : null
  const cambridgeLevel = levelParam && isCambridgeLevelSlug(levelParam)
    ? getCambridgeExamLevel(levelParam)
    : null

  const [showImportManual, setShowImportManual] = useState(false)
  const [showImportListening, setShowImportListening] = useState(false)
  const [showIeltsWizard, setShowIeltsWizard] = useState(false)
  const [showReadingWizard, setShowReadingWizard] = useState(false)
  const [showImportWord, setShowImportWord] = useState(false)
  const [wizardHasDraft, setWizardHasDraft] = useState(hasIeltsListeningWizardDraft)
  const [readingWizardHasDraft, setReadingWizardHasDraft] = useState(hasIeltsReadingWizardDraft)
  const { importsOnly, toggleImportsOnly } = useExamImportsOnlyFilter()

  const readingExams = useLiveQuery(() => listAllReadingExams(), []) ?? []
  const listeningExams = useLiveQuery(() => listAllListeningExams(), []) ?? []
  useExamDraftRevision()

  if (!track) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy track.</p>
      </div>
    )
  }

  if (track.id === 'cambridge' && levelParam && !cambridgeLevel) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Không tìm thấy cấp độ Cambridge.</p>
      </div>
    )
  }

  if (track.id === 'cambridge' && !levelParam) {
    return (
      <div className="exam-hub-page">
        <div className="exam-hub-page__inner">
          <button type="button" className="exam-hub-back" onClick={() => navigate('/app/exam')}>
            <ArrowLeft size={14} />
            Luyện thi
          </button>

          <section className="exam-full-mock-hero">
            <p className="exam-hub-kicker">{track.title}</p>
            <h1 className="exam-hub-title">Chọn cấp độ CEFR</h1>
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

  const readingList = filterReadingExamsForDisplay(readingListAll, importsOnly)
  const listeningList = filterListeningExamsForDisplay(listeningListAll, importsOnly)
  const hiddenReadingCount = readingListAll.length - readingList.length
  const hiddenListeningCount = listeningListAll.length - listeningList.length

  const defaultListeningType = track.id === 'ielts'
    ? 'ielts'
    : cambridgeLevel?.listeningExamTypes[0] ?? 'ket'

  const importedReading = readingList.filter(e => isImportedReadingExamId(e.id))
  const importedListening = listeningList.filter(e => e.id.startsWith('listening-import-'))

  async function deleteReading(exam: ReadingExam) {
    if (!confirm(`Xóa đề "${exam.title}"?`)) return
    await examRepo.delete(exam.id)
  }

  async function deleteListening(exam: ListeningExam) {
    if (!confirm(`Xóa đề "${exam.title}"?`)) return
    await listeningExamRepo.delete(exam.id)
  }

  const backPath = track.id === 'cambridge' && cambridgeLevel
    ? '/app/exam/track/cambridge'
    : '/app/exam'

  const isIeltsTrack = track.id === 'ielts'
  const useLibraryArchiveLayout = isIeltsTrack || Boolean(cambridgeLevel)
  const libraryBrandLabel = cambridgeLevel?.exam ?? 'IELTS'
  const libraryArchiveMode = isIeltsTrack ? 'ielts' as const : 'cambridge' as const

  return (
    <div className={`exam-hub-page${useLibraryArchiveLayout ? ' exam-hub-page--ielts' : ''}`}>
      <div className="exam-hub-page__inner">
        <button type="button" className="exam-hub-back" onClick={() => navigate(backPath)}>
          <ArrowLeft size={14} />
          {track.id === 'cambridge' && cambridgeLevel ? 'Cambridge A2–C2' : 'Luyện thi'}
        </button>

        <section className="exam-full-mock-hero">
          <p className="exam-hub-kicker">
            {track.id === 'cambridge' && cambridgeLevel
              ? `${cambridgeLevel.exam} · ${cambridgeLevel.cefr}`
              : track.title}
          </p>
          <h1 className="exam-hub-title">{activeTrack.subtitle}</h1>
          <p className="exam-hub-desc">{activeTrack.description}</p>

          <div className="exam-hub-actions">
            <button
              type="button"
              className={`exam-hub-cta exam-hub-cta--ghost${importsOnly ? ' is-active' : ''}`}
              onClick={toggleImportsOnly}
              title={importsOnly ? 'Hiện lại đề mẫu và đề builtin của hệ thống' : 'Ẩn đề mẫu hệ thống — chỉ hiện đề bạn đã import'}
            >
              {importsOnly ? <Eye size={14} /> : <EyeOff size={14} />}
              {importsOnly ? 'Hiện đề mẫu hệ thống' : 'Chỉ đề import'}
            </button>
            {activeTrack.skills.includes('reading') && (
              <button type="button" className="exam-hub-cta exam-hub-cta--ghost" onClick={() => setShowImportManual(true)}>
                <FileJson size={14} />
                Import thủ công Reading
              </button>
            )}
            {track.id === 'ielts' && activeTrack.skills.includes('reading') && (
              <button
                type="button"
                className="exam-hub-cta exam-hub-cta--ghost"
                onClick={() => setShowReadingWizard(true)}
              >
                <Sparkles size={14} />
                Import Wizard Reading
                {readingWizardHasDraft && <span className="exam-hub-cta__badge">Có nháp</span>}
              </button>
            )}
            {activeTrack.skills.includes('listening') && (
              <button type="button" className="exam-hub-cta exam-hub-cta--ghost" onClick={() => setShowImportListening(true)}>
                <Headphones size={14} />
                Import thủ công Listening
              </button>
            )}
            {track.id === 'ielts' && activeTrack.skills.includes('listening') && (
              <button
                type="button"
                className="exam-hub-cta exam-hub-cta--ghost"
                onClick={() => setShowImportWord(true)}
              >
                <FileText size={14} />
                Import Word
              </button>
            )}
            {track.id === 'ielts' && activeTrack.skills.includes('listening') && (
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
          {importsOnly && (hiddenReadingCount > 0 || hiddenListeningCount > 0) && (
            <p className="exam-hub-filter-note">
              Đang ẩn {hiddenReadingCount > 0 ? `${hiddenReadingCount} Reading` : ''}
              {hiddenReadingCount > 0 && hiddenListeningCount > 0 ? ' · ' : ''}
              {hiddenListeningCount > 0 ? `${hiddenListeningCount} Listening` : ''} đề mẫu/builtin hệ thống.
            </p>
          )}
        </section>

        {activeTrack.skills.includes('reading') && useLibraryArchiveLayout && (
          <IeltsLibraryArchive
            skill="reading"
            archiveMode={libraryArchiveMode}
            brandLabel={libraryBrandLabel}
            exams={readingList}
            buildRow={exam => {
              const qCount = exam.parts.reduce((s, p) => s + getPartQuestions(p).length, 0)
              const completion = readReadingDraftCompletion(exam)
              const parsed = exam.title.match(/Test\s*(\d+)/i)
              return {
                id: exam.id,
                title: parsed ? `Test ${parsed[1]}` : exam.title,
                meta: completion
                  ? `Đúng ${completion.correct}/${completion.total} câu`
                  : exam.bandHint || `${exam.parts.length} part · ${qCount} câu`,
                done: Boolean(completion),
                canDelete: isImportedReadingExamId(exam.id),
              }
            }}
            onOpenExam={id => navigate(`/app/exam/reading/${id}`)}
            onRetryExam={id => {
              clearReadingDraft(id)
              navigate(`/app/exam/reading/${id}`)
            }}
            onDeleteExam={id => {
              const target = readingList.find(e => e.id === id)
              if (target) void deleteReading(target)
            }}
          />
        )}

        {activeTrack.skills.includes('listening') && useLibraryArchiveLayout && (
          <IeltsLibraryArchive
            skill="listening"
            archiveMode={libraryArchiveMode}
            brandLabel={libraryBrandLabel}
            exams={listeningList}
            buildRow={exam => {
              const qCount = getListeningExamQuestions(exam).length
              const completion = readListeningDraftCompletion(exam)
              const parsed = exam.title.match(/Test\s*(\d+)/i)
              const sourceLabel = exam.id.startsWith('catalog-')
                ? 'Builtin · '
                : exam.id.startsWith('listening-import-')
                  ? 'Import · '
                  : ''
              return {
                id: exam.id,
                title: parsed ? `Test ${parsed[1]}` : exam.title,
                meta: completion
                  ? `Đúng ${completion.correct}/${completion.total} câu`
                  : `${sourceLabel}${exam.bandHint || `${exam.examType.toUpperCase()} · ${qCount} câu · ${exam.examMode}`}`,
                done: Boolean(completion),
                canDelete: exam.id.startsWith('listening-import-'),
              }
            }}
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

        {(importedReading.length > 0 || importedListening.length > 0) && (
          <p className="exam-hub-desc" style={{ marginTop: '1rem' }}>
            Đề import: {importedReading.length} Reading, {importedListening.length} Listening
          </p>
        )}
      </div>

      {showImportListening && (
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

      {showImportWord && (
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

      {showIeltsWizard && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
          <IeltsListeningImportWizard
            onClose={() => {
              setShowIeltsWizard(false)
              setWizardHasDraft(hasIeltsListeningWizardDraft())
            }}
            onCreated={id => {
              setShowIeltsWizard(false)
              setWizardHasDraft(false)
              navigate(`/app/exam/listening/${id}`)
            }}
          />
        </Suspense>
      )}

      {showReadingWizard && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
          <IeltsReadingImportWizard
            onClose={() => {
              setShowReadingWizard(false)
              setReadingWizardHasDraft(hasIeltsReadingWizardDraft())
            }}
            onCreated={id => {
              setShowReadingWizard(false)
              setReadingWizardHasDraft(false)
              navigate(`/app/exam/reading/${id}`)
            }}
          />
        </Suspense>
      )}

      {showImportManual && (
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