import type { Presence, Rating } from './types'

/** Sotto questa soglia di presenze segnate la percentuale non si mostra: con 1 sola presenza sarebbe 0% o 100%, poco giusto. */
export const MIN_MARKED = 3

export interface Reliability {
  /** Eventi a cui sono davvero andato. */
  done: number
  /** Presenze segnate in totale (presente + assente). */
  marked: number
  /** Percentuale 0-100, oppure null se i dati sono pochi. */
  percent: number | null
}

export function reliability(presences: Pick<Presence, 'stato'>[]): Reliability {
  const done = presences.filter((p) => p.stato === 'presente').length
  const marked = presences.length
  return { done, marked, percent: marked >= MIN_MARKED ? Math.round((done / marked) * 100) : null }
}

export interface StarsSummary {
  count: number
  /** Media con un decimale, oppure null senza voti. */
  average: number | null
}

export function starsSummary(ratings: Pick<Rating, 'stelle'>[]): StarsSummary {
  if (ratings.length === 0) return { count: 0, average: null }
  const total = ratings.reduce((sum, r) => sum + r.stelle, 0)
  return { count: ratings.length, average: Math.round((total / ratings.length) * 10) / 10 }
}
