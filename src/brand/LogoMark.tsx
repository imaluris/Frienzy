import { appConfig } from '../config/app'
import { LOGO } from './logoPaths'

interface Props {
  size?: number
  /** 'brand' = fumetto chiaro su fondo terracotta (splash, icona); 'light' = fumetto terracotta su fondo chiaro. */
  tone?: 'brand' | 'light'
  className?: string
}

// Marchio dell'app in SVG: stesse forme dell'icona Android, ma con colori che dipendono dal fondo su cui sta.
export function LogoMark({ size = 96, tone = 'light', className }: Props) {
  const c = appConfig.colors
  const front = tone === 'brand' ? c.background : c.primary
  const letter = tone === 'brand' ? c.primary : c.background
  const gap = tone === 'brand' ? c.primary : c.background // bordo che stacca il fumetto davanti da quello dietro
  return (
    <svg className={className} width={size} height={size} viewBox="80 70 360 350" aria-hidden="true" focusable="false">
      <path d={LOGO.back} fill={c.secondary} />
      {LOGO.dots.map(([x, y]) => <circle key={x} cx={x} cy={y} r={LOGO.dotRadius} fill={c.background} />)}
      <path d={LOGO.front} fill={front} stroke={gap} strokeWidth="14" strokeLinejoin="round" />
      <path d={LOGO.letter} fill={letter} />
      <path d={LOGO.spark} fill={c.accent} />
    </svg>
  )
}
