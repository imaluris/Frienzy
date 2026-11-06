import type { Nav } from './navState'

// Chiave della schermata mostrata: quando cambia, React rimonta il contenitore e riparte l'animazione di entrata.
export function screenKey(nav: Nav): string {
  const o = nav.overlay
  if (o.kind === 'none') return `tab:${nav.tab}`
  return o.kind === 'event' || o.kind === 'chat' ? `${o.kind}:${o.id}` : o.kind
}

// Una schermata aperta sopra (dettaglio, modifica) entra scorrendo da destra; il cambio di scheda è una dissolvenza.
export const transitionKind = (nav: Nav): 'push' | 'tab' => (nav.overlay.kind === 'none' ? 'tab' : 'push')
