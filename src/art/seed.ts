// Numeri "casuali" ma ripetibili: lo stesso id dà sempre la stessa sequenza, così lo stesso evento
// ha sempre la stessa copertina e due eventi diversi dello stesso tipo possono avere varianti diverse.

// Trasforma una stringa in un numero (hash FNV-1a, 32 bit).
export function hashString(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface Rng {
  /** Numero tra 0 (incluso) e 1 (escluso). */
  next: () => number
  /** Numero tra min e max. */
  between: (min: number, max: number) => number
  /** Intero da 0 a n-1. */
  int: (n: number) => number
  /** Un elemento a caso dalla lista. */
  pick: <T>(items: readonly T[]) => T
}

// Generatore mulberry32: piccolo, veloce e ripetibile.
export function makeRng(seed: number): Rng {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    between: (min, max) => min + next() * (max - min),
    int: (n) => Math.floor(next() * n),
    pick: (items) => items[Math.floor(next() * items.length)],
  }
}

export const rngFor = (id: string) => makeRng(hashString(id))
