import { ArrowLeft, BookOpen, Headphones, PenLine } from 'lucide-react'

export type ExamSkillPick = 'listening' | 'reading' | 'writing'

interface Props {
  /** IELTS Academic / KET A2 / … */
  brandTitle: string
  /** Quay về: Luyện thi hoặc Cambridge levels */
  backLabel: string
  onBack: () => void
  listeningCount: number
  readingCount: number
  writingCount?: number
  onPick: (skill: ExamSkillPick) => void
  /** Ẩn skill không có trong level (hiếm) */
  skills?: ExamSkillPick[]
  /** Cambridge RW paper: "Reading - Writing"; IELTS mặc định "Reading" */
  readingTitle?: string
  ieltsCardStyle?: boolean
}

function formatCount(n: number): string {
  if (n <= 0) return 'Sắp có đề'
  if (n >= 100) return '100+ đề'
  return `${n} đề`
}

/** Giao diện Page1 — hai thẻ Listening / Reading. */
export default function ExamSkillPicker({
  brandTitle,
  backLabel,
  onBack,
  listeningCount,
  readingCount,
  writingCount = 0,
  onPick,
  skills = ['listening', 'reading'],
  readingTitle = 'Reading',
  ieltsCardStyle = false,
}: Props) {
  const showListening = skills.includes('listening')
  const showReading = skills.includes('reading')
  const showWriting = skills.includes('writing')

  return (
    <div className={`exam-skill-picker${ieltsCardStyle ? ' exam-skill-picker--ielts' : ''}`}>
      <div className="exam-skill-picker__inner">
        <button type="button" className="exam-hub-back exam-skill-picker__back" onClick={onBack}>
          <ArrowLeft size={14} />
          {backLabel}
        </button>

        <header className="exam-skill-picker__header">
          <p className="exam-skill-picker__kicker">Luyện thi</p>
          <h1 className="exam-skill-picker__title">{brandTitle}</h1>
          <p className="exam-skill-picker__desc">
            Chọn kỹ năng để mở thư viện đề — Library Archives.
          </p>
        </header>

        <div className={`exam-skill-picker__grid${showWriting ? ' exam-skill-picker__grid--three' : ''}`}>
          {showListening && (
            <button
              type="button"
              className="exam-skill-card exam-skill-card--listening"
              onClick={() => onPick('listening')}
            >
              <div className="exam-skill-card__icons" aria-hidden>
                <span className="exam-skill-card__chip">
                  <Headphones size={18} strokeWidth={2.2} />
                </span>
                <span className="exam-skill-card__decor exam-skill-card__decor--notes">♪</span>
              </div>
              <h2 className="exam-skill-card__title">Listening</h2>
              <p className="exam-skill-card__desc">
                Luyện nghe mỗi ngày với 100+ đoạn hội thoại thực tế, hiểu tự nhiên như người bản xứ.
              </p>
              <div className="exam-skill-card__mascot exam-skill-card__mascot--listening" aria-hidden>
                <svg viewBox="0 0 200 160" className="exam-skill-card__svg">
                  <ellipse cx="100" cy="88" rx="72" ry="58" fill="currentColor" opacity="0.95" />
                  <circle cx="72" cy="82" r="14" fill="#1a1a2e" />
                  <circle cx="128" cy="82" r="14" fill="#1a1a2e" />
                  <circle cx="76" cy="78" r="5" fill="#fff" />
                  <circle cx="132" cy="78" r="5" fill="#fff" />
                  <path d="M78 108 Q100 122 122 108" fill="none" stroke="#1a1a2e" strokeWidth="4" strokeLinecap="round" />
                  <path d="M28 70 Q8 40 32 28" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" opacity="0.9" />
                  <path d="M172 70 Q192 40 168 28" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" opacity="0.9" />
                  <circle cx="32" cy="28" r="10" fill="currentColor" />
                  <circle cx="168" cy="28" r="10" fill="currentColor" />
                </svg>
              </div>
              <span className="exam-skill-card__badge">{formatCount(listeningCount)}</span>
            </button>
          )}

          {showReading && (
            <button
              type="button"
              className="exam-skill-card exam-skill-card--reading"
              onClick={() => onPick('reading')}
            >
              <div className="exam-skill-card__icons" aria-hidden>
                <span className="exam-skill-card__chip">
                  <BookOpen size={18} strokeWidth={2.2} />
                </span>
                <span className="exam-skill-card__decor exam-skill-card__decor--sun">✦</span>
              </div>
              <h2 className="exam-skill-card__title">{readingTitle}</h2>
              <p className="exam-skill-card__desc">
                Đọc hiểu đa dạng chủ đề với 100+ bài đọc chọn lọc, nâng cao vốn từ và tư duy.
              </p>
              <div className="exam-skill-card__mascot exam-skill-card__mascot--reading" aria-hidden>
                <svg viewBox="0 0 200 160" className="exam-skill-card__svg">
                  <ellipse cx="100" cy="95" rx="70" ry="52" fill="currentColor" opacity="0.95" />
                  <circle cx="74" cy="88" r="13" fill="#1a2e1a" />
                  <circle cx="126" cy="88" r="13" fill="#1a2e1a" />
                  <circle cx="78" cy="84" r="4.5" fill="#fff" />
                  <circle cx="130" cy="84" r="4.5" fill="#fff" />
                  <path d="M80 112 Q100 124 120 112" fill="none" stroke="#1a2e1a" strokeWidth="3.5" strokeLinecap="round" />
                  <rect x="55" y="48" width="90" height="28" rx="6" fill="#e8f5e9" opacity="0.95" />
                  <line x1="68" y1="58" x2="132" y2="58" stroke="#2e7d32" strokeWidth="2" opacity="0.5" />
                  <line x1="68" y1="66" x2="120" y2="66" stroke="#2e7d32" strokeWidth="2" opacity="0.4" />
                  <path d="M150 40 Q175 20 185 45 Q170 55 150 48 Z" fill="#81c784" />
                </svg>
              </div>
              <span className="exam-skill-card__badge">{formatCount(readingCount)}</span>
            </button>
          )}

          {showWriting && (
            <button
              type="button"
              className="exam-skill-card exam-skill-card--writing"
              onClick={() => onPick('writing')}
            >
              <div className="exam-skill-card__icons" aria-hidden>
                <span className="exam-skill-card__chip">
                  <PenLine size={18} strokeWidth={2.2} />
                </span>
                <span className="exam-skill-card__decor exam-skill-card__decor--spark">+</span>
              </div>
              <h2 className="exam-skill-card__title">Writing</h2>
              <p className="exam-skill-card__desc">
                Luyá»‡n viáº¿t theo Ä‘Ãºng cáº¥u trÃºc Ä‘á» Cambridge vá»›i Ä‘á» máº«u tháº­t vÃ  workspace cháº¥m AI hiá»‡n cÃ³.
              </p>
              <div className="exam-skill-card__mascot exam-skill-card__mascot--writing" aria-hidden>
                <svg viewBox="0 0 200 160" className="exam-skill-card__svg">
                  <rect x="52" y="28" width="96" height="110" rx="18" fill="currentColor" opacity="0.95" />
                  <rect x="68" y="54" width="62" height="8" rx="4" fill="#25163a" opacity="0.9" />
                  <rect x="68" y="74" width="54" height="8" rx="4" fill="#25163a" opacity="0.72" />
                  <rect x="68" y="94" width="46" height="8" rx="4" fill="#25163a" opacity="0.56" />
                  <path d="M132 108 160 80l12 12-28 28-18 6z" fill="#f8fafc" />
                  <path d="M160 80l8-8c4-4 10-4 14 0l2 2c4 4 4 10 0 14l-8 8z" fill="#f59e0b" />
                </svg>
              </div>
              <span className="exam-skill-card__badge">{formatCount(writingCount)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
