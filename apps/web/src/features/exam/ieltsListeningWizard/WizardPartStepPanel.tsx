import { Loader2, Wand2, ZoomIn } from 'lucide-react'
import type { IeltsListeningWizardTemplateKind, IeltsWizardPartNumber } from './ieltsListeningWizardConfig'
import { templateOptionsForPart } from './ieltsListeningTemplateCatalog'

interface Props {
  partNumber: IeltsWizardPartNumber
  templateKind: IeltsListeningWizardTemplateKind
  examText: string
  generating: boolean
  providerName: string
  error: string | null
  onTemplateChange: (kind: IeltsListeningWizardTemplateKind) => void
  onExamTextChange: (text: string) => void
  onNormalizeExamText: () => void
  onOpenLightbox: (src: string, label: string) => void
}

export default function WizardPartStepPanel({
  partNumber,
  templateKind,
  examText,
  generating,
  providerName,
  error,
  onTemplateChange,
  onExamTextChange,
  onNormalizeExamText,
  onOpenLightbox,
}: Props) {
  const options = templateOptionsForPart(partNumber)
  const selected = options.find(o => o.kind === templateKind)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Part {partNumber}: chon dang theo hinh, dan text de, bam <strong>Tao JSON</strong>.
      </p>

      <div className={`ielts-wizard-template-grid${partNumber > 1 ? ' ielts-wizard-template-grid--dense' : ''}`}>
        {options.map(option => (
          <div
            key={option.kind}
            role="button"
            tabIndex={0}
            className={`ielts-wizard-template-card${templateKind === option.kind ? ' is-selected' : ''}`}
            onClick={() => onTemplateChange(option.kind)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onTemplateChange(option.kind)
              }
            }}
          >
            <div className="ielts-wizard-template-card__thumb">
              <img src={option.previewUrl} alt={option.label} loading="lazy" />
              <button
                type="button"
                className="ielts-wizard-template-card__expand"
                title="Xem anh lon"
                aria-label={`Xem anh lon ${option.label}`}
                onClick={e => {
                  e.stopPropagation()
                  onOpenLightbox(option.previewUrl, `${option.code} - ${option.label}`)
                }}
              >
                <ZoomIn size={14} />
              </button>
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
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={`wizard-exam-text-p${partNumber}`}>
            Text de Part {partNumber}
          </label>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold"
            style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            onClick={onNormalizeExamText}
            disabled={!examText.trim()}
          >
            <Wand2 size={13} />
            Don dong OCR
          </button>
        </div>
        <textarea
          id={`wizard-exam-text-p${partNumber}`}
          className="ielts-wizard-textarea"
          style={{ minHeight: '14rem' }}
          value={examText}
          onChange={e => onExamTextChange(e.target.value)}
          placeholder={`Questions ...\nImport DOCX o buoc Thong tin, hoac paste Part ${partNumber} tu Word/HTML`}
        />
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          Noi cac dong bi gay vo ly va giam dong trong lap lai tu OCR/PDF copy.
        </p>
      </div>

      {generating && (
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <Loader2 size={16} className="animate-spin" />
          Dang goi {providerName}... Part {partNumber} (15-60 giay)
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
