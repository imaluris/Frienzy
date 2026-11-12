import { appConfig } from '../config/app.ts'

// Tutti i colori dell'interfaccia, per tema. Unica fonte: i CSS li leggono come variabili (--color-...).
// Il tema chiaro parte dalla palette di marca in config/app.ts; il tema scuro è una palette a sé.
export type ThemeMode = 'chiaro' | 'scuro'

export interface Palette {
  primary: string; secondary: string; accent: string; background: string; text: string
  surface: string; surface2: string; surface3: string
  border: string; borderSoft: string; muted: string; error: string
  primarySoft: string; secondarySoft: string; accentSoft: string; accentDeep: string; primaryDeep: string
  ink: string; onPrimary: string; onSecondary: string; onError: string
  badge: string; onBadge: string
  switchKnob: string; toastBg: string; toastFg: string; toastWarn: string
  glass: string; neutralBg: string; neutralBg2: string
  okBg: string; okFg: string; waitBg: string; waitFg: string; badBg: string; badFg: string
  pinBorder: string; mapBg: string; mapGrid: string; shimmer: string; freshBg: string
  seatsLow: string; seatsLowText: string; saved: string
  shadowRgb: string; shadowK: string; themeBar: string
}

const c = appConfig.colors

export const LIGHT: Palette = {
  primary: c.primary, secondary: c.secondary, accent: c.accent, background: c.background, text: c.text,
  surface: '#ffffff', surface2: '#ffffff', surface3: '#f1e6d8',
  border: '#d9cbbd', borderSoft: '#eadfd2', muted: '#6b5a4c', error: '#b3261e',
  primarySoft: '#fbe3dc', secondarySoft: '#dcebe3', accentSoft: '#fbefc9', accentDeep: '#9a6b00', primaryDeep: '#a8452f',
  ink: c.text, onPrimary: c.text, onSecondary: '#ffffff', onError: '#ffffff',
  badge: '#a8452f', onBadge: '#ffffff',
  switchKnob: '#ffffff', toastBg: c.text, toastFg: '#ffffff', toastWarn: '#ffb4a8',
  glass: 'rgba(255, 255, 255, 0.92)', neutralBg: '#ece3d8', neutralBg2: '#e9dccb',
  okBg: '#dcebe3', okFg: '#1f4136', waitBg: '#fbefc9', waitFg: '#5c3f00', badBg: '#f6d5d1', badFg: '#7a1913',
  pinBorder: '#ffffff', mapBg: '#e9e4dc', mapGrid: 'rgba(47, 93, 80, 0.07)', shimmer: '#f6efe6', freshBg: '#fffdf9',
  seatsLow: '#d79a22', seatsLowText: '#7a5200', saved: '#c0432c',
  shadowRgb: '43, 33, 24', shadowK: '1', themeBar: c.background,
}

// Tema scuro: marrone caldo, non nero puro. Quattro livelli di superficie (sfondo, scheda, sollevato, chip)
// separati da luminosità e bordi; terracotta e senape restano, verde e testi si schiariscono.
export const DARK: Palette = {
  primary: c.primary, secondary: '#8fcbb2', accent: c.accent, background: '#17120e', text: '#f4eadf',
  surface: '#211a15', surface2: '#2a221c', surface3: '#352b24',
  border: '#7a6a5c', borderSoft: '#3b3029', muted: '#bba99a', error: '#ff8f83',
  primarySoft: '#4a2a21', secondarySoft: '#25392f', accentSoft: '#43361a', accentDeep: '#f2b94b', primaryDeep: '#f4a28c',
  ink: c.text, onPrimary: c.text, onSecondary: '#0f241c', onError: '#3b0a06',
  badge: '#a8452f', onBadge: '#ffffff',
  switchKnob: '#f4eadf', toastBg: '#f4eadf', toastFg: c.text, toastWarn: '#b3261e',
  glass: 'rgba(33, 26, 21, 0.92)', neutralBg: '#352b24', neutralBg2: '#4a3d33',
  okBg: '#25392f', okFg: '#bfe6d2', waitBg: '#43361a', waitFg: '#f6db92', badBg: '#4a2420', badFg: '#ffb9ae',
  pinBorder: '#ffffff', mapBg: '#1d1915', mapGrid: 'rgba(143, 203, 178, 0.08)', shimmer: '#40352d', freshBg: '#2b2019',
  seatsLow: '#f2b94b', seatsLowText: '#f6db92', saved: '#ff8f83',
  shadowRgb: '0, 0, 0', shadowK: '2.4', themeBar: '#17120e',
}

export const PALETTES: Record<ThemeMode, Palette> = { chiaro: LIGHT, scuro: DARK }
