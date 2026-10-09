import type { Participation, ParticipationStatus } from '../domain/participation'

export interface ParticipationRepository {
  /** Crea la partecipazione; errore se questo utente è già iscritto all'evento. */
  add(eventId: string, uid: string, stato: ParticipationStatus): Promise<Participation>
  get(eventId: string, uid: string): Promise<Participation | null>
  listByEvent(eventId: string): Promise<Participation[]>
  listByUser(uid: string): Promise<Participation[]>
  /** Cambia lo stato; errore se la partecipazione non esiste. */
  setStatus(eventId: string, uid: string, stato: ParticipationStatus): Promise<Participation>
}
