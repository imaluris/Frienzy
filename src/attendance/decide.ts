import type { FrienzyEvent } from '../domain/event'
import type { Participation } from '../domain/participation'
import { RATING_LABELS, type NewRating, type Rating } from './types'

export type Decision = { ok: true } | { ok: false; reason: string }
const no = (reason: string): Decision => ({ ok: false, reason })

type EventInfo = Pick<FrienzyEvent, 'organizzatoreId' | 'stato' | 'dataOra'>

/** L'evento è già iniziato? Da quel momento si possono segnare le presenze e lasciare i voti. */
export const hasEnded = (event: Pick<FrienzyEvent, 'dataOra'>, now: Date) => event.dataOra.getTime() <= now.getTime()

interface PresenceInput {
  event: EventInfo | null
  actorUid: string
  /** La partecipazione della persona da segnare. */
  target: Pick<Participation, 'stato'> | null
  now: Date
}

/** Funzione pura: l'organizzatore può segnare la presenza di questa persona? (stessi vincoli delle regole Firestore) */
export function decideMarkPresence({ event, actorUid, target, now }: PresenceInput): Decision {
  if (!event) return no('Evento non trovato')
  if (event.organizzatoreId !== actorUid) return no('Solo chi organizza può segnare le presenze')
  if (event.stato === 'annullato') return no("L'evento è stato annullato")
  if (!hasEnded(event, now)) return no("Le presenze si segnano dopo l'inizio dell'evento")
  if (target?.stato !== 'confermato') return no('Si segnano solo i partecipanti confermati')
  return { ok: true }
}

interface RatingInput {
  event: EventInfo | null
  uid: string
  mine: Pick<Participation, 'stato'> | null
  existing: Rating | null
  rating: NewRating
  now: Date
}

/** Funzione pura: questa persona può votare l'evento? Un solo voto, solo dopo la data, solo se confermata. */
export function decideRating({ event, uid, mine, existing, rating, now }: RatingInput): Decision {
  if (!event) return no('Evento non trovato')
  if (event.stato === 'annullato') return no("L'evento è stato annullato")
  if (!hasEnded(event, now)) return no("Potrai votare dopo l'evento")
  if (event.organizzatoreId === uid) return no('Non puoi votare un evento che organizzi')
  if (mine?.stato !== 'confermato') return no('Possono votare solo i partecipanti confermati')
  if (existing) return no('Hai già votato questo evento')
  if (!Number.isInteger(rating.stelle) || rating.stelle < 1 || rating.stelle > 5) return no('Il voto va da 1 a 5 stelle')
  if (rating.etichetta !== '' && !RATING_LABELS.includes(rating.etichetta)) return no('Etichetta non valida')
  return { ok: true }
}
