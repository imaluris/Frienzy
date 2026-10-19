import type { Participation, ParticipationStatus } from '../domain/participation'
import type { ResponseAction } from '../participation/responseDecision'

export interface ParticipationRepository {
  /** Crea la partecipazione; errore se questo utente è già iscritto all'evento. */
  add(eventId: string, uid: string, stato: ParticipationStatus): Promise<Participation>
  get(eventId: string, uid: string): Promise<Participation | null>
  listByEvent(eventId: string): Promise<Participation[]>
  listByUser(uid: string): Promise<Participation[]>
  /** Cambia lo stato; errore se la partecipazione non esiste. */
  setStatus(eventId: string, uid: string, stato: ParticipationStatus): Promise<Participation>
  /**
   * Iscrive l'utente applicando la regola dei posti (vedi decideJoin) in modo ATOMICO:
   * controllo e scrittura sono un'unica operazione, quindi l'ultimo posto non si prende due volte.
   * Errore con il motivo se l'iscrizione non è possibile.
   */
  join(eventId: string, uid: string): Promise<Participation>
  /**
   * L'organizzatore (`actorUid`) accetta o rifiuta la richiesta di `uid`, in modo ATOMICO
   * (vedi decideResponse): accettare occupa un posto e non può superare il massimo.
   * Errore con il motivo se non è possibile.
   */
  respond(eventId: string, uid: string, actorUid: string, azione: ResponseAction): Promise<Participation>
}
