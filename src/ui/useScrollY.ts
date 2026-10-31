import { useEffect, useState } from 'react'

/** Posizione di scorrimento della pagina, aggiornata al massimo una volta per fotogramma. */
export function useScrollY(): number {
  const [y, setY] = useState(0)
  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setY(window.scrollY))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  return y
}

/** True se l'utente ha chiesto di ridurre le animazioni (impostazione del telefono). */
export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
