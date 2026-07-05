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
  FileText,
} from 'lucide-react'
import { listeningExamRepo } from '@ryan/db'
import { AI_PROVIDERS } from '@ryan/core'
import { useAiSettings } from '../../settings/useAiSettings'
import { downloadJsonTemplate } from '../ieltsListeningImportTemplates'
import {
  buildListeningExamFromImport,
  countListeningImportQuestions,
  validateListeningImport,
  validateListeningImportMedia,
  type ListeningImportPartJson,
  type ListeningImportPayload,
} from '../importListeningUtils'
import { examRecordFromListening } from '../listeningExamLoader'
import {
  buildFullExamPayload,
  generateIeltsListeningPart,
} from './ieltsListeningAiGenerate'
import type { IeltsWizardPartNumber } from './ieltsListeningWizardConfig'
import WizardImageLightbox from './WizardImageLightbox'
import WizardPartStepPanel from './WizardPartStepPanel'
import { cleanupWizardExamText } from './ieltsListeningWizardTextCleanup'
import {
  clearIeltsListeningWizardDraft,
  countWizardDraftParts,
  createEmptyWizardDrafts,
  formatWizardDraftSavedAt,
  loadIeltsListeningWizardDraft,
  saveIeltsListeningWizardDraft,
  type IeltsListeningWizardDraft,
  type PersistedPartDraft,
  type WizardPersistStep,
} from './ieltsListeningWizardPersist'
import { extractDocxContent } from '../docxExtract'
import { buildWizardExamTextsFromDocx } from '../ieltsListeningDocxToWizard'
import './ieltsListeningWizard.css'

interface Props {
  onClose: () => void
  onCreated?: (examId: string) => void
}

type WizardStep = 'setup' | 'part' | 'preview' | 'saving'

const PART_NUMBERS: IeltsWizardPartNumber[] = [1, 2, 3, 4]

type PartDraft = PersistedPartDraft

interface WizardUiState {
  step: WizardStep
  activePart: IeltsWizardPartNumber
  title: string
  cambridge: string
  test: string
  answerKey: string
  drafts: Record<IeltsWizardPartNumber, PartDraft>
  audioFileName: string | null
  extraMediaNames: string[]
}

function createInitialWizardState(): WizardUiState & { restored: boolean; savedAt: number | null } {
  const persisted = loadIeltsListeningWizardDraft()
  if (!persisted) {
    return {
      step: 'setup',
      activePart: 1,
      title: 'IELTS Listening — Cambridge 10 Test 1',
      cambridge: '10',
      test: '1',
      answerKey: '',
      drafts: createEmptyWizardDrafts(),
      audioFileName: null,
      extraMediaNames: [],
      restored: false,
      savedAt: null,
    }
  }

  return {
    step: persisted.step,
    activePart: persisted.activePart,
    title: persisted.title || 'IELTS Listening — Cambridge 10 Test 1',
    cambridge: persisted.cambridge || '10',
    test: persisted.test || '1',
    answerKey: persisted.answerKey,
    drafts: persisted.drafts,
    audioFileName: persisted.audioFileName,
    extraMediaNames: persisted.extraMediaNames,
    restored: true,
    savedAt: persisted.savedAt,
  }
}

function toPersistedDraft(
  state: WizardUiState,
  step: WizardPersistStep,
): IeltsListeningWizardDraft {
  return {
    version: 1,
    savedAt: Date.now(),
    step,
    activePart: state.activePart,
    title: state.title,
    cambridge: state.cambridge,
    test: state.test,
    answerKey: state.answerKey,
    drafts: state.drafts,
    audioFileName: state.audioFileName,
    extraMediaNames: state.extraMediaNames,
  }
}

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function asListeningMp3(file: File): File {
  if (file.name.toLowerCase() === 'listening.mp3') return file
  return new File([file], 'listening.mp3', { type: file.type || 'audio/mpeg' })
}

function isListeningImageFile(file: File): boolean {
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)
}

