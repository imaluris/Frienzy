import { AVATAR_COLORS } from '../config/avatarColors.ts'
import { contrastRatio } from '../config/contrast.ts'
import { PALETTES, type Palette, type ThemeMode } from './palettes.ts'

export interface Pair { name: string; fg: string; bg: string; min: number }

// Le coppie testo/sfondo davvero usate dall'app per ciascun tema (4.5 per il testo, 3 per simboli e bordi).
export function pairsFor(p: Palette): Pair[] {
  return [
    { name: 'testo su sfondo', fg: p.text, bg: p.background, min: 4.5 },
    { name: 'testo su schede', fg: p.text, bg: p.surface, min: 4.5 },
    { name: 'testo su livello sollevato (barra, finestre)', fg: p.text, bg: p.surface2, min: 4.5 },
    { name: 'testo su chip e segmenti', fg: p.text, bg: p.surface3, min: 4.5 },
    { name: 'testo sui pulsanti (primario)', fg: p.onPrimary, bg: p.primary, min: 4.5 },
    { name: 'testo su accento', fg: p.ink, bg: p.accent, min: 4.5 },
    { name: 'titoli e link (secondario su sfondo)', fg: p.secondary, bg: p.background, min: 4.5 },
    { name: 'secondario su schede', fg: p.secondary, bg: p.surface, min: 4.5 },
    { name: 'testo su secondario (filtri attivi)', fg: p.onSecondary, bg: p.secondary, min: 4.5 },
    { name: 'testo secondario su sfondo', fg: p.muted, bg: p.background, min: 4.5 },
    { name: 'testo secondario su schede', fg: p.muted, bg: p.surface, min: 4.5 },
    { name: 'testo secondario su chip', fg: p.muted, bg: p.surface3, min: 4.5 },
    { name: 'etichetta scheda inattiva (barra)', fg: p.muted, bg: p.surface2, min: 4.5 },
    { name: 'errori su schede', fg: p.error, bg: p.surface, min: 4.5 },
    { name: 'testo sul pulsante pericolo', fg: p.onError, bg: p.error, min: 4.5 },
    { name: 'badge neutro', fg: p.text, bg: p.neutralBg, min: 4.5 },
    { name: 'numero nel contatore dei segmenti', fg: p.text, bg: p.neutralBg2, min: 4.5 },
    { name: 'icona attiva (secondario su pillola)', fg: p.secondary, bg: p.secondarySoft, min: 4.5 },
    { name: 'icona stato vuoto (terracotta su tono morbido)', fg: p.primaryDeep, bg: p.primarySoft, min: 3 },
    { name: 'marchio sopra il saluto', fg: p.primaryDeep, bg: p.background, min: 4.5 },
    { name: 'mese nel badge data', fg: p.primaryDeep, bg: p.surface, min: 4.5 },
    { name: 'ultimi posti', fg: p.seatsLowText, bg: p.surface, min: 4.5 },
    { name: 'stella del voto', fg: p.accentDeep, bg: p.surface, min: 3 },
    { name: 'valore affidabilità', fg: p.secondary, bg: p.surface, min: 4.5 },
    { name: 'cuore salvato', fg: p.saved, bg: p.surface, min: 3 },
    { name: 'segnaposto: terracotta contro il bordo', fg: p.primary, bg: p.pinBorder, min: 3 },
    { name: 'stato confermato', fg: p.okFg, bg: p.okBg, min: 4.5 },
    { name: 'stato in attesa', fg: p.waitFg, bg: p.waitBg, min: 4.5 },
    { name: 'stato negativo / annullato', fg: p.badFg, bg: p.badBg, min: 4.5 },
    { name: 'pulsante spento nella barra azione', fg: p.muted, bg: p.borderSoft, min: 4.5 },
    { name: 'numero sulla campanella', fg: p.onBadge, bg: p.badge, min: 4.5 },
    { name: 'icona avviso invito', fg: p.accentDeep, bg: p.accentSoft, min: 3 },
    { name: 'icona avviso richiesta', fg: p.primaryDeep, bg: p.primarySoft, min: 3 },
    { name: 'testo del messaggio (toast)', fg: p.toastFg, bg: p.toastBg, min: 4.5 },
    { name: 'icona di avviso nel toast', fg: p.toastWarn, bg: p.toastBg, min: 3 },
    { name: 'interruttore: pallino su traccia spenta', fg: p.switchKnob, bg: p.border, min: 1.5 },
    { name: 'interruttore: traccia accesa su schede', fg: p.secondary, bg: p.surface, min: 3 },
    ...AVATAR_COLORS.map((c) => ({ name: `iniziali su avatar ${c}`, fg: p.ink, bg: c, min: 4.5 })),
  ]
}

// Colori che non cambiano con il tema: titolo bianco sulla copertina e bianco sul pulsante di pericolo chiaro.
export const FIXED_PAIRS: Pair[] = [
  { name: 'titolo bianco sulla sfumatura scura della copertina', fg: '#ffffff', bg: '#3b2f23', min: 4.5 },
]

export interface ContrastResult { theme: ThemeMode; name: string; ratio: number; min: number; ok: boolean }

export function checkContrast(): ContrastResult[] {
  const out: ContrastResult[] = []
  for (const theme of Object.keys(PALETTES) as ThemeMode[]) {
    for (const p of [...pairsFor(PALETTES[theme]), ...FIXED_PAIRS]) {
      const ratio = contrastRatio(p.fg, p.bg)
      out.push({ theme, name: p.name, ratio, min: p.min, ok: ratio >= p.min })
    }
  }
  return out
}
