/**
 * BACKUP — Hero mascot mặt trời / trăng (bản trước dictionary book).
 * Bật lại bằng: HERO_MASCOT_MODE = 'sun' trong landingHeroConfig.ts
 * Không xóa file này khi iterate hero mới.
 */
import type { CSSProperties } from 'react'

export function SunAnimationStyles() {
  return (
    <style>{`
      @keyframes sun-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes sun-hero-enter {
        0% {
          transform: translate3d(240px, 28px, 0) scale(0.92);
          opacity: 0;
        }
        45% {
          transform: translate3d(168px, 20px, 0) scale(0.94);
          opacity: 0.45;
        }
        78% {
          transform: translate3d(48px, 7px, 0) scale(0.985);
          opacity: 0.9;
        }
        100% {
          transform: translate3d(0, 0, 0) scale(1);
          opacity: 1;
        }
      }
      @keyframes sun-bubble-enter {
        0% {
          transform: translate3d(120px, 16px, 0) scale(0.94);
          opacity: 0;
        }
        55% {
          transform: translate3d(76px, 10px, 0) scale(0.96);
          opacity: 0.38;
        }
        100% {
          transform: translate3d(0, 0, 0) scale(1);
          opacity: 1;
        }
      }
      @keyframes sun-float {
        0%, 100% { transform: translate3d(0, 0px, 0); }
        25%      { transform: translate3d(8px, -10px, 0); }
        50%      { transform: translate3d(-6px, -28px, 0); }
        75%      { transform: translate3d(-10px, -12px, 0); }
      }
      @keyframes sun-pulse {
        0%, 100% { transform: scale(1); opacity: 0.96; }
        50%      { transform: scale(1.08); opacity: 0.82; }
      }
      @keyframes halo-drift-a {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.42; }
        50%      { transform: translate3d(18px, -20px, 0) scale(1.08); opacity: 0.58; }
      }
      @keyframes halo-drift-b {
        0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.26; }
        50%      { transform: translate3d(-24px, 16px, 0) scale(0.94); opacity: 0.4; }
      }
      @keyframes blink {
        0%, 90%, 100% { transform: scaleY(1); }
        95%            { transform: scaleY(0.08); }
      }
      @keyframes smile-wiggle {
        0%, 100% { transform: rotate(0deg); }
        25%       { transform: rotate(3deg); }
        75%       { transform: rotate(-3deg); }
      }
      @keyframes bubble-pop {
        0%   { transform: scale(0.8) translateY(6px); opacity: 0; }
        60%  { transform: scale(1.04) translateY(-2px); opacity: 1; }
        100% { transform: scale(1) translateY(0); opacity: 1; }
      }
      @keyframes star-twinkle {
        0%, 100% { opacity: 0.9; transform: scale(1); }
        50%      { opacity: 0.28; transform: scale(0.7); }
      }
      @keyframes zzz-float {
        0%   { transform: translate(0, 0) scale(0.85); opacity: 0; }
        18%  { opacity: 1; }
        70%  { opacity: 0.9; }
        100% { transform: translate(-22px, -46px) scale(1.12); opacity: 0; }
      }
      @keyframes sleep-breathe {
        0%, 100% { transform: scaleY(1); }
        50%      { transform: scaleY(0.86); }
      }
      @keyframes moon-eye-flutter {
        0%, 92%, 100% { transform: scaleY(1); }
        95%           { transform: scaleY(0.55); }
      }

      .sun-rays  { transform-origin: 200px 230px; animation: sun-spin 14s linear infinite; }
      .sun-body  { transform-origin: 200px 230px; animation: sun-pulse 3.5s ease-in-out infinite; }
      .sun-wrap  { animation: sun-float 5.6s cubic-bezier(.45,.05,.55,.95) infinite; }
      .sun-hero-enter {
        animation: sun-hero-enter 5.2s cubic-bezier(.22,.61,.2,1) both;
        will-change: transform, opacity;
      }
      .sun-bubble-enter {
        animation: sun-bubble-enter 3.1s cubic-bezier(.24,.62,.2,1) 1.35s both;
        will-change: transform, opacity;
      }
      .sun-halo-a { animation: halo-drift-a 10s ease-in-out infinite; }
      .sun-halo-b { animation: halo-drift-b 13s ease-in-out infinite; }
      .sun-parallax-halo {
        transform: translate3d(calc(var(--sun-px, 0px) * 0.35), calc(var(--sun-py, 0px) * 0.35), 0);
        transition: transform 220ms ease-out;
        will-change: transform;
      }
      .sun-parallax-main {
        transform: translate3d(calc(var(--sun-px, 0px) * 0.7), calc(var(--sun-py, 0px) * 0.7), 0);
        transition: transform 180ms ease-out;
        will-change: transform;
      }
      .sun-bubble-layer {
        transform: translate3d(calc(var(--sun-px, 0px) * 1.1), calc(var(--sun-py, 0px) * 1.1), 0);
        transition: transform 200ms ease-out;
        will-change: transform;
      }
      .sun-eye-l { transform-origin: 165px 215px; animation: blink 4s ease-in-out infinite; }
      .sun-eye-r { transform-origin: 235px 215px; animation: blink 4s ease-in-out infinite 0.05s; }
      .sun-smile { transform-origin: 200px 255px; animation: smile-wiggle 4s ease-in-out infinite; }
      .sun-bubble { animation: bubble-pop 0.6s cubic-bezier(.34,1.56,.64,1) both; }
      .moon-star  { animation: star-twinkle 2.6s ease-in-out infinite; }
      .moon-zzz-1 { animation: zzz-float 3.4s ease-in-out infinite; }
      .moon-zzz-2 { animation: zzz-float 3.4s ease-in-out 0.75s infinite; }
      .moon-zzz-3 { animation: zzz-float 3.4s ease-in-out 1.5s infinite; }
      .moon-smile { transform-origin: 200px 268px; animation: sleep-breathe 3.8s ease-in-out infinite; }
      .moon-eye-l { transform-origin: 165px 218px; animation: moon-eye-flutter 5s ease-in-out infinite; }
      .moon-eye-r { transform-origin: 235px 218px; animation: moon-eye-flutter 5s ease-in-out infinite 0.08s; }

      @media (prefers-reduced-motion: reduce) {
        .sun-rays, .sun-body, .sun-wrap, .sun-halo-a, .sun-halo-b,
        .sun-eye-l, .sun-eye-r, .sun-smile, .moon-star,
        .moon-zzz-1, .moon-zzz-2, .moon-zzz-3, .moon-smile, .moon-eye-l, .moon-eye-r {
          animation: none !important;
        }
      }
    `}</style>
  )
}

