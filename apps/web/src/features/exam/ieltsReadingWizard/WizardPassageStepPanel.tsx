import { useEffect, useState } from 'react'
import { Loader2, ZoomIn } from 'lucide-react'
import { resolvePlayableMediaUrl } from '../../../lib/protectedMedia'
import type { IeltsReadingPassageNumber, IeltsReadingWizardTemplateKind } from './ieltsReadingWizardConfig'
import { rangeLabelForPassage } from './ieltsReadingWizardConfig'
import { templateOptionsForPassage } from './ieltsReadingTemplateCatalog'

interface Props {
  passageNumber: IeltsReadingPassageNumber
  templateKind: IeltsReadingWizardTemplateKind
  examText: string
  generating: boolean
  providerName: string
  error: string | null
  onTemplateChange: (kind: IeltsReadingWizardTemplateKind) => void
  onExamTextChange: (text: string) => void
  onOpenLightbox: (src: string, label: string) => void
}

function ProtectedTemplatePreview({
  src,
  label,
  onOpen,
}: {
  src: string
  label: string
  onOpen: (src: string) => void
}) {
  const [resolvedSrc, setResolvedSrc] = useState<string>()

  useEffect(() => {
    let cancelled = false
    setResolvedSrc(undefined)
    void resolvePlayableMediaUrl(src)
      .then(url => {
        if (!cancelled) setResolvedSrc(url)
      })
      .catch(() => {
        if (!cancelled) setResolvedSrc(undefined)
      })
    return () => { cancelled = true }
  }, [src])

  return (
    <>
      {resolvedSrc ? (
        <img src={resolvedSrc} alt={label} loading="lazy" />
      ) : (
        <span className="flex h-full items-center justify-center" aria-label={`Đang tải ${label}`}>
          <Loader2 size={18} className="animate-spin" />
        </span>
      )}
      <button
        type="button"
        className="ielts-wizard-template-card__expand"
        title="Xem ảnh lớn"
        aria-label={`Xem ảnh lớn ${label}`}
        disabled={!resolvedSrc}
        onClick={event => {
          event.stopPropagation()
          if (resolvedSrc) onOpen(resolvedSrc)
        }}
      >
        <ZoomIn size={14} />
      </button>
    </>
  )
}

export default function WizardPassageStepPanel({
  passageNumber,
  templateKind,
  examText,
  generating,
  providerName,
  error,
  onTemplateChange,
  onExamTextChange,
  onOpenLightbox,
}: Props) {
  const options = templateOptionsForPassage(passageNumber)
  const selected = options.find(option => option.kind === templateKind)
  const rangeLabel = rangeLabelForPassage(passageNumber)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Passage {passageNumber} ({rangeLabel}): chọn dạng theo hình, dán text đề + đoạn văn, bấm{' '}
        <strong>Tạo JSON</strong>.
      </p>

      <div className="ielts-wizard-template-grid ielts-wizard-template-grid--dense">
        {options.map(option => (
          <div
            key={option.kind}
            role="button"
            tabIndex={0}
            className={`ielts-wizard-template-card${templateKind === option.kind ? ' is-selected' : ''}`}
            onClick={() => onTemplateChange(option.kind)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onTemplateChange(option.kind)
              }
            }}
          >
            <div className="ielts-wizard-template-card__thumb">
              <ProtectedTemplatePreview
                src={option.previewUrl}
                label={option.label}
                onOpen={src => onOpenLightbox(src, `${option.code} — ${option.label}`)}
              />
            </div>
            <span className="ielts-wizard-template-card__code">{option.code}</span>
            <span className="ielts-wizard-template-card__label">{option.label}</span>
          </div>
        ))}
      </div>

      {selected && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {selected.description}
        </p>
      )}

      <div className="ielts-wizard-field">
        <label htmlFor={`wizard-exam-text-p${passageNumber}`}>
          Text đề Passage {passageNumber}
        </label>
        <textarea
          id={`wizard-exam-text-p${passageNumber}`}
          className="ielts-wizard-textarea"
          style={{ minHeight: '16rem' }}
          value={examText}
          onChange={event => onExamTextChange(event.target.value)}
          placeholder={`READING PASSAGE ${passageNumber}\n…\n${rangeLabel}\nPaste passage + questions từ Word/PDF`}
        />
      </div>

      {generating && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={16} className="animate-spin" />
          Đang gọi {providerName}… Passage {passageNumber} (15–90 giây)
        </div>
      )}

      {error && (
        <p className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-accent)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
