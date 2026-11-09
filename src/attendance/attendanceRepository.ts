import type { NewRating, Presence, PresenceStatus, Rating } from './types'

export interface AttendanceRepository {
  /** L'organizzatore (`actorUid`) segna `uid` presente o assente; si può correggere. Errore con il motivo se non è possibile (vedi decideMarkPresence). */
  markPresence(eventId: string, actorUid: string, uid: string, stato: PresenceStatus): Promise<Presence>
  listPresenceByEvent(eventId: string): Promise<Presence[]>
  listPresenceByUser(uid: string): Promise<Presence[]>
  /** `uid` vota l'evento: una sola volta. Errore con il motivo se non è possibile (vedi decideRating). */
  rate(eventId: string, uid: string, rating: NewRating): Promise<Rating>
  getRating(eventId: string, uid: string): Promise<Rating | null>
  /** I voti ricevuti dagli eventi di `organizerUid`: li legge solo lui. */
  listRatingsForOrganizer(organizerUid: string): Promise<Rating[]>
}
