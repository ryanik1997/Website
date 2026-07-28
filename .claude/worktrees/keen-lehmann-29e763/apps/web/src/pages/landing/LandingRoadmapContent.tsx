import {
  Brain,
  CalendarDays,
  ChevronRight,
  Clock3,
  Mountain,
  Sprout,
  ThumbsUp,
  Trophy,
} from 'lucide-react'

const SERIF: React.CSSProperties = { fontFamily: "'Instrument Serif', serif" }

const TIMELINE_ROWS = [
  {
    current: '3.5 – 4.5',
    target: '5.0 – 6.0',
    hours: '~200 – 300 giờ',
    duration: '6 – 8 tháng',
    note: 'Cần nền tiếng Anh tổng quát trước.',
  },
  {
    current: '5.0 – 5.5',
    target: '6.0 (+0.5 – 1.0)',
    hours: '~100 – 120 giờ',
    duration: '1 – 2 tháng (5h/ngày)',
    note: 'Đây là mức dễ tăng nhất. Học IELTS strategies là đủ.',
  },
  {
    current: '5.5',
    target: '7.0 (+1.5)',
    hours: '~400 – 500 giờ',
    duration: '8 – 12 tháng (học đều, 1h+/ngày)',
    note: 'Phần lớn students ở nhóm này.',
  },
  {
    current: '6.0 – 6.5',
    target: '7.0 – 7.5',
    hours: '~150 – 200 giờ',
    duration: '2 – 4 tháng (3 – 4h/ngày)',
    note: 'Đã có nền tốt, focus vào exam skills + accuracy.',
  },
  {
    current: '7.0 – 7.5',
    target: '8.0+',
    hours: '300+ giờ',
    duration: '6 – 12 tháng+ (không có đảm bảo)',
    note: 'Ở mức này gains rất nhỏ, cần exposure thực sự.',
  },
] as const

const STAGES = [
  {
    id: 'foundation',
    band: '2.0 – 3.5',
    tone: 'pink' as const,
    Icon: Sprout,
    items: [
      'Nền tảng nhận biết ngôn ngữ',
      'Quản lý lo âu',
      'Ngữ âm (Phonics)',
      'Lộ trình từ vựng',
    ],
    cta: 'Bắt đầu từ đây',
  },
  {
    id: 'build',
    band: '3.5 – 4.5',
    tone: 'blue' as const,
    Icon: Brain,
    items: [
      'Bắt đầu tư duy tiếng Anh',
      'Duy trì động lực',
      'Phân tích lỗi sai',
      'Lặp lịch học',
    ],
    cta: 'Xây nền vững chắc',
  },
  {
    id: 'accelerate',
    band: '4.5 – 6.0',
    tone: 'green' as const,
    Icon: Mountain,
    items: [
      'Vượt qua điểm bình nguyên (Plateau)',
      'Thi thử (Mock Test)',
      'Đúng trọng tâm đề',
      'Quản lý thời gian',
    ],
    cta: 'Tăng tốc bứt phá',
  },
  {
    id: 'mastery',
    band: '6.0 – 7.0',
    tone: 'amber' as const,
    Icon: Trophy,
    items: [
      'Tư duy học thuật',
      'Góc nhìn giám khảo (Examiner Perspective)',
      'Defensive strategy',
    ],
    cta: 'Chạm mục tiêu 7.0+',
  },
] as const

const COL_HEADERS = [
  'Mức band hiện tại',
  'Mục tiêu band',
  'Thời gian ước tính (tổng giờ)',
  'Thời gian thực tế (tùy cá nhân)',
  'Ghi chú',
] as const

function TableArrow() {
  return (
    <div className="landing-roadmap__td-arrow" aria-hidden>
      ›
    </div>
  )
}

