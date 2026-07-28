/** Mascot mặt trời (12 tia + mặt cười) dùng chung: kết quả bài thi, trang Tổng quan. */
interface Props {
  className?: string
}

export default function SunnyMascotSvg({ className }: Props) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <defs>
        <radialGradient id="sunny-mascot-grad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffe566" />
          <stop offset="55%" stopColor="#ffc107" />
          <stop offset="100%" stopColor="#f39c12" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180
        const x1 = 60 + Math.cos(a) * 42
        const y1 = 60 + Math.sin(a) * 42
        const x2 = 60 + Math.cos(a) * 54
        const y2 = 60 + Math.sin(a) * 54
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#f5b041"
            strokeWidth="5"
            strokeLinecap="round"
          />
        )
      })}
      <circle cx="60" cy="60" r="34" fill="url(#sunny-mascot-grad)" />
      <circle cx="48" cy="55" r="3.2" fill="#5d4037" />
      <circle cx="72" cy="55" r="3.2" fill="#5d4037" />
      <path
        d="M46 70 Q60 82 74 70"
        fill="none"
        stroke="#5d4037"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
