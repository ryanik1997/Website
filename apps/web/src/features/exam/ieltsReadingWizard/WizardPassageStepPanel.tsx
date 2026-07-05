import { Loader2 } from 'lucide-react'
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
}: Props) {
  const options = templateOptionsForPassage(passageNumber)
  const selected = options.find(o => o.kind === templateKind)
  const rangeLabel = rangeLabelForPassage(passageNumber)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Passage {passageNumber} ({rangeLabel}): chọn dạng câu hỏi, dán text đề + đoạn văn, bấm{' '}
        <strong>Tạo JSON</strong>.
      </p>

      <div className="ielts-wizard-template-grid ielts-wizard-template-grid--dense">
        {options.map(option => (
          <div
            key={option.kind}
            role="button"
            tabIndex={0}
            className={`ielts-wizard-template-card ielts-wizard-template-card--text${templateKind === option.kind ? ' is-selected' : ''}`}
            onClick={() => onTemplateChange(option.kind)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onTemplateChange(option.kind)
              }
            }}
          >
            <span className="ielts-wizard-template-card__code-badge">{option.code}</span>
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
          onChange={e => onExamTextChange(e.target.value)}
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