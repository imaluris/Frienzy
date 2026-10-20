import type { EventTypeId } from '../domain/eventTypes'
import type { UserProfile } from '../domain/user'
import { calculateAge } from '../profile/age'

export type PersonRole = 'organizzatore' | 'partecipante'

// Ciò che si può mostrare di una persona nell'evento. Non c'è la data di nascita: solo l'età.
export interface PublicProfile {
  uid: string
  nome: string
  eta: number
  bio: string
  interessi: EventTypeId[]
  fotoUrl: string
  ruolo: PersonRole
}

/** Dal profilo completo a quello pubblico: la data di nascita diventa l'età e poi sparisce. */
export function toPublicProfile(profile: UserProfile, ruolo: PersonRole, today: Date = new Date()): PublicProfile {
  return {
    uid: profile.uid,
    nome: profile.nome,
    eta: calculateAge(profile.dataNascita, today),
    bio: profile.bio,
    interessi: [...profile.interessi],
    fotoUrl: profile.fotoUrl,
    ruolo,
  }
}
