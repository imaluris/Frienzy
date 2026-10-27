import { AVATAR_COLORS } from './avatarColors.ts'
import { appConfig } from './app.ts'
import { contrastRatio } from './contrast.ts'

const WHITE = '#FFFFFF'
const { primary, secondary, accent, background, text } = appConfig.colors

// Le coppie testo/sfondo davvero usate dall'app, con il minimo richiesto (WCAG AA).
// 4.5 per il testo normale, 3 per bordi e simboli grafici.
export const PAIRS = [
  { name: 'testo su sfondo', fg: text, bg: background, min: 4.5 },
  { name: 'testo su schede bianche', fg: text, bg: WHITE, min: 4.5 },
  { name: 'testo sui pulsanti (primario)', fg: text, bg: primary, min: 4.5 },
  { name: 'testo su accento', fg: text, bg: accent, min: 4.5 },
  { name: 'titoli e link (secondario su sfondo)', fg: secondary, bg: background, min: 4.5 },
  { name: 'bianco su secondario (filtri attivi)', fg: WHITE, bg: secondary, min: 4.5 },
  { name: 'testo secondario (grigio caldo su sfondo)', fg: '#6b5a4c', bg: background, min: 4.5 },
  { name: 'errori (rosso su schede bianche)', fg: '#b3261e', bg: WHITE, min: 4.5 },
  { name: 'badge neutro (testo su beige)', fg: text, bg: '#ece3d8', min: 4.5 },
  { name: 'badge annullato', fg: '#7a1913', bg: '#f6d5d1', min: 4.5 },
  { name: 'testo secondario su scheda bianca', fg: '#6b5a4c', bg: WHITE, min: 4.5 },
  { name: 'bordo marker (primario su bianco)', fg: primary, bg: WHITE, min: 3 },
  ...AVATAR_COLORS.map((c) => ({ name: `iniziali su avatar ${c}`, fg: text, bg: c, min: 4.5 })),
] as const

export interface ContrastResult {
  name: string
  ratio: number
  min: number
  ok: boolean
}

export function checkContrast(): ContrastResult[] {
  return PAIRS.map((p) => {
    const ratio = contrastRatio(p.fg, p.bg)
    return { name: p.name, ratio, min: p.min, ok: ratio >= p.min }
  })
}
