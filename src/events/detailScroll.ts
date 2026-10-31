// Calcoli sullo scorrimento del dettaglio: funzioni pure, così si provano senza disegnare nulla.

/** Quanto la copertina "resta indietro" rispetto al resto: massimo 80px, così non si vede mai un buco in alto. */
export const PARALLAX_MAX = 80
const PARALLAX_FACTOR = 0.4

export function parallaxOffset(scrollY: number, reduceMotion: boolean): number {
  if (reduceMotion || scrollY <= 0) return 0
  return Math.min(scrollY * PARALLAX_FACTOR, PARALLAX_MAX)
}

/** Da 0 (in cima) a 1 (copertina quasi uscita): fa comparire sfondo e titolo nella barra in alto. */
export function headerProgress(scrollY: number, coverHeight: number): number {
  const start = coverHeight * 0.55
  const end = coverHeight - 64
  if (end <= start) return scrollY >= end ? 1 : 0
  return Math.min(Math.max((scrollY - start) / (end - start), 0), 1)
}