export default function IeltsListeningImportWizard({ onClose, onCreated }: Props) {
  const audioInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const docxInputRef = useRef<HTMLInputElement>(null)
  const ai = useAiSettings()
  const initial = useRef(createInitialWizardState()).current

  const [step, setStep] = useState<WizardStep>(initial.step)
  const [activePart, setActivePart] = useState<IeltsWizardPartNumber>(initial.activePart)
  const [title, setTitle] = useState(initial.title)
  const [cambridge, setCambridge] = useState(initial.cambridge)
  const [test, setTest] = useState(initial.test)
  const [answerKey, setAnswerKey] = useState(initial.answerKey)
  const [drafts, setDrafts] = useState<Record<IeltsWizardPartNumber, PartDraft>>(initial.drafts)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(initial.audioFileName)
  const [extraMedia, setExtraMedia] = useState<File[]>([])
  const [extraMediaNames, setExtraMediaNames] = useState<string[]>(initial.extraMediaNames)
  const [payload, setPayload] = useState<ListeningImportPayload | null>(() => {
    if (initial.step !== 'preview') return null
    const parts = PART_NUMBERS.map(n => initial.drafts[n].part).filter(Boolean) as ListeningImportPartJson[]
    if (!parts.length) return null
    return buildFullExamPayload(parts, {
      title: initial.title,
      cambridge: Number(initial.cambridge) || undefined,
      test: Number(initial.test) || undefined,
    })
  })
  const [warnings, setWarnings] = useState<string[]>([])
  const [showRawJson, setShowRawJson] = useState(false)
  const [rawJsonPart, setRawJsonPart] = useState<IeltsWizardPartNumber | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [parsingDocx, setParsingDocx] = useState(false)
  const [docxImportNote, setDocxImportNote] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null)
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(initial.savedAt)
  const [restoredDraft, setRestoredDraft] = useState(initial.restored)

  const apiKey = ai.keys[ai.provider]?.trim() ?? ''
  const providerName = AI_PROVIDERS.find(p => p.id === ai.provider)?.name ?? ai.provider
  const currentDraft = drafts[activePart]

  const allPartsDone = PART_NUMBERS.every(n => drafts[n].part != null)
  const mediaFiles = [
    ...(audioFile ? [asListeningMp3(audioFile)] : []),
    ...extraMedia,
  ]

  const persistStep: WizardPersistStep = step === 'saving' ? 'preview' : step

  useEffect(() => {
    if (step === 'saving') return
    const timer = window.setTimeout(() => {
      saveIeltsListeningWizardDraft(toPersistedDraft({
        step,
        activePart,
        title,
        cambridge,
        test,
        answerKey,
        drafts,
        audioFileName: audioFile?.name ?? audioFileName,
        extraMediaNames: extraMedia.length
          ? extraMedia.map(f => f.name)
          : extraMediaNames,
      }, persistStep))
      setDraftSavedAt(Date.now())
    }, 400)
    return () => window.clearTimeout(timer)
  }, [
    step,
    activePart,
    title,
    cambridge,
    test,
    answerKey,
    drafts,
    audioFile,
    audioFileName,
    extraMedia,
    extraMediaNames,
    persistStep,
  ])

  function updateDraft(partNumber: IeltsWizardPartNumber, patch: Partial<PartDraft>) {
    setDrafts(prev => ({ ...prev, [partNumber]: { ...prev[partNumber], ...patch } }))
  }

  async function handleImportDocx(file: File) {
    setError(null)
    setDocxImportNote(null)
    setParsingDocx(true)
    try {
      const content = await extractDocxContent(file, { splitMultilineParagraphs: false })
      const result = buildWizardExamTextsFromDocx(content, { fileName: file.name })

      if (result.suggestedTitle) setTitle(result.suggestedTitle)
      if (result.suggestedCambridge) setCambridge(result.suggestedCambridge)
      if (result.suggestedTest) setTest(result.suggestedTest)

      setDrafts(prev => {
        const next = { ...prev }
        for (const n of PART_NUMBERS) {
          next[n] = {
            ...next[n],
            examText: result.partTexts[n],
            part: null,
            rawJson: '',
            warnings: [],
          }
        }
        return next
      })

      if (result.mediaFiles.length) {
        setExtraMedia(prev => {
          const names = new Set(prev.map(f => f.name.toLowerCase()))
          return [...prev, ...result.mediaFiles.filter(f => !names.has(f.name.toLowerCase()))]
        })
        setExtraMediaNames(prev => {
          const names = new Set(prev.map(n => n.toLowerCase()))
          return [...prev, ...result.mediaFiles.map(f => f.name).filter(n => !names.has(n.toLowerCase()))]
        })
      }

      const filled = PART_NUMBERS.filter(n => result.partTexts[n].trim().length > 0).length
      setDocxImportNote(
        `Đã nạp ${filled}/4 part từ Word${result.mediaFiles.length ? ` · ${result.mediaFiles.length} ảnh` : ''}. Chọn template từng part → Tạo JSON.`,
      )
      if (result.warnings.length) {
        setWarnings(result.warnings)
      }
      setStep('part')
      setActivePart(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đọc được file Word.')
    } finally {
      setParsingDocx(false)
      if (docxInputRef.current) docxInputRef.current.value = ''
    }
  }

  function handleNormalizeExamText(partNumber: IeltsWizardPartNumber) {
    const draft = drafts[partNumber]
    const cleaned = cleanupWizardExamText(draft.examText)
    if (cleaned === draft.examText) return
    updateDraft(partNumber, { examText: cleaned })
  }

  function handleClearDraft() {
    if (!window.confirm('Xóa nháp Wizard? Không thể hoàn tác.')) return
    clearIeltsListeningWizardDraft()
    setStep('setup')
    setActivePart(1)
    setTitle('IELTS Listening — Cambridge 10 Test 1')
    setCambridge('10')
    setTest('1')
    setAnswerKey('')
    setDrafts(createEmptyWizardDrafts())
    setAudioFile(null)
    setAudioFileName(null)
    setExtraMedia([])
    setExtraMediaNames([])
    setPayload(null)
    setWarnings([])
    setDraftSavedAt(null)
    setRestoredDraft(false)
    setError(null)
  }

  function rebuildPayloadFromDrafts(): ListeningImportPayload | null {
    const parts = PART_NUMBERS.map(n => drafts[n].part).filter(Boolean) as ListeningImportPartJson[]
    if (!parts.length) return null
    return buildFullExamPayload(parts, {
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
    setWarnings([
      ...validateListeningImport(next),
      ...validateListeningImportMedia(next, mediaFiles),
    ])
  }, [drafts, step, title, cambridge, test, audioFile, extraMedia])

  async function handleGenerate() {
    setError(null)
    setGenerating(true)
    try {
      const result = await generateIeltsListeningPart({
        partNumber: activePart,
        templateKind: currentDraft.templateKind,
        examText: currentDraft.examText,
        answerKey,
        apiKey,
        provider: ai.provider,
        title,
      })

      updateDraft(activePart, {
        part: result.part,
        rawJson: result.rawJson,
        warnings: result.warnings,
      })

      if (activePart < 4) {
        setActivePart((activePart + 1) as IeltsWizardPartNumber)
      } else {
        const parts = PART_NUMBERS.map(n =>
          n === activePart ? result.part : drafts[n].part,
        ).filter(Boolean) as ListeningImportPartJson[]
        const next = buildFullExamPayload(parts, {
          title,
          cambridge: Number(cambridge) || undefined,
          test: Number(test) || undefined,
        })
        setPayload(next)
        setWarnings([
          ...validateListeningImport(next),
          ...validateListeningImportMedia(next, mediaFiles),
        ])
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
    if (!next || !allPartsDone) return
    setSaving(true)
    setStep('saving')
    setError(null)
    try {
      const exam = await buildListeningExamFromImport(next, mediaFiles)
      const label = `wizard-cam${cambridge}-test${test}`
      await listeningExamRepo.create(examRecordFromListening(exam, 'import', label))
      clearIeltsListeningWizardDraft()
      onCreated?.(exam.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu đề thất bại.')
      setStep('preview')
    } finally {
      setSaving(false)
    }
  }

  function handleDownloadJson() {
    const next = rebuildPayloadFromDrafts()
    if (!next) return
    downloadJsonTemplate(next, `ielts-wizard-cam${cambridge || 'x'}-test${test || 'x'}.json`)
  }

  function goToPreview() {
    const next = rebuildPayloadFromDrafts()
    if (!next) {
      setError('Cần tạo ít nhất 1 Part trước.')
      return
    }
    setPayload(next)
    setStep('preview')
  }

  const qCount = payload ? countListeningImportQuestions(payload) : 0
  const partsDoneCount = countWizardDraftParts(drafts)
  const needsAudioReupload = Boolean(audioFileName && !audioFile)

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
                IELTS Import Wizard
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                4 Parts · 40 câu · AI trong app
                {draftSavedAt ? ` · Nháp ${formatWizardDraftSavedAt(draftSavedAt)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {draftSavedAt && (
              <span className="ielts-wizard-draft-badge" title="Tự lưu trên máy — đóng Wizard vẫn giữ">
                <Check size={12} />
                Đã lưu nháp
              </span>
            )}
            {(draftSavedAt || partsDoneCount > 0) && (
              <button
                type="button"
                className="text-xs font-medium rounded-lg px-2 py-1"
                style={{ color: 'var(--text-muted)' }}
                onClick={handleClearDraft}
              >
                Xóa nháp
              </button>
            )}
            {step !== 'saving' && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                disabled={parsingDocx}
                title="Chọn file .docx — đổ text vào 4 Part (bước Thông tin hoặc đang sửa Part)"
                onClick={() => docxInputRef.current?.click()}
              >
                {parsingDocx
                  ? <Loader2 size={14} className="animate-spin" />
                  : <FileText size={14} />}
                Import DOCX
              </button>
            )}
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:opacity-80">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
          </div>
        </div>

        <input
          ref={docxInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) void handleImportDocx(file)
          }}
        />

        {restoredDraft && (
          <div
            className="mx-5 mt-3 rounded-lg border px-3 py-2 text-xs"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 35%, var(--border-color))',
              color: 'var(--text-muted)',
            }}
          >
            Đã khôi phục nháp — {partsDoneCount}/4 Part đã phân tích AI.
            {needsAudioReupload && (
              <span style={{ color: 'var(--color-accent)' }}>
                {' '}Chọn lại <strong>{audioFileName}</strong> ở bước Thông tin.
              </span>
            )}
          </div>
        )}

        <div className="px-5 pt-3">
          <div className="ielts-wizard-steps">
            <span className={`ielts-wizard-step${step === 'setup' ? ' is-active' : ''}${step !== 'setup' ? ' is-done' : ''}`}>
              1. Thông tin
            </span>
            {PART_NUMBERS.map(n => (
              <span
                key={n}
                className={`ielts-wizard-step${
                  step === 'part' && activePart === n ? ' is-active' : ''
                }${drafts[n].part ? ' is-done' : ''}`}
              >
                {n + 1}. Part {n}
              </span>
            ))}
            <span className={`ielts-wizard-step${step === 'preview' || step === 'saving' ? ' is-active' : ''}${allPartsDone ? ' is-done' : ''}`}>
              6. Preview
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'setup' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Khuyến nghị: <strong>Import DOCX</strong> (1 file Word 4 parts) — giữ paragraph/spacing, không cần PDF OCR.
                Hoặc dán text từng part thủ công. Cần <strong>Answer Key 40 câu</strong> + <code>listening.mp3</code>.
              </p>

              <div
                className="rounded-xl border border-dashed p-4 cursor-pointer"
                style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 40%, var(--border-color))' }}
                onClick={() => !parsingDocx && docxInputRef.current?.click()}
              >
                <div className="flex items-center gap-3">
                  {parsingDocx
                    ? <Loader2 size={22} className="animate-spin shrink-0" style={{ color: 'var(--color-primary)' }} />
                    : <FileText size={22} className="shrink-0" style={{ color: 'var(--color-primary)' }} />}
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Import DOCX → 4 ô text Part
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Đọc <code>word/document.xml</code> · tách Questions 1–10 / 11–20 / 21–30 / 31–40 · ảnh map/diagram tự gắn
                    </p>
                  </div>
                </div>
              </div>

              {docxImportNote && (
                <p className="text-xs flex items-start gap-1.5" style={{ color: 'var(--color-primary)' }}>
                  <Check size={14} className="shrink-0 mt-0.5" />
                  {docxImportNote}
                </p>
              )}

              <div className="ielts-wizard-meta-row">
                <div className="ielts-wizard-field">
                  <label htmlFor="wizard-title">Tiêu đề đề thi</label>
                  <input
                    id="wizard-title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="ielts-wizard-field">
                  <label htmlFor="wizard-cam">Cam</label>
                  <input
                    id="wizard-cam"
                    value={cambridge}
                    onChange={e => setCambridge(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
                <div className="ielts-wizard-field">
                  <label htmlFor="wizard-test">Test</label>
                  <input
                    id="wizard-test"
                    value={test}
                    onChange={e => setTest(e.target.value)}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="ielts-wizard-field">
                <label htmlFor="wizard-key">Answer Key — câu 1–40</label>
                <textarea
                  id="wizard-key"
                  className="ielts-wizard-textarea"
                  style={{ minHeight: '8rem' }}
                  value={answerKey}
                  onChange={e => setAnswerKey(e.target.value)}
                  placeholder={'1 ardleigh\n2 newspaper\n…\n40 dinner'}
                />
              </div>

              <div
                className="rounded-xl border border-dashed p-4 text-center cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                onClick={() => audioInputRef.current?.click()}
              >
                <Upload size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {audioFile
                    ? audioFile.name
                    : audioFileName
                      ? `Chọn lại: ${audioFileName}`
                      : 'Upload listening.mp3'}
                </p>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,audio/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] ?? null
                    setAudioFile(file)
                    setAudioFileName(file?.name ?? null)
                  }}
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

          {step === 'part' && (
            <>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Chưa có text Part? Bấm <strong>Import DOCX</strong> góc phải header — hoặc{' '}
                <button
                  type="button"
                  className="underline font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                  onClick={() => setStep('setup')}
                >
                  quay bước 1. Thông tin
                </button>
                .
              </p>
              <div className="ielts-wizard-part-nav">
                {PART_NUMBERS.map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`ielts-wizard-part-chip${activePart === n ? ' is-active' : ''}${drafts[n].part ? ' is-done' : ''}`}
                    onClick={() => { setActivePart(n); setError(null) }}
                  >
                    Part {n}
                  </button>
                ))}
              </div>

              {drafts[activePart].part && (
                <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-primary)' }}>
                  <Check size={12} />
                  Part {activePart} đã tạo — tạo lại sẽ ghi đè
                </p>
              )}

              <WizardPartStepPanel
                partNumber={activePart}
                templateKind={currentDraft.templateKind}
                examText={currentDraft.examText}
                generating={generating}
                providerName={providerName}
                error={error}
                onTemplateChange={kind => updateDraft(activePart, { templateKind: kind })}
                onExamTextChange={text => updateDraft(activePart, { examText: text })}
                onNormalizeExamText={() => handleNormalizeExamText(activePart)}
                onOpenLightbox={(src, label) => setLightbox({ src, label })}
              />
            </>
          )}

          {step === 'preview' && payload && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{payload.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {payload.bandHint} · {qCount}/40 câu
                  {audioFile
                    ? ` · ${audioFile.name}`
                    : audioFileName
                      ? ` · (cần chọn lại ${audioFileName})`
                      : ''}
                  {(extraMedia.length || extraMediaNames.length)
                    ? ` · +${extraMedia.length || extraMediaNames.length} ảnh`
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
                {PART_NUMBERS.map(n => {
                  const p = drafts[n].part
                  return (
                    <div
                      key={n}
                      className="rounded-lg border px-3 py-2 text-sm flex justify-between items-center gap-2"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span>
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          Part {n}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {p
                            ? ` — ${p.questions.length} câu · ${drafts[n].templateKind}`
                            : ' — chưa tạo'}
                        </span>
                      </span>
                      {p && (
                        <button
                          type="button"
                          className="text-xs font-semibold shrink-0"
                          style={{ color: 'var(--text-muted)' }}
                          onClick={() => {
                            setRawJsonPart(n)
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

              {(showRawJson && rawJsonPart && drafts[rawJsonPart].rawJson) && (
                <pre className="ielts-wizard-json-preview">
                  {drafts[rawJsonPart].rawJson}
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
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  onClick={() => mediaInputRef.current?.click()}
                >
                  <Upload size={14} />
                  Thêm map.jpg / diagram.jpg
                </button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,image/*"
                  multiple
                  className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files ?? []).filter(isListeningImageFile)
                    setExtraMedia(prev => {
                      const map = new Map(prev.map(f => [f.name.toLowerCase(), f]))
                      for (const f of files) map.set(f.name.toLowerCase(), f)
                      const next = Array.from(map.values())
                      setExtraMediaNames(next.map(f => f.name))
                      return next
                    })
                  }}
                />
              </div>

              {error && (
                <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{error}</p>
              )}
            </div>
          )}

          {step === 'saving' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang lưu đề đủ 4 parts…</p>
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
            {step === 'part' && (
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                onClick={() => {
                  if (activePart === 1) setStep('setup')
                  else setActivePart((activePart - 1) as IeltsWizardPartNumber)
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
                onClick={() => { setStep('part'); setActivePart(1) }}
              >
                <ChevronLeft size={16} />
                Sửa parts
              </button>
            )}

            {step === 'setup' && (
              <button
                type="button"
                disabled={!title.trim() || !answerKey.trim() || !apiKey}
                className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                onClick={() => setStep('part')}
              >
                Bắt đầu Part 1
                <ChevronRight size={16} />
              </button>
            )}

            {step === 'part' && (
              <>
                {allPartsDone && (
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
                  Tạo Part {activePart}
                </button>
              </>
            )}

            {step === 'preview' && (
              <button
                type="button"
                disabled={saving || !allPartsDone}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
                style={{ background: 'var(--color-primary)', color: 'var(--bg-primary)' }}
                onClick={() => void handleSave()}
                title={!allPartsDone ? 'Cần đủ 4 parts' : undefined}
              >
                <Check size={16} />
                Lưu đề (40 câu)
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
