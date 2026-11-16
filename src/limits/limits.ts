// Intervalli minimi tra due azioni "costose" dello stesso utente.
// Gli STESSI numeri stanno in firestore.rules (funzione validLimits): un test li confronta.
export type LimitField = 'ultimoEvento' | 'ultimoMessaggio' | 'ultimaSegnalazione'

export const LIMIT_SECONDS: Record<LimitField, number> = {
  ultimoEvento: 60,
  ultimoMessaggio: 2,
  ultimaSegnalazione: 30,
}

/** Quanti secondi mancano prima di poter ripetere l'azione (0 = si può fare subito). */
export function secondsToWait(lastAt: Date | null, field: LimitField, now: Date = new Date()): number {
  if (!lastAt) return 0
  const elapsed = (now.getTime() - lastAt.getTime()) / 1000
  return Math.max(0, Math.ceil(LIMIT_SECONDS[field] - elapsed))
}
