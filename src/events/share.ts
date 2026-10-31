import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { formatShortDate } from './format'

/** Testo da condividere: titolo, quando e zona. Mai l'indirizzo esatto (l'evento non lo contiene). */
export function buildShareText(event: FrienzyEvent): string {
  return `${EVENT_TYPE_EMOJI[event.tipo]} ${event.titolo}\n${formatShortDate(event.dataOra)} · ${event.zonaNome}\nVieni anche tu su Frienzy!`
}

export type ShareResult = 'shared' | 'copied' | 'unavailable'

/** Pannello di condivisione del telefono; se non c'è, copia il testo negli appunti. */
export async function shareEvent(event: FrienzyEvent, nav: Pick<Navigator, 'share' | 'clipboard'> = navigator): Promise<ShareResult> {
  const text = buildShareText(event)
  try {
    if (typeof nav.share === 'function') {
      await nav.share({ title: event.titolo, text })
      return 'shared'
    }
    if (nav.clipboard?.writeText) {
      await nav.clipboard.writeText(text)
      return 'copied'
    }
  } catch {
    // Chiusura del pannello da parte dell'utente (AbortError) o permesso negato: non è un errore da mostrare.
  }
  return 'unavailable'
}
