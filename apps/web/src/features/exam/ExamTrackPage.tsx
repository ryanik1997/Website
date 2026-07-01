import { lazy, Suspense, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowLeft, FileJson, Headphones, Loader2, Trash2 } from 'lucide-react'
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
import './examHub.css'

const ImportReadingManualModal = lazy(() => import('./ImportReadingManualModal'))
const ImportListeningModal = lazy(() => import('./ImportListeningModal'))

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

  const readingExams = useLiveQuery(() => listAllReadingExams(), []) ?? []
  const listeningExams = useLiveQuery(() => listAllListeningExams(), []) ?? []

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

  const readingList = track.id === 'ielts'
    ? filterReadingForIelts(readingExams)
    : cambridgeLevel
      ? filterReadingForCambridgeLevel(readingExams, cambridgeLevel.slug)
      : []
  const listeningList = track.id === 'ielts'
    ? filterListeningByTypes(listeningExams, ['ielts'])
    : cambridgeLevel
      ? filterListeningByTypes(listeningExams, cambridgeLevel.listeningExamTypes)
      : []

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

  return (
    <div className="exam-hub-page">
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
            {activeTrack.skills.includes('reading') && (
              <button type="button" className="exam-hub-cta exam-hub-cta--ghost" onClick={() => setShowImportManual(true)}>
                <FileJson size={14} />
                Import thủ công Reading
              </button>
            )}
            {activeTrack.skills.includes('listening') && (
              <button type="button" className="exam-hub-cta exam-hub-cta--ghost" onClick={() => setShowImportListening(true)}>
                <Headphones size={14} />
                Import thủ công Listening
              </button>
            )}
          </div>
        </section>

        {activeTrack.skills.includes('reading') && (
          <section className="exam-track-section">
            <h2 className="exam-track-section__title">Reading ({readingList.length})</h2>
            {readingList.length === 0 ? (
              <p className="exam-hub-desc">
                {cambridgeLevel
                  ? `Chưa có đề Reading ${cambridgeLevel.exam}. Dùng đề mẫu hoặc Import thủ công (JSON + ảnh).`
                  : 'Chưa có đề Reading. Bấm Import thủ công — tải JSON mẫu, thêm ảnh đoạn văn, upload ZIP.'}
              </p>
            ) : (
              <div className="exam-track-list">
                {readingList.map(exam => {
                  const qCount = exam.parts.reduce((s, p) => s + getPartQuestions(p).length, 0)
                  return (
                    <div key={exam.id} className="exam-track-row">
                      <div>
                        <p className="exam-track-row__title">{exam.title}</p>
                        <p className="exam-track-row__meta">{exam.bandHint || `${exam.parts.length} part · ${qCount} câu`}</p>
                      </div>
                      <div className="exam-track-row__actions">
                        <button type="button" className="exam-hub-cta" style={{ marginTop: 0 }} onClick={() => navigate(`/app/exam/reading/${exam.id}`)}>
                          Làm bài
                        </button>
                        {isImportedReadingExamId(exam.id) && (
                          <button type="button" className="exam-hub-cta exam-hub-cta--ghost" style={{ marginTop: 0, padding: '0.5rem' }} onClick={() => void deleteReading(exam)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {activeTrack.skills.includes('listening') && (
          <section className="exam-track-section">
            <h2 className="exam-track-section__title">
              Listening ({listeningList.length})
            </h2>
            {listeningList.length === 0 ? (
              <p className="exam-hub-desc">
                {track.id === 'ielts'
                  ? 'Chưa có đề Listening IELTS. Dùng đề mẫu hoặc Import thủ công (JSON + MP3/ảnh).'
                  : cambridgeLevel
                    ? `Chưa có đề Listening ${cambridgeLevel.exam}. Dùng đề mẫu hoặc Import thủ công (examType: "${defaultListeningType}").`
                    : 'Chưa có đề Listening. Import thủ công (JSON + MP3/ảnh) để thêm đề.'}
              </p>
            ) : (
              <div className="exam-track-list">
                {listeningList.map(exam => {
                  const qCount = getListeningExamQuestions(exam).length
                  return (
                    <div key={exam.id} className="exam-track-row">
                      <div>
                        <p className="exam-track-row__title">{exam.title}</p>
                        <p className="exam-track-row__meta">
                          {exam.bandHint || `${exam.examType.toUpperCase()} · ${qCount} câu · ${exam.examMode}`}
                        </p>
                      </div>
                      <div className="exam-track-row__actions">
                        <button type="button" className="exam-hub-cta" style={{ marginTop: 0 }} onClick={() => navigate(`/app/exam/listening/${exam.id}`)}>
                          Làm bài
                        </button>
                        {exam.id.startsWith('listening-import-') && (
                          <button type="button" className="exam-hub-cta exam-hub-cta--ghost" style={{ marginTop: 0, padding: '0.5rem' }} onClick={() => void deleteListening(exam)}>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
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