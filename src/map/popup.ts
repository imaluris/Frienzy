import type { EventMarker } from './markers'

/**
 * Costruisce il contenuto del popup di un marker con elementi DOM e textContent
 * (mai innerHTML): il titolo lo scrive l'organizzatore e non deve poter inserire HTML.
 */
export function buildPopup(marker: EventMarker, onOpen: (eventId: string) => void): HTMLElement {
  const box = document.createElement('div')
  box.className = 'map-popup'
  const title = document.createElement('strong')
  title.textContent = `${marker.emoji} ${marker.title}`
  const info = document.createElement('span')
  info.textContent = `${marker.when} · ${marker.zone}`
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = 'Apri evento'
  button.addEventListener('click', () => onOpen(marker.eventId))
  box.append(title, info, button)
  return box
}
