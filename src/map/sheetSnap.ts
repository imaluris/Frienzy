// La scheda a scorrimento della mappa ha tre altezze. Funzioni pure: si provano senza schermo.
export type Snap = 'closed' | 'half' | 'full'

const ORDER: Snap[] = ['closed', 'half', 'full']

/** Un'altezza più in alto (dir = 1) o più in basso (dir = -1); si ferma ai bordi. */
export function stepSnap(snap: Snap, dir: 1 | -1): Snap {
  const next = ORDER.indexOf(snap) + dir
  return ORDER[Math.min(ORDER.length - 1, Math.max(0, next))]
}

/** Tocco sulla maniglia: sale di un'altezza, dall'alto torna giù a metà. */
export function tapSnap(snap: Snap): Snap {
  return snap === 'full' ? 'half' : stepSnap(snap, 1)
}

export const DRAG_THRESHOLD = 24

/** Trascinamento: dy negativo = dito verso l'alto. Sotto la soglia non cambia nulla. */
export function dragSnap(snap: Snap, dy: number): Snap {
  if (Math.abs(dy) < DRAG_THRESHOLD) return snap
  return stepSnap(snap, dy < 0 ? 1 : -1)
}
