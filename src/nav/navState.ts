// Stato della navigazione: una scheda attiva e, sopra, al massimo una schermata aperta (dettaglio, debug, modifica profilo).
// Sono funzioni pure: non toccano React, quindi si provano con test semplici.

export type Tab = 'eventi' | 'mappa' | 'crea' | 'miei' | 'profilo'

export type Overlay =
  | { kind: 'none' }
  | { kind: 'event'; id: string }
  | { kind: 'debug' }
  | { kind: 'edit' }

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
export const goBack = (nav: Nav): Nav => ({ ...nav, overlay: { kind: 'none' } })

export const canGoBack = (nav: Nav): boolean => nav.overlay.kind !== 'none'

// La schermata Eventi ha una testata tutta sua (logo e saluto): niente barra del titolo.
export const showsAppHeader = (nav: Nav): boolean => !(nav.tab === 'eventi' && nav.overlay.kind === 'none')

// Titolo mostrato nell'intestazione.
export function titleOf(nav: Nav): string {
  switch (nav.overlay.kind) {
    case 'event': return 'Evento'
    case 'debug': return 'Debug'
    case 'edit': return 'Modifica profilo'
    default: return nav.tab === 'eventi' ? 'Eventi in programma' : nav.tab === 'crea' ? 'Crea un evento' : TAB_LABEL[nav.tab]
  }
}
