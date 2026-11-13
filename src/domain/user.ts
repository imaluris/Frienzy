import type { Consent } from '../legal/consent'
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
  /** Accettazione di termini e privacy con data e versione; manca nei profili creati prima del task 43. */
  consenso?: Consent
}
