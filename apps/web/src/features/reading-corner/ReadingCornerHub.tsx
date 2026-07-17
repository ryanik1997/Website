import { Link } from 'react-router-dom'
import ReadingRibbonBackdrop from './ReadingRibbonBackdrop'
import './readingCorner.css'

/** Inline SVG art — Bauhaus stack (báo) */
function ArtBao() {
  return (
    <svg className="rc-art" viewBox="0 0 280 280" fill="none" aria-hidden="true">
      <rect x="168" y="18" width="88" height="52" rx="26" fill="#C43B3B" />
      <rect x="188" y="78" width="72" height="40" rx="20" fill="#1F4D36" />
      <circle cx="248" cy="68" r="3.5" fill="#1F4D36" />
      <circle cx="260" cy="68" r="3.5" fill="#1F4D36" />
      <circle cx="254" cy="80" r="3.5" fill="#1F4D36" />
      <path d="M48 78c0-22 18-40 40-40h52c22 0 40 18 40 40v8H48v-8z" fill="#E8B84A" />
      <circle cx="92" cy="148" r="58" fill="#E8D5B5" />
      <path d="M34 148a58 58 0 0 1 116 0H34z" fill="#E8B84A" />
      <circle cx="92" cy="148" r="28" fill="#1F4D36" />
      <path d="M140 198h100a8 8 0 0 1 8 8v46a8 8 0 0 1-8 8H140V198z" fill="#C43B3B" />
      <path d="M34 210h96v58H34a28 28 0 0 1-28-28v-2a28 28 0 0 1 28-28z" fill="#1F4D36" />
      <g fill="#1F4D36" opacity="0.85">
        {Array.from({ length: 4 }).map((_, row) =>
          Array.from({ length: 4 }).map((__, col) => (
            <circle key={`${row}-${col}`} cx={28 + col * 12} cy={248 + row * 8} r="2.2" />
          )),
        )}
      </g>
    </svg>
  )
}

/** Concentric rings (sách) */
function ArtSach() {
  return (
    <svg className="rc-art rc-art--rings" viewBox="0 0 280 280" fill="none" aria-hidden="true">
      {[
        { cx: 210, cy: 48, r: 42 },
        { cx: 248, cy: 140, r: 56 },
        { cx: 188, cy: 230, r: 48 },
        { cx: 92, cy: 200, r: 36 },
      ].map((ring, i) => (
        <g key={i} opacity={0.55 + i * 0.08}>
          <circle cx={ring.cx} cy={ring.cy} r={ring.r} stroke="#2F6B4F" strokeWidth="10" fill="none" strokeDasharray="6 10" />
          <circle cx={ring.cx} cy={ring.cy} r={ring.r * 0.62} stroke="#2F6B4F" strokeWidth="7" fill="none" strokeDasharray="4 8" />
          <circle cx={ring.cx} cy={ring.cy} r={ring.r * 0.28} stroke="#2F6B4F" strokeWidth="5" fill="none" />
        </g>
      ))}
    </svg>
  )
}

const CARDS = [
  {
    to: '/app/reading-corner/bao',
    variant: 'bao' as const,
    desc: 'Bên cạnh việc đọc test cambridge chán ơi là chánnn, các bạn có thể đọc các bài báo siêu thú vị từ các đầu báo xịn xò trong này nha.',
    cta: 'Explore ngay',
  },
  {
    to: '/app/reading-corner/sach',
    variant: 'sach' as const,
    desc: 'Những cuốn sách nổi tiếng được trình bày song ngữ để các bạn vừa đọc hiểu, vừa nhặt vocab siêu tự nhiên.',
    cta: 'Explore',
  },
] as const

export default function ReadingCornerHub() {
  return (
    <div className="rc-hub rc-hub--ribbon">
      <ReadingRibbonBackdrop />
      <div className="rc-hub-ambient" aria-hidden="true" />

      <Link to="/app/home" className="rc-hub-back">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        Quay lại
      </Link>

      <header className="rc-hub-header">
        <span className="rc-eyebrow">Reading corner</span>
        <h1 className="rc-hub-title">
          Góc đọc
          <em> song ngữ</em>
        </h1>
        <p className="rc-sub">
          Hai lối vào — báo chí & sách — thiết kế theo portal TID, polish agency-level.
        </p>
      </header>

      <div className="rc-bento">
        {CARDS.map((card, index) => (
          <div
            key={card.to}
            className={`rc-shell rc-shell--${card.variant}`}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <Link to={card.to} className={`rc-tile rc-tile--${card.variant} group`}>
              <div className="rc-tile-copy">
                {card.variant === 'bao' ? (
                  <h2 className="rc-headline rc-headline--bao">
                    <span className="rc-line">
                      <span className="rc-word-dark">Đọc</span>
                      <span className="rc-pill rc-pill--coral">báo</span>
                    </span>
                    <span className="rc-line rc-line--offset">
                      <span className="rc-word-script">song</span>
                      <span className="rc-pill rc-pill--forest">ngữ</span>
                    </span>
                  </h2>
                ) : (
                  <h2 className="rc-headline rc-headline--sach">
                    <span className="rc-line">
                      <span className="rc-word-serif">ĐỌC</span>
                      <span className="rc-word-script rc-word-script--green">sách</span>
                      <span className="rc-spark" aria-hidden="true" />
                    </span>
                    <span className="rc-line">
                      <span className="rc-pill rc-pill--forest rc-pill--wide">song ngữ</span>
                    </span>
                  </h2>
                )}

                <p className="rc-desc">{card.desc}</p>

                <span className="rc-cta">
                  <span className="rc-cta-icon" aria-hidden="true">
                    {/* Speech bubble — match gocdoc.jpg (not a second arrow) */}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v5a3.5 3.5 0 0 1-3.5 3.5H11l-3.2 2.8c-.55.48-1.3.08-1.3-.65V15A3.5 3.5 0 0 1 5 11.5v-5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="rc-cta-label">
                    {card.cta}
                    <span className="rc-cta-arrow" aria-hidden="true">
                      {' '}
                      →
                    </span>
                  </span>
                </span>
              </div>

              <div className="rc-tile-art" aria-hidden="true">
                {card.variant === 'bao' ? <ArtBao /> : <ArtSach />}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