export default function LandingRoadmapContent() {
  return (
    <div className="landing-roadmap">
      {/* Hero + rules */}
      <header className="landing-roadmap__hero">
        <div className="landing-roadmap__hero-copy">
          <h3 className="landing-roadmap__title" style={SERIF}>
            Tóm gọn thời gian
            <br />
            để lên <em>band</em> IELTS
          </h3>
          <p className="landing-roadmap__subtitle">
            Ước lượng trung bình — tùy nền tảng & cách học mỗi người
          </p>
        </div>

        <aside className="landing-roadmap__rules" aria-label="Quy tắc ngón tay cái">
          <p className="landing-roadmap__rules-label">Quy tắc ngón tay cái</p>
          <ul className="landing-roadmap__rules-list">
            <li>
              <ThumbsUp size={15} strokeWidth={2.2} aria-hidden />
              <span>
                <strong>+0.5 band</strong>
                <span className="landing-roadmap__rules-eq">≈</span>
                3 tháng học đều
              </span>
            </li>
            <li>
              <ThumbsUp size={15} strokeWidth={2.2} aria-hidden />
              <span>
                <strong>+1.0 band</strong>
                <span className="landing-roadmap__rules-eq">≈</span>
                200 giờ tập trung
              </span>
            </li>
          </ul>
        </aside>
      </header>

      {/* Timeline table — header & rows cùng 1 grid 9 cột để align */}
      <section className="landing-roadmap__table-wrap" aria-label="Bảng ước lượng thời gian">
        <div className="landing-roadmap__table-scroll">
          <div className="landing-roadmap__table" role="table">
            <div className="landing-roadmap__trow landing-roadmap__trow--head" role="row">
              <div className="landing-roadmap__th" role="columnheader">
                {COL_HEADERS[0]}
              </div>
              <div className="landing-roadmap__th-gap" aria-hidden />
              <div className="landing-roadmap__th" role="columnheader">
                {COL_HEADERS[1]}
              </div>
              <div className="landing-roadmap__th-gap" aria-hidden />
              <div className="landing-roadmap__th" role="columnheader">
                {COL_HEADERS[2]}
              </div>
              <div className="landing-roadmap__th-gap" aria-hidden />
              <div className="landing-roadmap__th" role="columnheader">
                {COL_HEADERS[3]}
              </div>
              <div className="landing-roadmap__th-gap" aria-hidden />
              <div className="landing-roadmap__th" role="columnheader">
                {COL_HEADERS[4]}
              </div>
            </div>

            {TIMELINE_ROWS.map((row) => (
              <div key={row.current + row.target} className="landing-roadmap__trow" role="row">
                <div className="landing-roadmap__td landing-roadmap__td--strong" role="cell">
                  {row.current}
                </div>
                <TableArrow />
                <div className="landing-roadmap__td landing-roadmap__td--strong" role="cell">
                  {row.target}
                </div>
                <TableArrow />
                <div className="landing-roadmap__td landing-roadmap__td--meta" role="cell">
                  <Clock3 size={14} strokeWidth={2.2} aria-hidden />
                  <span>{row.hours}</span>
                </div>
                <TableArrow />
                <div className="landing-roadmap__td landing-roadmap__td--meta" role="cell">
                  <CalendarDays size={14} strokeWidth={2.2} aria-hidden />
                  <span>{row.duration}</span>
                </div>
                <TableArrow />
                <div className="landing-roadmap__td landing-roadmap__td--note" role="cell">
                  {row.note}
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="landing-roadmap__source">
          Nguồn: Cambridge IELTS Research + IELTSETC.COM
        </p>
      </section>

      {/* Stage cards */}
      <section className="landing-roadmap__stages" aria-label="Các giai đoạn band">
        {STAGES.map((stage) => {
          const Icon = stage.Icon
          return (
            <article
              key={stage.id}
              className={`landing-roadmap__stage landing-roadmap__stage--${stage.tone}`}
            >
              <div className="landing-roadmap__stage-top">
                <div>
                  <p className="landing-roadmap__stage-kicker">Band</p>
                  <h4 className="landing-roadmap__stage-band">{stage.band}</h4>
                </div>
                <span className="landing-roadmap__stage-icon" aria-hidden>
                  <Icon size={22} strokeWidth={1.8} />
                </span>
              </div>
              <ul className="landing-roadmap__stage-list">
                {stage.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <span className="landing-roadmap__stage-cta">
                {stage.cta}
                <ChevronRight size={14} strokeWidth={2.4} aria-hidden />
              </span>
            </article>
          )
        })}
      </section>
    </div>
  )
}
