import { useCallback, useRef, useState } from 'react'
import { X, Upload, Loader2, FileJson, AlertCircle, Check, BookOpen, Download, Archive, ImageIcon } from 'lucide-react'
import { examRepo } from '@ryan/db'
import { examRecordFromReading } from './examLoader'
import { extractReadingZip } from './importReadingZip'
import {
  buildReadingExamFromImport,
  countReadingImportQuestions,
  isReadingJsonFile,
  isReadingMediaFile,
  READING_IMPORT_MAX_JSON_BYTES,
  READING_IMPORT_MAX_MEDIA_BYTES,
  readingImportTemplate,
  parseReadingImportJson,
  petPart2PersonImageFilename,
  validateReadingManualImport,
  type ReadingImportPayload,
} from './importReadingManualUtils'
import type { CambridgeLevelSlug } from './cambridgeExamLevels'
import {
  cambridgeImportGuideLines,
  cambridgeImportGuideNote,
} from './cambridgeReadingImportTemplates'
import type { ReadingExamTrack } from './examData'
import { publishReadingExamToCloud } from './readingExamPublish'
import {
  findKetPart6ImageFile,
  findKetPart7ImageFile,
  isKetWritingImageFile,
  KET_WRITING_IMAGE_HINT,
  mergeKetWritingImagesIntoPayload,
} from './ketWritingImportUtils'
import {
  findPetPart7ImageFile,
  findPetPart8ImageFile,
  isPetWritingImageFile,
  mergePetWritingImagesIntoPayload,
  PET_WRITING_IMAGE_HINT,
} from './petWritingImportUtils'
import {
  findFcePart8ImageFile,
  findFcePart9ImageFile,
  isFceWritingImageFile,
  mergeFceWritingImagesIntoPayload,
  FCE_WRITING_IMAGE_HINT,
} from './fceWritingImportUtils'
import {
  findCaePart9ImageFile,
  findCaePart10ImageFile,
  isCaeWritingImageFile,
  mergeCaeWritingImagesIntoPayload,
  CAE_WRITING_IMAGE_HINT,
} from './caeWritingImportUtils'
import {
  findCpePart8ImageFile,
  findCpePart9ImageFile,
  isCpeWritingImageFile,
  mergeCpeWritingImagesIntoPayload,
  CPE_WRITING_IMAGE_HINT,
} from './cpeWritingImportUtils'
import PetPart2PhotoImportSlots from './petRw/PetPart2PhotoImportSlots'
import { useIsAdmin } from '../auth/useIsAdmin'

interface Props {
  onClose: () => void
  onCreated?: (examId: string) => void
  examTrack?: ReadingExamTrack
  cambridgeLevel?: CambridgeLevelSlug
}

type Step = 'upload' | 'preview' | 'saving'

function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

