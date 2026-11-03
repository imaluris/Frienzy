import { useEffect, useMemo } from 'react'
import { prefersReducedMotion } from '../ui/useScrollY'
import { makeRng } from './seed'

const COLORS = ['#E2725B', '#F2B94B', '#2F5D50', '#6F5AA8', '#2F6F9A', '#FFF8F0'] as const

export interface Piece {
  left: number
  delay: number
  duration: number
  drift: number
  spin: number
  size: number
  color: string
}

// I pezzi di coriandolo: posizione, ritardo e caduta calcolati con un seme, quindi senza sorprese nei test.
export function makePieces(count: number, seed = 7): Piece[] {
  const rng = makeRng(seed)
  return Array.from({ length: count }, () => ({
    left: rng.between(4, 96),
    delay: rng.between(0, 0.35),
    duration: rng.between(1.1, 1.8),
    drift: rng.between(-60, 60),
    spin: rng.between(240, 720),
    size: rng.between(7, 12),
    color: rng.pick(COLORS),
  }))
}

// Pioggia di coriandoli a schermo intero per festeggiare l'iscrizione. Con "riduci animazioni" non compare
// (il toast di conferma resta). Chiama onDone quando l'animazione è finita, così chi la usa può toglierla.
export function Confetti({ onDone, count = 36 }: { onDone: () => void; count?: number }) {
  const pieces = useMemo(() => makePieces(count), [count])
  const skip = prefersReducedMotion()
  useEffect(() => {
    const t = window.setTimeout(onDone, skip ? 0 : 2300)
    return () => window.clearTimeout(t)
  }, [onDone, skip])
  if (skip) return null
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`, width: p.size, height: p.size * 0.5, background: p.color,
            animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
            ['--drift' as string]: `${p.drift}px`, ['--spin' as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  )
}
