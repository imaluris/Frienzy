import type { FrienzyEvent } from '../domain/event'
import type { Mine } from '../mine/buildMine'

/** Gli eventi che meritano un promemoria: quelli che organizzo e quelli a cui sono confermato (non richieste, rifiutati o lista d'attesa). */
export function reminderEvents(mine: Mine): FrienzyEvent[] {
  const confirmed = mine.joined.filter((j) => j.participation.stato === 'confermato').map((j) => j.event)
  return [...mine.organized, ...confirmed]
}
