import type { EventTypeId } from './eventTypes'

// Profilo salvato in users/{uid}. L'età NON si salva: si calcola dalla data di nascita.
export interface UserProfile {
  uid: string
  nome: string
  dataNascita: Date
  bio: string
  interessi: EventTypeId[]
  fotoUrl: string
  creatoIl: Date
}
