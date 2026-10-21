import type { EventRepository } from '../data/eventRepository'
import type { ParticipationRepository } from '../data/participationRepository'
import { buildMine, type Mine } from './buildMine'

/** Carica i miei eventi e le mie iscrizioni (due letture in parallelo, poi la funzione pura). */
export async function loadMine(
  events: Pick<EventRepository, 'list'>,
  participations: Pick<ParticipationRepository, 'listByUser'>,
  uid: string,
): Promise<Mine> {
  const [all, mine] = await Promise.all([events.list(), participations.listByUser(uid)])
  return buildMine(all, mine, uid)
}
