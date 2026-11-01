// Illustrazione di benvenuto (SVG originale): tre amici attorno a un tavolino sotto una fila di lucine.
// Solo forme semplici e i colori del progetto. (Le illustrazioni definitive arrivano con il set delle copertine.)
const SKIN = ['#F0C7A0', '#C98D63', '#8A5A3C']

function Friend({ x, body, skin, hair }: { x: number; body: string; skin: string; hair: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="-26" y="132" width="52" height="58" rx="26" fill={body} />
      <circle cx="0" cy="112" r="20" fill={skin} />
      <path d="M-20 108a20 20 0 0 1 40 0c-8-8-26-10-40 0z" fill={hair} />
      <circle cx="-7" cy="114" r="2.2" fill="#2B2118" />
      <circle cx="7" cy="114" r="2.2" fill="#2B2118" />
      <path d="M-6 122q6 5 12 0" fill="none" stroke="#2B2118" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

export function WelcomeArt() {
  return (
    <svg className="welcome-art" viewBox="0 0 320 220" role="img" aria-label="Tre amici che brindano a un tavolino">
      <defs>
        <linearGradient id="wa-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FBE3DC" />
          <stop offset="1" stopColor="#FFE9B8" />
        </linearGradient>
      </defs>
      <rect width="320" height="220" rx="28" fill="url(#wa-sky)" />
      <circle cx="262" cy="52" r="30" fill="#F2B94B" />
      <circle cx="262" cy="52" r="42" fill="#F2B94B" opacity="0.25" />
      <path d="M-10 190c60-36 120-36 190-8s110 14 150-8V230H-10z" fill="#2F5D50" opacity="0.18" />
      <path d="M12 26q74 30 148 8t148 8" fill="none" stroke="#2B2118" strokeWidth="2" opacity="0.5" />
      {[34, 80, 128, 176, 224, 272].map((cx, i) => (
        <circle key={cx} cx={cx} cy={[40, 51, 46, 36, 40, 44][i]} r="6" fill={i % 2 ? '#F2B94B' : '#E2725B'} />
      ))}
      <Friend x={92} body="#2F5D50" skin={SKIN[0]} hair="#2B2118" />
      <Friend x={160} body="#E2725B" skin={SKIN[1]} hair="#5A3A22" />
      <Friend x={228} body="#F2B94B" skin={SKIN[2]} hair="#2B2118" />
      <rect x="64" y="186" width="192" height="12" rx="6" fill="#2B2118" />
      <rect x="152" y="196" width="16" height="24" rx="4" fill="#2B2118" />
      <g fill="#FFFFFF" stroke="#2B2118" strokeWidth="2">
        <path d="M118 162h20l-2 22h-16z" />
        <path d="M150 158h20l-2 26h-16z" />
        <path d="M182 162h20l-2 22h-16z" />
      </g>
      <path d="M120 168h16l-1 8h-14z M184 168h16l-1 8h-14z" fill="#E2725B" />
      <path d="M152 164h16l-1 10h-14z" fill="#F2B94B" />
    </svg>
  )
}
