export default function AnimatedReviewBird() {
  return (
    <svg
      className="srs-reminder-bird"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="srs-parrot-body" x1="42" y1="28" x2="112" y2="118" gradientUnits="userSpaceOnUse">
          <stop stopColor="#30C48D" />
          <stop offset="1" stopColor="#129E74" />
        </linearGradient>
        <linearGradient id="srs-parrot-wing" x1="48" y1="54" x2="98" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E8B6D" />
          <stop offset="1" stopColor="#0B6E5A" />
        </linearGradient>
        <linearGradient id="srs-parrot-tail" x1="95" y1="88" x2="133" y2="141" gradientUnits="userSpaceOnUse">
          <stop stopColor="#17B7A4" />
          <stop offset="1" stopColor="#0F8E93" />
        </linearGradient>
        <linearGradient id="srs-parrot-crest" x1="58" y1="15" x2="86" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB23F" />
          <stop offset="1" stopColor="#FF7A29" />
        </linearGradient>
        <linearGradient id="srs-parrot-card" x1="99" y1="36" x2="135" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEF9C3" />
          <stop offset="1" stopColor="#FDE68A" />
        </linearGradient>
      </defs>

      <ellipse cx="82" cy="139" rx="37" ry="8" fill="#0F172A" opacity="0.1" />

      <path
        d="M34 129C47 123 59 123 73 128"
        stroke="#7C5A43"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M28 133C46 124 63 124 80 130"
        stroke="#9A7154"
        strokeWidth="4"
        strokeLinecap="round"
      />

      <g stroke="#17403A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <g className="srs-bird-card">
          <rect x="101" y="34" width="32" height="40" rx="11" fill="url(#srs-parrot-card)" />
          <path d="M110 47H123" />
          <path d="M110 56H121" />
          <path d="M110 65H117" />
          <circle cx="124" cy="57" r="4" fill="#F97316" stroke="none" />
        </g>

        <g className="srs-bird-body">
          <path
            d="M54 49C54 34 66 24 82 24C100 24 113 36 113 57C113 84 95 109 72 109C57 109 46 97 46 80C46 68 49 57 54 49Z"
            fill="url(#srs-parrot-body)"
          />

          <g className="srs-bird-tail">
            <path
              d="M88 92C101 92 116 102 126 124C116 127 103 125 92 119C85 115 79 109 77 101L88 92Z"
              fill="url(#srs-parrot-tail)"
            />
            <path
              d="M83 96C95 101 107 111 113 129"
              stroke="#155E75"
            />
          </g>

          <g className="srs-bird-wing">
            <path
              d="M59 67C74 56 90 59 101 73C97 91 81 103 64 99C56 90 54 77 59 67Z"
              fill="url(#srs-parrot-wing)"
            />
            <path d="M67 71C76 74 84 81 89 90" />
            <path d="M62 81C72 83 80 89 85 98" />
          </g>

          <g className="srs-bird-head">
            <path d="M63 29C66 20 74 14 83 14C83 24 80 31 72 37L63 29Z" fill="url(#srs-parrot-crest)" />
            <path d="M78 17C83 11 91 10 98 13C95 20 89 25 81 27L78 17Z" fill="url(#srs-parrot-crest)" />
            <path
              d="M101 48C111 48 120 54 120 64C120 75 111 82 101 82H89V48H101Z"
              fill="#D9FFF2"
            />
            <circle cx="90" cy="56" r="17" fill="#E8FFF7" />
            <circle cx="95" cy="56" r="4.5" fill="#0F172A" stroke="none" />
            <circle cx="96.5" cy="54.6" r="1.2" fill="#fff" stroke="none" />
            <path d="M104 62C111 60 117 61 122 66C115 70 109 72 102 71L104 62Z" fill="#F97316" />
            <path d="M102 62C110 61 116 64 121 68" />
            <path d="M81 67C85 71 90 73 96 73" />
          </g>
        </g>

        <path d="M58 108L55 128" />
        <path d="M70 109L67 128" />
        <path d="M50 128H61" />
        <path d="M62 128H73" />
      </g>
    </svg>
  )
}
