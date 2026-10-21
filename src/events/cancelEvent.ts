import type { EventRepository } from '../data/eventRepository'
import type { FrienzyEvent } from '../domain/event'
import { decideCancel } from './cancelDecision'

/** L'organizzatore annulla il suo evento: lo stato diventa 'annullato' (l'evento non si cancella). */
export async function cancelEvent(events: EventRepository, eventId: string, actorUid: string): Promise<FrienzyEvent> {
  const decision = decideCancel(await events.getById(eventId), actorUid)
  if (!decision.ok) throw new Error(decision.motivo)
  return events.update(eventId, { stato: 'annullato' })
}
