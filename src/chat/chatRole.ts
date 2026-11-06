import type { EventRepository } from '../data/eventRepository'
import type { ParticipationRepository } from '../data/participationRepository'
import type { ChatRole } from './message'

/** Il ruolo di `uid` nella chat: organizzatore, confermato oppure nessuno (richiesta, rifiutato, uscito, estraneo). */
export async function chatRoleOf(
  events: Pick<EventRepository, 'getById'>,
  participations: Pick<ParticipationRepository, 'get'>,
  eventId: string,
  uid: string,
): Promise<ChatRole> {
  const event = await events.getById(eventId)
  if (!event) return 'nessuno'
  if (event.organizzatoreId === uid) return 'organizzatore'
  const mine = await participations.get(eventId, uid)
  return mine?.stato === 'confermato' ? 'confermato' : 'nessuno'
}
