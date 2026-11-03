import type { ReactNode } from 'react'
import { Sparkle } from '../shapes'

// Cornice comune delle illustrazioni degli stati vuoti: macchia morbida di fondo, soggetto e due scintille.
export function EmptyFrame({ blob, children }: { blob: string; children: ReactNode }) {
  return (
    <g>
      <path d="M26 66C22 34 52 12 88 16C124 20 146 44 138 76C130 106 98 116 66 112C40 108 28 90 26 66Z" fill={blob} />
      {children}
      <Sparkle x={22} y={28} size={7} fill="#F2B94B" />
      <Sparkle x={142} y={96} size={6} fill="#E2725B" />
    </g>
  )
}

export const INK = '#2B2118'
