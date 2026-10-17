import type { ParticipationRepository } from '../data/participationRepository'
import type { Participation } from '../domain/participation'

/** Punto d'ingresso per la schermata: iscrive l'utente (il motivo del rifiuto arriva come Error). */
export function joinEvent(participations: ParticipationRepository, eventId: string, uid: string): Promise<Participation> {
  return participations.join(eventId, uid)
}
