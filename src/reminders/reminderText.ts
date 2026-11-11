import type { FrienzyEvent } from '../domain/event'
import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import type { ReminderKind } from './types'

const timeLabel = (date: Date) => new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(date)

/** Testo del promemoria, con l'ora locale del telefono. Stessa voce del vecchio server, così non cambia nulla per chi lo riceve. */
export function reminderText(event: FrienzyEvent, kind: ReminderKind): { title: string; body: string } {
  const when = kind === '24h' ? `domani alle ${timeLabel(event.dataOra)}` : `tra circa due ore, alle ${timeLabel(event.dataOra)}`
  return { title: `${EVENT_TYPE_EMOJI[event.tipo]} ${event.titolo}`, body: `Ci vediamo ${when} (${event.zonaNome}).` }
}
