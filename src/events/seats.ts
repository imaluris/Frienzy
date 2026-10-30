export type SeatLevel = 'ok' | 'low' | 'full'

export interface SeatsInfo {
  left: number
  /** Quota occupata, da 0 a 1: serve alla barra dei posti. */
  ratio: number
  level: SeatLevel
  label: string
}

/** Stato dei posti: quanti ne restano, a che livello di riempimento e la frase da mostrare. */
export function seatsInfo(max: number, confirmed: number): SeatsInfo {
  const taken = Math.min(Math.max(confirmed, 0), max)
  const left = max - taken
  const ratio = max > 0 ? taken / max : 1
  if (left === 0) return { left, ratio: 1, level: 'full', label: 'Al completo' }
  // "Ultimi posti" solo se ne restano pochi E l'evento è già mezzo pieno (altrimenti un evento da 2 posti sarebbe sempre "ultimi").
  const low = left <= 2 && taken >= max / 2
  return { left, ratio, level: low ? 'low' : 'ok', label: left === 1 ? '1 posto libero' : `${left} posti liberi` }
}
