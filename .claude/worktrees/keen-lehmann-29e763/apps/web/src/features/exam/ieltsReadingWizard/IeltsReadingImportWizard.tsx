import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  Check,
  Sparkles,
  Download,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import { examRepo } from '@ryan/db'
import { AI_PROVIDERS } from '@ryan/core'
import { useAiSettings } from '../../settings/useAiSettings'
import { examRecordFromReading } from '../examLoader'
import type { ReadingExam } from '../examData'
import {
  buildReadingExamFromImport,
  countReadingImportQuestions,
  isReadingMediaFile,
  validateReadingManualImport,
  type ReadingImportPartJson,
  type ReadingImportPayload,
} from '../importReadingManualUtils'
import {
  buildFullReadingPayload,
  generateIeltsReadingPassage,
} from './ieltsReadingAiGenerate'
import { applyReadingTemplateTableStructure, normalizeAiReadingPart } from './ieltsReadingAiNormalize'
import { getIeltsReadingWizardTemplatePart } from './ieltsReadingPartTemplates'
import type { IeltsReadingPassageNumber } from './ieltsReadingWizardConfig'
import { IELTS_READING_PASSAGE_NUMBERS } from './ieltsReadingWizardConfig'
import WizardImageLightbox from '../ieltsListeningWizard/WizardImageLightbox'
import WizardPassageStepPanel from './WizardPassageStepPanel'
import {
  isIeltsReadingWizardEditable,
  mergePassageImageKeys,
  wizardEditStateFromExam,
} from './ieltsReadingWizardEdit'
import {
  clearIeltsReadingWizardDraft,
  countReadingWizardDraftPassages,
  createEmptyReadingWizardDrafts,
  formatReadingWizardDraftSavedAt,
  loadIeltsReadingWizardDraft,
  saveIeltsReadingWizardDraft,
  type IeltsReadingWizardDraft,
  type PersistedPassageDraft,
  type ReadingWizardPersistStep,
} from './ieltsReadingWizardPersist'
import '../ieltsListeningWizard/ieltsListeningWizard.css'
import { useIsAdmin } from '../../auth/useIsAdmin'
import { publishReadingExamToCloud } from '../readingExamPublish'
import { backupReadingExam } from '../examAutoBackup'

interface Props {
  onClose: () => void
  onCreated?: (examId: string) => void
  /** Mở Wizard ở chế độ sửa đề đã import — cập nhật qua examRepo.update */
  editExam?: ReadingExam | null
  editSourceFilename?: string
}

type WizardStep = 'setup' | 'passage' | 'preview' | 'saving'

type PassageDraft = PersistedPassageDraft

interface WizardUiState {
  step: WizardStep
  activePassage: IeltsReadingPassageNumber
  title: string
  cambridge: string
  test: string
  answerKey: string
  drafts: Record<IeltsReadingPassageNumber, PassageDraft>
  extraMediaNames: string[]
}

function createInitialWizardState(
  editExam?: ReadingExam | null,
  editSourceFilename?: string,
): WizardUiState & { restored: boolean; savedAt: number | null; isEditMode: boolean } {
  if (editExam && isIeltsReadingWizardEditable(editExam)) {
    const edit = wizardEditStateFromExam(editExam, editSourceFilename)
    return {
      step: 'preview',
      activePassage: edit.activePassage,
      title: edit.title,
      cambridge: edit.cambridge,
      test: edit.test,
      answerKey: edit.answerKey,
      drafts: edit.drafts,
      extraMediaNames: [],
      restored: false,
      savedAt: null,
      isEditMode: true,
    }
  }

  const persisted = loadIeltsReadingWizardDraft()
  if (!persisted) {
    return {
      step: 'setup',
      activePassage: 1,
      title: 'IELTS Reading — Cambridge 10 Test 1',
      cambridge: '10',
      test: '1',
      answerKey: '',
      drafts: createEmptyReadingWizardDrafts(),
      extraMediaNames: [],
      restored: false,
      savedAt: null,
      isEditMode: false,
    }
  }

  return {
    step: persisted.step,
    activePassage: persisted.activePassage,
    title: persisted.title || 'IELTS Reading — Cambridge 10 Test 1',
    cambridge: persisted.cambridge || '10',
    test: persisted.test || '1',
    answerKey: persisted.answerKey,
    drafts: persisted.drafts,
    extraMediaNames: persisted.extraMediaNames ?? [],
    restored: true,
    savedAt: persisted.savedAt,
    isEditMode: false,
  }
}