export function SunIllustration() {
  const RAYS = 16
  return (
    <svg
      viewBox="-40 -30 500 500"
      className="sun-parallax-main w-[188%] max-w-[52rem] overflow-visible drop-shadow-xl"
      fill="none"
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFDA5A" />
          <stop offset="100%" stopColor="#F5850A" />
        </radialGradient>
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6B8" stopOpacity="0.74" />
          <stop offset="52%" stopColor="#FFE17A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFF3A3" stopOpacity="0" />
        </radialGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle className="sun-wrap" cx="200" cy="235" r="190" fill="url(#glowGrad)" />
      <g className="sun-wrap">
        <g className="sun-rays" filter="url(#glow)">
          {Array.from({ length: RAYS }).map((_, i) => {
            const angle = (i * 360 / RAYS) * Math.PI / 180
            const inner = 158
            const outer = i % 2 === 0 ? 196 : 182
            return (
              <line
                key={i}
                x1={200 + inner * Math.cos(angle)}
                y1={235 + inner * Math.sin(angle)}
                x2={200 + outer * Math.cos(angle)}
                y2={235 + outer * Math.sin(angle)}
                stroke={i % 2 === 0 ? '#FFCC00' : '#FFB300'}
                strokeWidth={i % 2 === 0 ? 16 : 10}
                strokeLinecap="round"
              />
            )
          })}
        </g>
        <circle className="sun-body" cx="200" cy="235" r="145" fill="url(#bodyGrad)" />
        <ellipse cx="168" cy="175" rx="28" ry="18" fill="white" opacity="0.22" transform="rotate(-30 168 175)" />
        <ellipse className="sun-eye-l" cx="165" cy="218" rx="13" ry="13" fill="#1a1a1a" />
        <circle cx="160" cy="213" r="4" fill="white" opacity="0.6" />
        <ellipse className="sun-eye-r" cx="235" cy="218" rx="13" ry="13" fill="#1a1a1a" />
        <circle cx="230" cy="213" r="4" fill="white" opacity="0.6" />
        <path className="sun-smile" d="M 162 262 Q 200 295 238 262" stroke="#1a1a1a" strokeWidth="8" strokeLinecap="round" fill="none" />
        <g className="sun-bubble sun-bubble-layer sun-bubble-enter">
          <rect x="228" y="58" width="168" height="98" rx="18" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1.5" filter="url(#glow)" />
          <polygon points="242,156 260,156 248,174" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1" />
          <text x="246" y="86" fontSize="11" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">Việc của bạn là tỏa sáng và</text>
          <text x="246" y="102" fontSize="11" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">tập trung, còn hệ thống và</text>
          <text x="246" y="118" fontSize="11" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">'thế giới' còn lại cứ để</text>
          <text x="246" y="134" fontSize="11" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">Ryan bảo kê!</text>
        </g>
      </g>
    </svg>
  )
}

export function MoonIllustration() {
  const STARS = 14
  const STAR_POS = Array.from({ length: STARS }).map((_, i) => {
    const angle = (i * 360 / STARS) * Math.PI / 180
    const radius = i % 3 === 0 ? 205 : i % 3 === 1 ? 224 : 192
    return {
      cx: 200 + radius * Math.cos(angle),
      cy: 235 + radius * Math.sin(angle),
      r: i % 2 === 0 ? 5 : 3.4,
      warm: i % 2 === 0,
      delay: (i * 0.18).toFixed(2),
    }
  })

  return (
    <svg
      viewBox="-40 -30 500 500"
      className="sun-parallax-main w-[188%] max-w-[52rem] overflow-visible drop-shadow-xl"
      fill="none"
    >
      <defs>
        <radialGradient id="moonBody" cx="42%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#FFF7DC" />
          <stop offset="55%" stopColor="#E8D9AC" />
          <stop offset="100%" stopColor="#B0A079" />
        </radialGradient>
        <radialGradient id="moonGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DDE6FF" stopOpacity="0.58" />
          <stop offset="52%" stopColor="#A6B4E0" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#8090C0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonShade" cx="78%" cy="48%" r="72%">
          <stop offset="0%" stopColor="#000" stopOpacity="0" />
          <stop offset="85%" stopColor="#000" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.36" />
        </radialGradient>
        <filter id="moonBlur" x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <circle className="sun-wrap" cx="200" cy="235" r="190" fill="url(#moonGlowGrad)" />
      <g className="sun-wrap">
        <g className="sun-rays" filter="url(#moonBlur)">
          {STAR_POS.map((s, i) => (
            <g key={i} className="moon-star" style={{ transformOrigin: `${s.cx}px ${s.cy}px`, animationDelay: `${s.delay}s` } as CSSProperties}>
              <path
                d={`M ${s.cx} ${s.cy - s.r * 2.2} L ${s.cx + s.r * 0.55} ${s.cy - s.r * 0.55} L ${s.cx + s.r * 2.2} ${s.cy} L ${s.cx + s.r * 0.55} ${s.cy + s.r * 0.55} L ${s.cx} ${s.cy + s.r * 2.2} L ${s.cx - s.r * 0.55} ${s.cy + s.r * 0.55} L ${s.cx - s.r * 2.2} ${s.cy} L ${s.cx - s.r * 0.55} ${s.cy - s.r * 0.55} Z`}
                fill={s.warm ? '#FFF3C0' : '#E6ECFF'}
                opacity="0.92"
              />
            </g>
          ))}
        </g>
        <circle className="sun-body" cx="200" cy="235" r="145" fill="url(#moonBody)" />
        <circle className="sun-body" cx="200" cy="235" r="145" fill="url(#moonShade)" />
        <path className="moon-eye-l" d="M 150 220 Q 165 208 180 220" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path className="moon-eye-r" d="M 220 220 Q 235 208 250 220" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path className="moon-smile" d="M 178 268 Q 200 282 222 268" stroke="#1a1a1a" strokeWidth="7" strokeLinecap="round" fill="none" />
        <g className="sun-bubble sun-bubble-layer sun-bubble-enter">
          <rect x="216" y="48" width="196" height="126" rx="22" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="1.5" filter="url(#moonBlur)" />
          <text x="234" y="80" fontSize="12" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">Đêm khuya cứ ngủ ngon giấc,</text>
          <text x="234" y="100" fontSize="12" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">còn hệ thống học tập và</text>
          <text x="234" y="120" fontSize="12" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">'thế giới' còn lại cứ để</text>
          <text x="234" y="140" fontSize="12" fill="var(--text-primary)" fontFamily="Inter,sans-serif" fontWeight="500">Ryan bảo kê nhé!</text>
        </g>
      </g>
    </svg>
  )
}

export function LegacySunStage({ isNight }: { isNight: boolean }) {
  return (
    <div className="relative hidden flex-1 items-center justify-center overflow-visible md:flex md:min-h-[720px]">
      <div className="sun-hero-enter absolute inset-0 pointer-events-none">
        <div
          className="sun-halo-a sun-parallax-halo absolute right-[6%] top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full"
          style={{
            background: isNight
              ? 'radial-gradient(circle, color-mix(in srgb, #CFDCFF 30%, transparent) 0%, color-mix(in srgb, #8CA0D8 12%, transparent) 34%, transparent 72%)'
              : 'radial-gradient(circle, color-mix(in srgb, #FFF3A3 36%, transparent) 0%, color-mix(in srgb, #FFD36A 14%, transparent) 34%, transparent 72%)',
          }}
        />
        <div
          className="sun-halo-b sun-parallax-halo absolute right-[-10%] top-[44%] h-[760px] w-[760px] -translate-y-1/2 rounded-full"
          style={{
            background: isNight
              ? 'radial-gradient(circle, color-mix(in srgb, #B9C8F0 16%, transparent) 0%, color-mix(in srgb, #7C8DC8 8%, transparent) 42%, transparent 78%)'
              : 'radial-gradient(circle, color-mix(in srgb, #FFE28A 18%, transparent) 0%, color-mix(in srgb, #FFDA5A 8%, transparent) 42%, transparent 78%)',
          }}
        />
      </div>
      <div className="sun-hero-enter relative z-10">
        {isNight ? <MoonIllustration /> : <SunIllustration />}
      </div>
    </div>
  )
}