export default function ImportReadingManualModal({
  onClose,
  onCreated,
  examTrack = 'ielts',
  cambridgeLevel,
}: Props) {
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const writingImageInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>('upload')
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [payload, setPayload] = useState<ReadingImportPayload | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sourceLabel, setSourceLabel] = useState<string | null>(null)
  const isAdmin = useIsAdmin()
  const isIeltsTrack = examTrack === 'ielts'
  const canImportIeltsImages = !isIeltsTrack || isAdmin === true
  const [writingMergeNotes, setWritingMergeNotes] = useState<string[]>([])

  const isKetA2 = cambridgeLevel === 'a2'
  const isPetB1 = cambridgeLevel === 'b1'
  const isFceB2 = cambridgeLevel === 'b2'
  const isCaeC1 = cambridgeLevel === 'c1'
  const isCpeC2 = cambridgeLevel === 'c2'
  const hasRwImageMerge = isKetA2 || isPetB1 || isFceB2 || isCaeC1 || isCpeC2
  const hasPetPart2 = Boolean(
    isPetB1 && payload?.parts.some(p => p.partNumber === 2),
  )

  const assignPart2PersonPhoto = useCallback((questionNumber: number, file: File) => {
    const name = petPart2PersonImageFilename(questionNumber)
    const renamed = new File([file], name, { type: file.type || 'image/jpeg' })
    setMediaFiles(prev => {
      const map = new Map(prev.map(f => [f.name.toLowerCase(), f]))
      map.set(name.toLowerCase(), renamed)
      return Array.from(map.values())
    })
    setError(null)
  }, [])

  const finalizePayload = useCallback((
    parsed: ReadingImportPayload,
    files: File[],
    label: string,
    json: File | null,
    extraNotes: string[] = [],
  ) => {
    const merged = isKetA2
      ? mergeKetWritingImagesIntoPayload(parsed, files)
      : isPetB1
        ? mergePetWritingImagesIntoPayload(parsed, files)
        : isFceB2
          ? mergeFceWritingImagesIntoPayload(parsed, files)
          : isCaeC1
            ? mergeCaeWritingImagesIntoPayload(parsed, files)
            : isCpeC2
              ? mergeCpeWritingImagesIntoPayload(parsed, files)
              : { payload: parsed, merged: false, notes: [] as string[], extraMediaFiles: [] as File[] }

    setJsonFile(json)
    setSourceLabel(label)
    setMediaFiles(files)
    setPayload(merged.payload)
    setWritingMergeNotes(merged.notes.filter(n => !n.startsWith('Part') || n.includes('ảnh')))
    setWarnings([
      ...extraNotes,
      ...validateReadingManualImport(merged.payload),
      ...merged.notes.filter(n => n.includes('chưa') || n.includes('cần')),
    ])
    setStep('preview')
  }, [isCaeC1, isCpeC2, isFceB2, isKetA2, isPetB1])

  const processJson = useCallback(async (file: File) => {
    setError(null)
    if (file.size > READING_IMPORT_MAX_JSON_BYTES) {
      setError(`JSON quá lớn (tối đa ${formatBytes(READING_IMPORT_MAX_JSON_BYTES)}).`)
      return
    }
    try {
      const text = await file.text()
      const parsed = parseReadingImportJson(text)
      finalizePayload(parsed, mediaFiles, file.name, file)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đọc được JSON.')
    }
  }, [finalizePayload, mediaFiles])

  const addMediaFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter(isReadingMediaFile)
    const totalSize = list.reduce((s, f) => s + f.size, mediaFiles.reduce((s, f) => s + f.size, 0))
    if (totalSize > READING_IMPORT_MAX_MEDIA_BYTES) {
      setError(`Ảnh quá lớn (tối đa ${formatBytes(READING_IMPORT_MAX_MEDIA_BYTES)}).`)
      return
    }
    setMediaFiles(prev => {
      const map = new Map(prev.map(f => [f.name.toLowerCase(), f]))
      for (const f of list) map.set(f.name.toLowerCase(), f)
      return Array.from(map.values())
    })
    setError(null)
    if (payload && hasRwImageMerge) {
      const all = Array.from(new Map(
        [...mediaFiles, ...list].map(f => [f.name.toLowerCase(), f]),
      ).values())
      finalizePayload(payload, all, sourceLabel ?? jsonFile?.name ?? 'import', jsonFile)
    }
  }, [finalizePayload, hasRwImageMerge, jsonFile, mediaFiles, payload, sourceLabel])

  const addWritingImageFiles = useCallback((files: FileList | File[]) => {
    const list = Array.from(files).filter(f => (
      isKetWritingImageFile(f) || isPetWritingImageFile(f) || isFceWritingImageFile(f) || isCaeWritingImageFile(f) || isCpeWritingImageFile(f)
    ))
    if (!list.length) {
      setError(isFceB2
        ? 'Chọn JPG/PNG: part8-page.jpg + part9-page.jpg'
        : isCaeC1
          ? 'Chọn JPG/PNG: part9-page.jpg + part10-page.jpg'
          : isCpeC2
            ? 'Chọn JPG/PNG: part8-page.jpg + part9-page.jpg'
            : isPetB1
              ? 'Chọn JPG/PNG: part7-page.jpg, part8-page.jpg; tuỳ chọn part2-page.jpg, part4-page.jpg'
              : 'Chọn file JPG/PNG: part6-page.jpg và/hoặc part7-page.jpg')
      return
    }
    const totalSize = list.reduce((s, f) => s + f.size, mediaFiles.reduce((s, f) => s + f.size, 0))
    if (totalSize > READING_IMPORT_MAX_MEDIA_BYTES) {
      setError(`Ảnh quá lớn (tối đa ${formatBytes(READING_IMPORT_MAX_MEDIA_BYTES)}).`)
      return
    }
    const merged = new Map(mediaFiles.map(f => [f.name.toLowerCase(), f]))
    for (const f of list) merged.set(f.name.toLowerCase(), f)
    const all = Array.from(merged.values())
    setMediaFiles(all)
    setError(null)
    if (payload) {
      finalizePayload(payload, all, sourceLabel ?? jsonFile?.name ?? 'import', jsonFile)
    }
  }, [finalizePayload, isCaeC1, isCpeC2, isFceB2, isPetB1, jsonFile, mediaFiles, payload, sourceLabel])

  const processZip = useCallback(async (file: File) => {
    setError(null)
    try {
      const bundle = await extractReadingZip(file)
      finalizePayload(
        bundle.payload,
        bundle.mediaFiles,
        bundle.zipName,
        bundle.jsonFile,
        bundle.answerKeyNotes,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không giải nén được ZIP.')
    }
  }, [finalizePayload])

  async function handleSave() {
    if (!payload) return
    setSaving(true)
    setStep('saving')
    setError(null)
    try {
      const exam = await buildReadingExamFromImport(payload, mediaFiles, undefined, {
        mediaStorage: isIeltsTrack && isAdmin === true ? 'cloud' : 'local',
      })
      if (!exam.examTrack && examTrack) exam.examTrack = examTrack
      if (!exam.cambridgeLevel && cambridgeLevel) exam.cambridgeLevel = cambridgeLevel
      await examRepo.create(examRecordFromReading(exam, 'manual', sourceLabel ?? jsonFile?.name))
      if (isIeltsTrack && isAdmin === true) {
        await publishReadingExamToCloud(exam, {
          source: 'manual',
          sourceFilename: sourceLabel ?? jsonFile?.name,
        })
      }
      onCreated?.(exam.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu đề thất bại.')
      setStep('preview')
    } finally {
      setSaving(false)
    }
  }

  function downloadTemplate() {
    const json = JSON.stringify(readingImportTemplate(examTrack, cambridgeLevel), null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reading-manual-${examTrack}${cambridgeLevel ? `-${cambridgeLevel}` : ''}-template.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const qCount = payload ? countReadingImportQuestions(payload) : 0
  const imageCount = mediaFiles.length
  const ketPart6Image = isKetA2 ? findKetPart6ImageFile(mediaFiles) : null
  const ketPart7Image = isKetA2 ? findKetPart7ImageFile(mediaFiles) : null
  const petPart7Image = isPetB1 ? findPetPart7ImageFile(mediaFiles) : null
  const petPart8Image = isPetB1 ? findPetPart8ImageFile(mediaFiles) : null
  const fcePart8Image = isFceB2 ? findFcePart8ImageFile(mediaFiles) : null
  const fcePart9Image = isFceB2 ? findFcePart9ImageFile(mediaFiles) : null
  const caePart9Image = isCaeC1 ? findCaePart9ImageFile(mediaFiles) : null
  const caePart10Image = isCaeC1 ? findCaePart10ImageFile(mediaFiles) : null
  const cpePart8Image = isCpeC2 ? findCpePart8ImageFile(mediaFiles) : null
  const cpePart9Image = isCpeC2 ? findCpePart9ImageFile(mediaFiles) : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'color-mix(in srgb, var(--bg-primary) 45%, transparent)' }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Import thủ công Reading
            </h2>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:opacity-80">
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 'upload' && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl border p-4 text-sm space-y-2"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              >
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cách import Reading</p>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
                  <li>Bấm <strong>Tải JSON mẫu</strong> → mở bằng Notepad/VS Code.</li>
                  <li><strong>Part 1 (A2/B1 signs):</strong> có thể dùng ảnh <code>part1-page.jpg</code>.</li>
                  <li><strong>Part còn lại (A2–C2):</strong> copy text từ PDF vào <code>passage[].text</code> — cần text để <strong>Highlight</strong>.</li>
                  <li>Điền câu hỏi + đáp án vào <code>questionGroups</code>.</li>
                  <li>Upload JSON (+ ảnh) hoặc ZIP → Preview → <strong>Lưu & làm bài</strong>.</li>
                  <li>ZIP có thể kèm <code>answer-key.pdf</code> hoặc <code>answer-key.txt</code> (bổ sung đáp án trống).</li>
                  {isKetA2 && (
                    <li>
                      <strong>KET Part 6–7:</strong> upload ảnh JPG —{' '}
                      <code>part6-page.jpg</code> (đề email) + <code>part7-page.jpg</code> (1 ảnh truyện / 3 khung).
                      App tự ghép vào đề 5-part.
                    </li>
                  )}
                  {isPetB1 && (
                    <li>
                      <strong>PET Part 2/4/7–8:</strong> tuỳ chọn <code>part2-page.jpg</code>,{' '}
                      <code>part2-q6…q10.jpg</code>, <code>part4-page.jpg</code>,{' '}
                      <code>part7-page.jpg</code>, <code>part8-page.jpg</code> (1 ảnh).
                    </li>
                  )}
                  {isFceB2 && (
                    <li>
                      <strong>FCE Part 8–9:</strong> <code>part8-page.jpg</code> (đề essay) +{' '}
                      <code>part9-page.jpg</code> (1 ảnh story — 3 khung trong 1 file).
                    </li>
                  )}
                  {isCaeC1 && (
                    <li>
                      <strong>CAE Part 9–10:</strong> <code>part9-page.jpg</code> (Q57) +{' '}
                      <code>part10-page.jpg</code> (Q58).
                    </li>
                  )}
                  {isCpeC2 && (
                    <li>
                      <strong>CPE Part 8–9:</strong> <code>part8-page.jpg</code> (Q1 essay) +{' '}
                      <code>part9-page.jpg</code> (Q2–4 choice).
                    </li>
                  )}
                </ol>
                <p className="text-xs pt-1">
                  {cambridgeImportGuideNote(cambridgeLevel)}
                  {' '}Chỉ ảnh không Highlight được.
                </p>
                {cambridgeLevel && (
                  <ul className="text-xs space-y-1 pt-2 list-disc list-inside leading-relaxed">
                    {cambridgeImportGuideLines(cambridgeLevel).map(line => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 text-xs font-semibold"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              >
                <Download size={14} />
                Tải JSON mẫu
              </button>

              <div
                className="rounded-xl border border-dashed p-6 text-center cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                onClick={() => zipInputRef.current?.click()}
              >
                <Archive size={28} className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Chọn file ZIP bundle
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  exam.json + ảnh + tuỳ chọn answer-key.pdf / answer-key.txt
                </p>
                <input
                  ref={zipInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) void processZip(f)
                  }}
                />
              </div>

              <div
                className="rounded-xl border border-dashed p-6 text-center cursor-pointer"
                style={{ borderColor: 'var(--border-color)' }}
                onClick={() => jsonInputRef.current?.click()}
              >
                <FileJson size={28} className="mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Chọn file JSON đề Reading
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {jsonFile ? jsonFile.name : 'reading-manual.json'}
                </p>
                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f && isReadingJsonFile(f)) void processJson(f)
                  }}
                />
              </div>

              {canImportIeltsImages && (
                <div
                  className="rounded-xl border border-dashed p-5 text-center cursor-pointer"
                  style={{ borderColor: 'var(--border-color)' }}
                  onClick={() => mediaInputRef.current?.click()}
                >
                  <Upload size={22} className="mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {isIeltsTrack ? 'Thêm ảnh (Admin · lưu cloud)' : 'Thêm ảnh đoạn văn (tuỳ chọn)'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {mediaFiles.length > 0
                      ? `${mediaFiles.length} ảnh · ${formatBytes(mediaFiles.reduce((s, f) => s + f.size, 0))}`
                      : 'part1-q1.jpg, part1-page.jpg…'}
                  </p>
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif,image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      if (e.target.files) addMediaFiles(e.target.files)
                    }}
                  />
                </div>
              )}

              {hasRwImageMerge && (
                <div
                  className="rounded-xl border border-dashed p-5 text-center cursor-pointer"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-primary) 35%, var(--border-color))',
                    background: 'color-mix(in srgb, var(--color-primary) 6%, transparent)',
                  }}
                  onClick={() => writingImageInputRef.current?.click()}
                >
                  <ImageIcon size={22} className="mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {isFceB2
                      ? 'Part 8–9 bằng ảnh JPG'
                      : isCaeC1
                        ? 'Part 9–10 bằng ảnh JPG'
                        : isCpeC2
                          ? 'Part 8–9 bằng ảnh JPG'
                          : isPetB1
                            ? 'Part 2/4/7–8 bằng ảnh JPG'
                            : 'Part 6–7 bằng ảnh JPG'}
                  </p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {isFceB2
                      ? (fcePart8Image || fcePart9Image
                        ? [
                          fcePart8Image ? `P8: ${fcePart8Image.name}` : 'P8: chưa có',
                          fcePart9Image ? `P9: ${fcePart9Image.name}` : 'P9: chưa có',
                        ].join(' · ')
                        : FCE_WRITING_IMAGE_HINT)
                      : isCaeC1
                        ? (caePart9Image || caePart10Image
                          ? [
                            caePart9Image ? `P9: ${caePart9Image.name}` : 'P9: chưa có',
                            caePart10Image ? `P10: ${caePart10Image.name}` : 'P10: chưa có',
                          ].join(' · ')
                          : CAE_WRITING_IMAGE_HINT)
                        : isCpeC2
                          ? (cpePart8Image || cpePart9Image
                            ? [
                              cpePart8Image ? `P8: ${cpePart8Image.name}` : 'P8: chưa có',
                              cpePart9Image ? `P9: ${cpePart9Image.name}` : 'P9: chưa có',
                            ].join(' · ')
                            : CPE_WRITING_IMAGE_HINT)
                          : isPetB1
                          ? (petPart7Image || petPart8Image
                            ? [
                              petPart7Image?.name,
                              petPart8Image?.name,
                            ].filter(Boolean).join(', ')
                            : PET_WRITING_IMAGE_HINT)
                          : (ketPart6Image || ketPart7Image
                            ? [
                              ketPart6Image ? `P6: ${ketPart6Image.name}` : 'P6: chưa có',
                              ketPart7Image ? `P7: ${ketPart7Image.name}` : 'P7: chưa có',
                            ].join(' · ')
                            : KET_WRITING_IMAGE_HINT)}
                  </p>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                    {isFceB2
                      ? 'Chọn sau JSON/ZIP — app ghép Part 8–9 (7-part JSON + ảnh Writing).'
                      : isCaeC1
                        ? 'Chọn sau JSON/ZIP — app ghép Part 9–10 (8-part JSON + ảnh Writing).'
                        : isCpeC2
                          ? 'Chọn sau JSON/ZIP — app ghép Part 8–9 (7-part JSON + ảnh Writing).'
                          : isPetB1
                            ? 'Chọn sau JSON/ZIP — app ghép Part 7–8 và ảnh Part 2/4 tuỳ chọn.'
                            : 'Chọn sau JSON/ZIP hoặc gộp trong cùng ZIP — app tự thêm Part 6–7.'}
                  </p>
                  <input
                    ref={writingImageInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      if (e.target.files) addWritingImageFiles(e.target.files)
                    }}
                  />
                </div>
              )}

              {hasPetPart2 && (
                <PetPart2PhotoImportSlots
                  mediaFiles={mediaFiles}
                  onAssignPhoto={assignPart2PersonPhoto}
                />
              )}

              {error && (
                <p className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-accent)' }}>
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {error}
                </p>
              )}
            </div>
          )}

          {step === 'preview' && payload && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>{payload.title}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {payload.examTrack?.toUpperCase() ?? examTrack.toUpperCase()}
                  {payload.cambridgeLevel ? ` · ${payload.cambridgeLevel.toUpperCase()}` : ''}
                  {' · '}{qCount} câu · {payload.durationMinutes} phút · {imageCount} ảnh
                </p>
              </div>

              {hasPetPart2 && (
                <PetPart2PhotoImportSlots
                  mediaFiles={mediaFiles}
                  onAssignPhoto={assignPart2PersonPhoto}
                />
              )}

              {writingMergeNotes.length > 0 && (
                <div
                  className="rounded-xl border p-3 text-xs space-y-1"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-primary) 30%, var(--border-color))',
                    color: 'var(--text-muted)',
                  }}
                >
                  {writingMergeNotes.map(n => (
                    <p key={n} style={{ color: 'var(--color-primary)' }}>✓ {n}</p>
                  ))}
                </div>
              )}

              {warnings.length > 0 && (
                <div
                  className="rounded-xl border p-3 text-xs space-y-1"
                  style={{
                    borderColor: 'color-mix(in srgb, var(--color-accent) 35%, var(--border-color))',
                    color: 'var(--text-muted)',
                  }}
                >
                  {warnings.map(w => (
                    <p key={w}>• {w}</p>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {payload.parts.map(part => {
                  const passageBlocks = part.passage?.length ?? 0
                  const partQuestions = part.questionGroups.reduce((s, g) => s + g.questions.length, 0)
                  const imageRefs = (part.passage ?? []).filter(b => b.imageFile).length
                  const isWritingPart = part.partNumber >= 6
                  return (
                    <div
                      key={part.partNumber}
                      className="rounded-lg border px-3 py-2 text-sm"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Part {part.partNumber}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {' '}— {part.passageTitle} · {partQuestions} câu
                        {isWritingPart && imageRefs > 0 ? ' · import ảnh' : ` · ${passageBlocks} khối`}
                        {imageRefs > 0 ? ` · ${imageRefs} ảnh` : ''}
                      </span>
                    </div>
                  )
                })}
              </div>

              {error && (
                <p className="text-sm" style={{ color: 'var(--color-accent)' }}>{error}</p>
              )}
            </div>
          )}

          {step === 'saving' && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Đang lưu đề và ảnh…</p>
            </div>
          )}
        </div>

        <div
          className="flex items-center justify-end gap-2 border-t px-5 py-3"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {step === 'preview' && (
            <button
              type="button"
              className="rounded-lg border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              onClick={() => setStep('upload')}
            >
              Quay lại
            </button>
          )}
          {step === 'preview' && (
            <button
              type="button"
              disabled={saving || qCount === 0}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
              onClick={() => void handleSave()}
            >
              <Check size={16} />
              Lưu & làm bài
            </button>
          )}
        </div>
      </div>
    </div>
  )
}