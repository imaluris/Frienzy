import type { EventMarker } from './markers'

/**
 * Disegno del segnaposto a goccia: colore del tipo, emoji dentro. Quello selezionato si ingrandisce (classe is-selected).
 * Emoji e colore arrivano solo da costanti del codice, mai dal testo scritto da un utente, quindi l'HTML è sicuro.
 */
export function pinHtml(marker: Pick<EventMarker, 'emoji' | 'color'>, selected: boolean): string {
  return `<span class="pin-drop${selected ? ' is-selected' : ''}" style="background:${marker.color}"><span class="pin-emoji">${marker.emoji}</span></span>`
}
