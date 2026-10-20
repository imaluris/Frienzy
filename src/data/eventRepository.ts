import type { ExactPlace, FrienzyEvent, NewEvent } from '../domain/event'

export interface EventRepository {
  /** Crea l'evento (stato 'aperto') e il suo luogo esatto; restituisce l'evento con id. */
  create(event: NewEvent, place: ExactPlace): Promise<FrienzyEvent>
  getById(id: string): Promise<FrienzyEvent | null>
  /**
   * Luogo esatto, solo se `viewerUid` è l'organizzatore o un partecipante confermato; altrimenti null.
   * Gli altri ricevono null (non un errore): non devono nemmeno capire se il luogo esiste.
   */
  getExactPlace(eventId: string, viewerUid: string | null): Promise<ExactPlace | null>
  /** Tutti gli eventi, senza filtri (i filtri sono funzioni pure a parte). */
  list(): Promise<FrienzyEvent[]>
  /** Aggiorna i campi indicati; errore se l'evento non esiste. */
  update(id: string, changes: Partial<NewEvent & Pick<FrienzyEvent, 'stato'>>): Promise<FrienzyEvent>
}
