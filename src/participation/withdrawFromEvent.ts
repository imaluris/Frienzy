import type { ParticipationRepository } from '../data/participationRepository'

/** Punto d'ingresso per la schermata: l'utente si ritira dall'evento (o ritira la richiesta). */
export function withdrawFromEvent(participations: ParticipationRepository, eventId: string, uid: string): Promise<void> {
  return participations.withdraw(eventId, uid)
}
