import type { Send } from './plan'

/**
 * Primo avvio: se non esiste ancora lo stato, tutto ciò che c'è adesso si segna come "già inviato" SENZA mandare niente,
 * altrimenti la prima esecuzione manderebbe una valanga di notifiche su cose vecchie.
 */
export function applyBaseline(sends: readonly Send[], firstRun: boolean): { toSend: Send[]; toRecord: string[] } {
  return { toSend: firstRun ? [] : [...sends], toRecord: sends.map((s) => s.key) }
}

const DAY = 86_400_000
export const KEEP_DAYS = 60

/** Aggiunge le nuove chiavi (con l'ora) a quelle già note e dimentica quelle più vecchie di 60 giorni, così il documento non cresce all'infinito. */
export function mergeSent(known: Readonly<Record<string, number>>, keys: readonly string[], now: Date): Record<string, number> {
  const out: Record<string, number> = {}
  for (const [key, at] of Object.entries(known)) if (now.getTime() - at <= KEEP_DAYS * DAY) out[key] = at
  for (const key of keys) out[key] ??= now.getTime()
  return out
}
