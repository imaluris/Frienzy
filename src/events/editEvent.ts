import type { EventRepository } from '../data/eventRepository'
import type { ParticipationRepository } from '../data/participationRepository'
import type { FrienzyEvent } from '../domain/event'
import { canEdit, diffEdit, validateEdit, type EditInput } from './editRules'

/**
 * L'organizzatore modifica titolo, descrizione, data e posti. Convalida, scrive solo ciò che è cambiato e
 * segna quando e cosa (`modificatoIl`, `modifiche`): gli iscritti lo vedono come avviso. Lancia un Error con il messaggio da mostrare.
 */
export async function editEvent(
  ports: { events: EventRepository; participations: ParticipationRepository },
  eventId: string,
  actorUid: string,
  input: EditInput,
  now: Date = new Date(),
): Promise<FrienzyEvent> {
  const event = await ports.events.getById(eventId)
  if (!event) throw new Error('Evento non trovato')
  const allowed = canEdit(event, actorUid, now)
  if (!allowed.ok) throw new Error(allowed.motivo)
  const confirmed = (await ports.participations.listByEvent(eventId)).filter((p) => p.stato === 'confermato').length
  const problem = validateEdit(input, confirmed, now)
  if (problem) throw new Error(problem)
  const { values, changed } = diffEdit(event, input)
  if (changed.length === 0) return event // niente da salvare e nessun avviso inutile
  return ports.events.update(eventId, { ...values, modificatoIl: now, modifiche: changed })
}
