import type { PositionState } from '../filters/useMyPosition'

/** Messaggio da mostrare sotto la mappa in base allo stato della posizione, oppure null. */
export function positionMessage(state: PositionState): string | null {
  switch (state.status) {
    case 'asking': return 'Cerco la tua posizione…'
    case 'denied': return 'Non riesco a leggere la tua posizione: controlla i permessi del telefono.'
    case 'settings': return "Ho aperto le impostazioni dell'app: concedi la posizione a Frienzy, poi torna qui e riprova."
    case 'services': return 'La posizione del telefono è spenta: ho aperto le impostazioni, attivala e riprova.'
    case 'unsupported': return 'Questo dispositivo non permette di leggere la posizione.'
    default: return null
  }
}