function toPersistedDraft(
  state: WizardUiState,
  step: ReadingWizardPersistStep,
): IeltsReadingWizardDraft {
  return {
    version: 1,
    savedAt: Date.now(),
    step,
    activePassage: state.activePassage,
    title: state.title,
    cambridge: state.cambridge,
    test: state.test,
    answerKey: state.answerKey,
    drafts: state.drafts,
    extraMediaNames: state.extraMediaNames,
  }
}

function downloadReadingJson(payload: ReadingImportPayload, filename: string): void {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function IeltsReadingImportWizard({
  onClose,
  onCreated,
  editExam = null,
  editSourceFilename,
}: Props) {
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const ai = useAiSettings()
  const isAdmin = useIsAdmin()
  const initial = useRef(createInitialWizardState(editExam, editSourceFilename)).current
  const isEditMode = initial.isEditMode && editExam != null

  const [step, setStep] = useState<WizardStep>(initial.step)
  const [activePassage, setActivePassage] = useState<IeltsReadingPassageNumber>(initial.activePassage)
  const [title, setTitle] = useState(initial.title)
  const [cambridge, setCambridge] = useState(initial.cambridge)
  const [test, setTest] = useState(initial.test)
  const [answerKey, setAnswerKey] = useState(initial.answerKey)
  const [drafts, setDrafts] = useState<Record<IeltsReadingPassageNumber, PassageDraft>>(initial.drafts)
  const [extraMedia, setExtraMedia] = useState<File[]>([])
  const [extraMediaNames, setExtraMediaNames] = useState<string[]>(initial.extraMediaNames)
  const [payload, setPayload] = useState<ReadingImportPayload | null>(() => {
    if (initial.step !== 'preview') return null
    const parts = IELTS_READING_PASSAGE_NUMBERS.map(n => initial.drafts[n].part).filter(Boolean) as ReadingImportPartJson[]
    if (!parts.length) return null
    return buildFullReadingPayload(parts, {
      title: initial.title,
      cambridge: Number(initial.cambridge) || undefined,
      test: Number(initial.test) || undefined,
    })
  })
  const [warnings, setWarnings] = useState<string[]>(() => {
    if (initial.step !== 'preview') return []
    const parts = IELTS_READING_PASSAGE_NUMBERS
      .map(n => initial.drafts[n].part)
      .filter(Boolean) as ReadingImportPartJson[]
    if (!parts.length) return []
    return validateReadingManualImport(buildFullReadingPayload(parts, {
      title: initial.title,
      cambridge: Number(initial.cambridge) || undefined,
      test: Number(initial.test) || undefined,
    }))
  })
  const [showRawJson, setShowRawJson] = useState(false)
  const [rawJsonPassage, setRawJsonPassage] = useState<IeltsReadingPassageNumber | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null)
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(initial.savedAt)
  const [restoredDraft, setRestoredDraft] = useState(initial.restored)

  const apiKey = ai.keys[ai.provider]?.trim() ?? ''
  const providerName = AI_PROVIDERS.find(p => p.id === ai.provider)?.name ?? ai.provider
  const currentDraft = drafts[activePassage]

  const allPassagesDone = IELTS_READING_PASSAGE_NUMBERS.every(n => drafts[n].part != null)

  const persistStep: ReadingWizardPersistStep = step === 'saving' ? 'preview' : step

  useEffect(() => {
    if (isEditMode || step === 'saving') return
    const timer = window.setTimeout(() => {
      saveIeltsReadingWizardDraft(toPersistedDraft({
        step,
        activePassage,
        title,
        cambridge,
        test,
        answerKey,
        drafts,
        extraMediaNames: extraMedia.length
          ? extraMedia.map(f => f.name)
          : extraMediaNames,
      }, persistStep))
      setDraftSavedAt(Date.now())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [
    step,
    activePassage,
    title,
    cambridge,
    test,
    answerKey,
    drafts,
    extraMedia,
    extraMediaNames,
    persistStep,
    isEditMode,
  ])

  function applyEditBaseline() {
    if (!editExam) return
    const edit = wizardEditStateFromExam(editExam, editSourceFilename)
    setStep('preview')
    setActivePassage(edit.activePassage)
    setTitle(edit.title)
    setCambridge(edit.cambridge)
    setTest(edit.test)
    setAnswerKey(edit.answerKey)
    setDrafts(edit.drafts)
    setExtraMedia([])
    setExtraMediaNames([])
    setPayload(buildFullReadingPayload(
      IELTS_READING_PASSAGE_NUMBERS.map(n => edit.drafts[n].part).filter(Boolean) as ReadingImportPartJson[],
      { title: edit.title, cambridge: Number(edit.cambridge) || undefined, test: Number(edit.test) || undefined },
    ))
    setWarnings([])
    setError(null)
    setShowRawJson(false)
    setRawJsonPassage(null)
  }

  function updateDraft(passageNumber: IeltsReadingPassageNumber, patch: Partial<PassageDraft>) {
    setDrafts(prev => ({ ...prev, [passageNumber]: { ...prev[passageNumber], ...patch } }))
  }

  function handleClearDraft() {
    if (isEditMode && editExam) {
      if (!window.confirm('Khôi phục đề về bản đã lưu trong thư viện? Mọi thay đổi chưa cập nhật sẽ mất.')) return
      applyEditBaseline()
      return
    }

    if (!window.confirm('Xóa nháp Wizard Reading? Không thể hoàn tác.')) return
    clearIeltsReadingWizardDraft()
    setStep('setup')
    setActivePassage(1)
    setTitle('IELTS Reading — Cambridge 10 Test 1')
    setCambridge('10')
    setTest('1')
    setAnswerKey('')
    setDrafts(createEmptyReadingWizardDrafts())
    setExtraMedia([])
    setExtraMediaNames([])
    setPayload(null)
    setWarnings([])
    setDraftSavedAt(null)
    setRestoredDraft(false)
    setError(null)
  }

  function rebuildPayloadFromDrafts(): ReadingImportPayload | null {
    // Re-apply structure theo templateKind từng passage (chỉ table/notes template mới ép noteTable)
    const parts = IELTS_READING_PASSAGE_NUMBERS.map(n => {
      const draft = drafts[n]
      if (!draft.part) return null
      try {
        const tpl = getIeltsReadingWizardTemplatePart(n, draft.templateKind)
        const normalized = normalizeAiReadingPart(draft.part)
        // applyReadingTemplateTableStructure tự no-op table nếu SAMPLE không có noteTable
        return applyReadingTemplateTableStructure(normalized, tpl)
      } catch {
        return draft.part
      }
    }).filter(Boolean) as ReadingImportPartJson[]
    if (!parts.length) return null
    return buildFullReadingPayload(parts, {
      title,
      cambridge: Number(cambridge) || undefined,
      test: Number(test) || undefined,
    })
  }

  useEffect(() => {
    if (step !== 'preview') return
    const next = rebuildPayloadFromDrafts()
    setPayload(next)
    if (!next) return
    setWarnings(validateReadingManualImport(next))
  }, [drafts, step, title, cambridge, test])

  async function handleGenerate() {
    setError(null)
    setGenerating(true)
    try {
      const result = await generateIeltsReadingPassage({
        passageNumber: activePassage,
        templateKind: currentDraft.templateKind,
        examText: currentDraft.examText,
        answerKey,
        apiKey,
        provider: ai.provider,
        title,
      })

      updateDraft(activePassage, {
        part: result.part,
        rawJson: result.rawJson,
        warnings: result.warnings,
      })

      if (activePassage < 3) {
        setActivePassage((activePassage + 1) as IeltsReadingPassageNumber)
      } else {
        const parts = IELTS_READING_PASSAGE_NUMBERS.map(n =>
          n === activePassage ? result.part : drafts[n].part,
        ).filter(Boolean) as ReadingImportPartJson[]
        const next = buildFullReadingPayload(parts, {
          title,
          cambridge: Number(cambridge) || undefined,
          test: Number(test) || undefined,
        })
        setPayload(next)
        setWarnings(validateReadingManualImport(next))
        setStep('preview')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI không tạo được JSON.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    const next = rebuildPayloadFromDrafts()
    if (!next || !allPassagesDone) return
    setSaving(true)
    setStep('saving')
    setError(null)
    try {
      const label = `wizard-cam${cambridge}-test${test}`

      const mediaStorage = isAdmin === true ? 'cloud' as const : 'local' as const

      if (isEditMode && editExam) {
        const built = await buildReadingExamFromImport(next, extraMedia, editExam.id, { mediaStorage })
        const parts = mergePassageImageKeys(editExam.parts, built.parts)
        const examToSave: ReadingExam = {
          ...editExam,
          title: built.title,
          durationMinutes: built.durationMinutes,
          bandHint: built.bandHint,
          parts,
        }
        await examRepo.update(editExam.id, {
          title: built.title,
          durationMinutes: built.durationMinutes,
          bandHint: built.bandHint,
          parts: parts as unknown[],
        })
        // Auto-backup trước publish — không mất nếu cloud lỗi
        await backupReadingExam(examToSave, { sourceFilename: label }).catch(() => undefined)
        if (isAdmin === true) {
          await publishReadingExamToCloud(examToSave, { source: 'manual', sourceFilename: label })
        }
        onCreated?.(editExam.id)
      } else {
        const exam = await buildReadingExamFromImport(next, extraMedia, undefined, { mediaStorage })
        await examRepo.create(examRecordFromReading(exam, 'manual', label))
        await backupReadingExam(exam, { sourceFilename: label }).catch(() => undefined)
        if (isAdmin === true) {
          await publishReadingExamToCloud(exam, { source: 'manual', sourceFilename: label })
        }
        clearIeltsReadingWizardDraft()
        onCreated?.(exam.id)
      }

      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : isEditMode ? 'Cập nhật đề thất bại.' : 'Lưu đề thất bại.')
      setStep('preview')
    } finally {
      setSaving(false)
    }
  }

  function handleDownloadJson() {
    const next = rebuildPayloadFromDrafts()
    if (!next) return
    downloadReadingJson(next, `ielts-reading-wizard-cam${cambridge || 'x'}-test${test || 'x'}.json`)
  }

  function goToPreview() {
    const next = rebuildPayloadFromDrafts()
    if (!next) {
      setError('Cần tạo ít nhất 1 Passage trước.')
      return
    }
    setPayload(next)
    setStep('preview')
  }

  const qCount = payload ? countReadingImportQuestions(payload) : 0
  const passagesDoneCount = countReadingWizardDraftPassages(drafts)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--bg-primary) 45%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                {isEditMode ? 'Sửa đề Reading (Wizard)' : 'IELTS Reading Import Wizard'}
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {isEditMode
                  ? `Cập nhật đề đã import · chỉ tạo lại passage cần sửa`
                  : '3 passages · ~40 câu · AI trong app'}
                {!isEditMode && draftSavedAt ? ` · Nháp ${formatReadingWizardDraftSavedAt(draftSavedAt)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditMode && draftSavedAt && (
              <span className="ielts-wizard-draft-badge" title="Tự lưu trên máy — đóng Wizard vẫn giữ">
                <Check size={12} />
                Đã lưu nháp
              </span>
            )}
            {isEditMode && (
              <span className="ielts-wizard-draft-badge" title="Thay đổi chỉ áp dụng sau khi bấm Cập nhật đề">
                <Check size={12} />
                Chế độ sửa
              </span>
            )}
            {((!isEditMode && (draftSavedAt || passagesDoneCount > 0)) || isEditMode) && (
              <button
                type="button"
                className="text-xs font-medium rounded-lg px-2 py-1"
                style={{ color: 'var(--text-muted)' }}
                onClick={handleClearDraft}
              >
                {isEditMode ? 'Khôi phục' : 'Xóa nháp'}
              </button>
            )}
            <button type="button" onClick={onClose} className="p-1 rounded-lg hover:opacity-80">
              <X size={18} style={{ color: 'var(--text-muted)' }} />
            </button>
          </div>
        </div>

        {restoredDraft && (
          <div
            className="mx-5 mt-3 rounded-lg border px-3 py-2 text-xs"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 35%, var(--border-color))',
              color: 'var(--text-muted)',
            }}
          >
            Đã khôi phục nháp — {passagesDoneCount}/3 Passage đã phân tích AI.
            {extraMediaNames.length > 0 && !extraMedia.length && (
              <span style={{ color: 'var(--color-accent)' }}>
                {' '}Chọn lại ảnh đoạn văn ở bước Preview ({extraMediaNames.join(', ')}).
              </span>
            )}
          </div>
        )}

        <div className="px-5 pt-3">
          <div className="ielts-wizard-steps">
            <span className={`ielts-wizard-step${step === 'setup' ? ' is-active' : ''}${step !== 'setup' ? ' is-done' : ''}`}>
              1. Thông tin
            </span>
            {IELTS_READING_PASSAGE_NUMBERS.map(n => (
              <span
                key={n}
                className={`ielts-wizard-step${
                  step === 'passage' && activePassage === n ? ' is-active' : ''
                }${drafts[n].part ? ' is-done' : ''}`}
              >
                {n + 1}. Passage {n}
              </span>
            ))}
            <span className={`ielts-wizard-step${step === 'preview' || step === 'saving' ? ' is-active' : ''}${allPassagesDone ? ' is-done' : ''}`}>
              5. Preview
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'setup' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Dán <strong>Answer Key đủ 40 câu</strong>. Mỗi Passage: paste đoạn văn + câu hỏi từ Word,
                AI tách passage và questionGroups. Ảnh đoạn văn (nếu có) thêm ở bước Preview.
              </p>

              <div className="ielts-wizard-meta-row">
                <div className="ielts-wizard-field">
                  <label htmlFor="reading-wizard-title">Tiêu đề đề thi</label>
                  <input
                    id="reading-wizard-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="ielts-wizard-field">
                  <label htmlFor="reading-wizard-cam">Cam</label>
                  <input
                    id="reading-wizard-cam"
                    value={cambridge}
                    onChange={e => setCambridge(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div className="ielts-wizard-field">
                  <label htmlFor="reading-wizard-test">Test</label>
                  <input
                    id="reading-wizard-test"
                    value={test}
                    onChange={e => setTest(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="ielts-wizard-field">
                <label htmlFor="reading-wizard-key">Answer Key — câu 1–40</label>
                <textarea
                  id="reading-wizard-key"
                  className="ielts-wizard-textarea"
                  style={{ minHeight: '8rem' }}
                  value={answerKey}
                  onChange={e => setAnswerKey(e.target.value)}
                  placeholder={'1 NOT GIVEN\n2 FALSE\n…\n40 C'}
                />
              </div>

              {!ai.loading && !apiKey && (
                <p className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-accent)' }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  Chưa có API key —{' '}
                  <Link to="/app/settings?tab=ai" className="underline" onClick={onClose}>
                    Cài đặt AI
                  </Link>
                </p>
              )}
            </div>
          )}

          {step === 'passage' && (
            <>
              <div className="ielts-wizard-part-nav">
                {IELTS_READING_PASSAGE_NUMBERS.map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`ielts-wizard-part-chip${activePassage === n ? ' is-active' : ''}${drafts[n].part ? ' is-done' : ''}`}
                    onClick={() => { setActivePassage(n); setError(null) }}
                  >
                    Passage {n}
                  </button>
                ))}
              </div>

              {drafts[activePassage].part && (
                <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                  <Check size={12} />
                  Passage {activePassage} đã tạo — tạo lại sẽ ghi đè
                </p>
              )}

              <WizardPassageStepPanel
                passageNumber={activePassage}
                templateKind={currentDraft.templateKind}
                examText={currentDraft.examText}
                generating={generating}
                providerName={providerName}
                error={error}
                onTemplateChange={kind => updateDraft(activePassage, { templateKind: kind })}
                onExamTextChange={text => updateDraft(activePassage, { examText: text })}
                onOpenLightbox={(src, label) => setLightbox({ src, label })}
              />
            </>
          )}

          {step === 'preview' && payload && (
            <div className="flex flex-col gap-4">
              {isEditMode && (
                <p className="text-sm leading-relaxed rounded-xl border px-3 py-2" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                  Bấm <strong>Sửa passages</strong> → chọn Passage cần sửa → dán text mới → <strong>Tạo JSON</strong>.
                  Passage khác giữ nguyên cho đến khi bạn tạo lại.
                </p>
              )}
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{payload.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {payload.bandHint} · {qCount} câu · 60 phút
                  {(extraMedia.length || extraMediaNames.length)
                    ? ` · ${extraMedia.length || extraMediaNames.length} ảnh`
                    : ''}
                </p>
              </div>

              {warnings.length > 0 && (
                <div
                  className="rounded-xl border p-3 text-xs space-y-1 max-h-36 overflow-y-auto"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-accent) 35%, var(--border-color))',
                    color: 'var(--text-muted)',
                  }}
                >
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Cảnh báo ({warnings.length})
                  </p>
                  {warnings.map(w => (
                    <p key={w}>• {w}</p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {IELTS_READING_PASSAGE_NUMBERS.map(n => {
                  const p = drafts[n].part
                  return (
                    <div
                      key={n}
                      className="rounded-lg border px-3 py-2 text-sm flex justify-between items-center gap-2"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Passage {n}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {p
                            ? ` — ${p.passageTitle ?? '…'} · ${p.questionGroups.reduce((s, g) => s + g.questions.length, 0)} câu · ${drafts[n].templateKind}`
                            : ' — chưa tạo'}
                        </span>
                      </span>
                      {p && (
                        <button
                          type="button"
                          className="text-xs font-semibold shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                          onClick={() => {
                            setRawJsonPassage(n)
                            setShowRawJson(true)
                          }}
                        >
                          JSON
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {(showRawJson && rawJsonPassage && drafts[rawJsonPassage].rawJson) && (
                <pre className="ielts-wizard-json-preview">
                  {drafts[rawJsonPassage].rawJson}
                </pre>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  onClick={handleDownloadJson}
                >
                  <Download size={14} />
                  Tải exam.json
                </button>
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                      onClick={() => mediaInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      Thêm ảnh (lưu cloud)
                    </button>
                    <p className="w-full text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Đặt tên file: <code>part1-top.jpg</code> (đầu passage), <code>part1-bottom.jpg</code> (cuối),
                      {' '}<code>part1-p0.jpg</code> (ảnh trong passage), <code>part1-group-0.jpg</code> (ảnh nhóm câu),
                      hoặc trùng <code>imageFile</code> trong JSON.
                    </p>
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.gif,image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files ?? []).filter(isReadingMediaFile)
                        setExtraMedia(prev => {
                          const map = new Map(prev.map(f => [f.name.toLowerCase(), f]))
                          for (const f of files) map.set(f.name.toLowerCase(), f)
                          const next = Array.from(map.values())
                          setExtraMediaNames(next.map(f => f.name))
                          return next
                        })
                      }}
                    />
                  </>
                )}
              </div>

              {error && (
                <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{error}</p>
              )}
            </div>
          )}

          {step === 'saving' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {isEditMode ? 'Đang cập nhật đề…' : 'Đang lưu đề đủ 3 passages…'}
              </p>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-between gap-2 border-t px-5 py-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Link
            to="/app/settings?tab=ai"
            className="text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
            onClick={onClose}
          >
            Cài đặt AI
          </Link>

          <div className="flex gap-2 flex-wrap justify-end">
            {step === 'passage' && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onClick={() => {
                  if (activePassage === 1) setStep('setup')
                  else setActivePassage((activePassage - 1) as IeltsReadingPassageNumber)
                }}
              >
                <ChevronLeft size={16} />
                Quay lại
              </button>
            )}

            {step === 'preview' && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onClick={() => { setStep('passage'); setActivePassage(1) }}
              >
                <ChevronLeft size={16} />
                Sửa passages
              </button>
            )}

            {step === 'setup' && (
              <button
                type="button"
                disabled={!title.trim() || !answerKey.trim() || !apiKey}
                className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                onClick={() => setStep('passage')}
              >
                Bắt đầu Passage 1
                <ChevronRight size={16} />
              </button>
            )}

            {step === 'passage' && (
              <>
                {allPassagesDone && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-semibold"
                    style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    onClick={goToPreview}
                  >
                    Preview
                    <ChevronRight size={16} />
                  </button>
                )}
                <button
                  type="button"
                  disabled={generating || !currentDraft.examText.trim() || !apiKey}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                  style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                  onClick={() => void handleGenerate()}
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Tạo Passage {activePassage}
                </button>
              </>
            )}

            {step === 'preview' && (
              <button
                type="button"
                disabled={saving || !allPassagesDone}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                onClick={() => void handleSave()}
                title={!allPassagesDone ? 'Cần đủ 3 passages' : undefined}
              >
                <Check size={16} />
                {isEditMode ? 'Cập nhật đề' : 'Lưu đề (~40 câu)'}
              </button>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <WizardImageLightbox
          src={lightbox.src}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}