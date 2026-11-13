import type { FrienzyEvent } from '../domain/event'
import { eventLink } from '../config/links'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { formatShortDate } from './format'

/** Testo da condividere: titolo, quando e zona. Mai l'indirizzo esatto (l'evento non lo contiene). */
export function buildShareText(event: FrienzyEvent): string {
  return `${EVENT_TYPE_EMOJI[event.tipo]} ${event.titolo}\n${formatShortDate(event.dataOra)} · ${event.zonaNome}\nVieni anche tu su Frienzy!`
}

/** Testo con il link in fondo: è quello che finisce negli appunti quando manca il pannello di condivisione. */
export function buildShareTextWithLink(event: FrienzyEvent): string {
  return `${buildShareText(event)}\n${eventLink(event.id)}`
}

export type ShareResult = 'shared' | 'copied' | 'unavailable'

/** Pannello di condivisione del telefono; se non c'è, copia il testo negli appunti. */
export async function shareEvent(event: FrienzyEvent, nav: Pick<Navigator, 'share' | 'clipboard'> = navigator): Promise<ShareResult> {
  const text = buildShareText(event)
  try {
    if (typeof nav.share === 'function') {
      await nav.share({ title: event.titolo, text, url: eventLink(event.id) })
      return 'shared'
    }
    if (nav.clipboard?.writeText) {
      await nav.clipboard.writeText(buildShareTextWithLink(event))
      return 'copied'
    }
  } catch {
    // Chiusura del pannello da parte dell'utente (AbortError) o permesso negato: non è un errore da mostrare.
  }
  return 'unavailable'
}
