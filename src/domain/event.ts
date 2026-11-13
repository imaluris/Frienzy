import type { EventTypeId } from './eventTypes'

export type EventStatus = 'aperto' | 'chiuso' | 'annullato'

// Evento salvato in events/{id}: contiene solo la zona APPROSSIMATA, visibile a tutti.
export interface FrienzyEvent {
  id: string
  organizzatoreId: string
  tipo: EventTypeId
  titolo: string
  descrizione: string
  dataOra: Date
  zonaNome: string
  latApprossimata: number
  lngApprossimata: number
  geohash: string
  maxPartecipanti: number
  richiedeApprovazione: boolean
  stato: EventStatus
  creatoIl: Date
  // Presenti solo dopo una modifica dell'organizzatore: quando e quali campi (serve per avvisare gli iscritti).
  modificatoIl?: Date
  modifiche?: EventChange[]
}

// Campi che l'organizzatore può cambiare dopo la pubblicazione.
export type EventChange = 'titolo' | 'descrizione' | 'dataOra' | 'maxPartecipanti'

// Cosa si può aggiornare con EventRepository.update.
export type EventChanges = Partial<NewEvent & Pick<FrienzyEvent, 'stato' | 'modificatoIl' | 'modifiche'>>

// Cosa serve per creare un evento: id, stato e data di creazione li assegna il repository.
export type NewEvent = Omit<FrienzyEvent, 'id' | 'stato' | 'creatoIl'>

// Luogo esatto: events/{id}/privato/luogo (lo leggono solo organizzatore e confermati).
export interface ExactPlace {
  indirizzo: string
  lat: number
  lng: number
}
