import type { PositionState } from '../filters/useMyPosition'

/** Messaggio da mostrare sotto la mappa in base allo stato della posizione, oppure null. */
export function positionMessage(state: PositionState): string | null {
  switch (state.status) {
    case 'asking': return 'Cerco la tua posizione…'
    case 'denied': return 'Non riesco a leggere la tua posizione: controlla i permessi del telefono.'
    case 'unsupported': return 'Questo dispositivo non permette di leggere la posizione.'
    default: return null
  }
}
