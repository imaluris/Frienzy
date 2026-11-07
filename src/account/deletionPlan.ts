import type { FrienzyEvent } from '../domain/event'
import type { Participation } from '../domain/participation'
import { isUpcoming } from '../events/listing'

export interface DeletionPlan {
  /** Eventi che organizzo e che sono ancora da fare: vanno annullati. */
  eventsToCancel: string[]
  /** Eventi dove ho scritto messaggi e dove posso ancora cancellarli (li organizzo o sono confermato). */
  chatEventIds: string[]
  /** Eventi di cui ho una partecipazione (richiesta, confermata o rifiutata): ci si ritira. */
  withdrawEventIds: string[]
}

interface Input {
  uid: string
  events: readonly FrienzyEvent[]
  participations: readonly Participation[]
  now: Date
}

/**
 * Decide COSA toccare per eliminare un account, senza toccare nulla (funzione pura).
 * Gli eventi passati o già annullati non si toccano: restano come storico. Si ricalcola a ogni tentativo,
 * quindi riprovare dopo un errore a metà non rifà quello che è già stato fatto.
 */
export function planDeletion({ uid, events, participations, now }: Input): DeletionPlan {
  const organized = events.filter((e) => e.organizzatoreId === uid)
  const mine = participations.filter((p) => p.uid === uid)
  const chat = new Set([...organized.map((e) => e.id), ...mine.filter((p) => p.stato === 'confermato').map((p) => p.eventId)])
  return {
    eventsToCancel: organized.filter((e) => isUpcoming(e, now)).map((e) => e.id),
    chatEventIds: [...chat],
    withdrawEventIds: mine.map((p) => p.eventId),
  }
}
