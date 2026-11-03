import { Sparkle } from '../shapes'
import { EmptyFrame, INK } from './common'

// Non sei iscritto a nessun evento: un biglietto con la tacca, in attesa del timbro.
export function NoJoinedArt() {
  return (
    <EmptyFrame blob="#CFE5DB">
      <g transform="rotate(-8 80 62)">
        <path d="M32 40H128V54a8 8 0 0 0 0 16V84H32V70a8 8 0 0 0 0-16Z" fill="#E2725B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d="M100 42V82" stroke="#FFF8F0" strokeWidth="2.5" strokeDasharray="4 5" />
        <path d="M46 56H86M46 68H72" stroke="#FFF8F0" strokeWidth="5" strokeLinecap="round" />
        <circle cx="114" cy="62" r="7" fill="#F2B94B" stroke={INK} strokeWidth="2" />
      </g>
      <Sparkle x={132} y={30} size={9} fill="#2F5D50" />
      <path d="M52 100Q80 112 108 100" fill="none" stroke="#2F5D50" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </EmptyFrame>
  )
}

// Non organizzi nessun evento: un cappello da festa e coriandoli.
export function NoOrganizedArt() {
  const bits = [[44, 40, '#E2725B'], [118, 38, '#2F5D50'], [132, 66, '#F2B94B'], [36, 78, '#6F5AA8'], [104, 102, '#E2725B']] as const
  return (
    <EmptyFrame blob="#E3DAF2">
      <path d="M80 24L112 98H48Z" fill="#F2B94B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M68 62H92L96 74H64ZM56 88H104L108 98H52Z" fill="#E2725B" />
      <circle cx="80" cy="22" r="7" fill="#E2725B" stroke={INK} strokeWidth="2.5" />
      <path d="M44 100H116" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {bits.map(([x, y, c]) => <rect key={`${x}${y}`} x={x} y={y} width="10" height="5" rx="2" fill={c} transform={`rotate(${x * 3} ${x} ${y})`} />)}
    </EmptyFrame>
  )
}
