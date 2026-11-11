// Stato della navigazione: una scheda attiva e, sopra, al massimo una schermata aperta (dettaglio, debug, modifica profilo).
// Sono funzioni pure: non toccano React, quindi si provano con test semplici.

export type Tab = 'eventi' | 'mappa' | 'crea' | 'miei' | 'profilo'

export type Overlay =
  | { kind: 'none' }
  | { kind: 'event'; id: string }
  | { kind: 'chat'; id: string }
  | { kind: 'debug' }
  | { kind: 'edit' }
  | { kind: 'alerts' }

export interface Nav {
  tab: Tab
  overlay: Overlay
}

export const START: Nav = { tab: 'eventi', overlay: { kind: 'none' } }

export const TAB_LABEL: Record<Tab, string> = {
  eventi: 'Eventi',
  mappa: 'Mappa',
  crea: 'Crea',
  miei: 'I miei eventi',
  profilo: 'Profilo',
}

// Toccare una scheda chiude sempre la schermata aperta sopra.
export const selectTab = (tab: Tab): Nav => ({ tab, overlay: { kind: 'none' } })

export const openEvent = (nav: Nav, id: string): Nav => ({ ...nav, overlay: { kind: 'event', id } })
export const openDebug = (nav: Nav): Nav => ({ ...nav, overlay: { kind: 'debug' } })
export const openEdit = (nav: Nav): Nav => ({ ...nav, overlay: { kind: 'edit' } })
export const openAlerts = (nav: Nav): Nav => ({ ...nav, overlay: { kind: 'alerts' } })
export const openChat = (nav: Nav, id: string): Nav => ({ ...nav, overlay: { kind: 'chat', id } })
// Dalla chat si torna all'evento; da ogni altra schermata alla scheda.
export const goBack = (nav: Nav): Nav => ({ ...nav, overlay: nav.overlay.kind === 'chat' ? { kind: 'event', id: nav.overlay.id } : { kind: 'none' } })

export const canGoBack = (nav: Nav): boolean => nav.overlay.kind !== 'none'

// Eventi (logo e saluto), mappa (a tutto schermo) e dettaglio evento (copertina) hanno una testata tutta loro: niente barra del titolo.
export const showsAppHeader = (nav: Nav): boolean => nav.overlay.kind !== 'event' && nav.overlay.kind !== 'chat' && !((nav.tab === 'eventi' || nav.tab === 'mappa') && nav.overlay.kind === 'none')

// Il dettaglio evento ha la sua barra azione in basso (e una barra in alto sulla copertina): niente barra a schede.
export const showsTabBar = (nav: Nav): boolean => nav.overlay.kind !== 'event' && nav.overlay.kind !== 'chat'

// Titolo mostrato nell'intestazione.
export function titleOf(nav: Nav): string {
  switch (nav.overlay.kind) {
    case 'event': return 'Evento'
    case 'chat': return 'Chat'
    case 'debug': return 'Debug'
    case 'edit': return 'Modifica profilo'
    case 'alerts': return 'Avvisi'
    default: return nav.tab === 'eventi' ? 'Eventi in programma' : nav.tab === 'crea' ? 'Crea un evento' : TAB_LABEL[nav.tab]
  }
}
