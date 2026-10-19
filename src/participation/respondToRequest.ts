import type { ParticipationRepository } from '../data/participationRepository'
import type { Participation } from '../domain/participation'
import type { ResponseAction } from './responseDecision'

/** Punto d'ingresso per la schermata: l'organizzatore accetta o rifiuta la richiesta di `uid`. */
export function respondToRequest(
  participations: ParticipationRepository,
  eventId: string,
  uid: string,
  organizerUid: string,
  azione: ResponseAction,
): Promise<Participation> {
  return participations.respond(eventId, uid, organizerUid, azione)
}
