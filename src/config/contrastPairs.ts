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
  { name: 'icona attiva (secondario su pillola verde chiaro)', fg: secondary, bg: '#dcebe3', min: 4.5 },
  { name: 'icona stato vuoto (terracotta scuro su rosa chiaro)', fg: '#a8452f', bg: '#fbe3dc', min: 3 },
  { name: 'etichetta scheda inattiva (grigio caldo su bianco)', fg: '#6b5a4c', bg: WHITE, min: 4.5 },
  { name: 'marchio sopra il saluto (terracotta scuro su sfondo)', fg: '#a8452f', bg: background, min: 4.5 },
  { name: 'mese nel badge data (terracotta scuro su bianco)', fg: '#a8452f', bg: WHITE, min: 4.5 },
  { name: 'ultimi posti (ocra scuro su bianco)', fg: '#7a5200', bg: WHITE, min: 4.5 },
  { name: 'cuore salvato (rosso su bianco)', fg: '#c0432c', bg: WHITE, min: 3 },
  { name: 'bordo marker (primario su bianco)', fg: primary, bg: WHITE, min: 3 },
  { name: 'titolo bianco sulla copertina (sfumatura scura su giallo chiaro)', fg: WHITE, bg: '#7b5e2c', min: 4.5 },
  { name: 'bianco sul pulsante pericolo', fg: WHITE, bg: '#b3261e', min: 4.5 },
  { name: 'stato confermato (verde scuro su verde chiaro)', fg: '#1f4136', bg: '#dcebe3', min: 4.5 },
  { name: 'stato in attesa (ocra scuro su giallo chiaro)', fg: '#5c3f00', bg: '#fbefc9', min: 4.5 },
  { name: 'stato negativo (rosso scuro su rosa chiaro)', fg: '#7a1913', bg: '#f6d5d1', min: 4.5 },
  { name: 'pulsante spento nella barra azione', fg: '#6b5a4c', bg: '#eadfd2', min: 4.5 },
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
