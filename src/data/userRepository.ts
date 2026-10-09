import type { UserProfile } from '../domain/user'

// Contratto per leggere/scrivere profili. Chi lo usa non sa se dietro c'è Firebase o la memoria.
export interface UserRepository {
  /** Crea o sostituisce il profilo con questo uid. */
  save(profile: UserProfile): Promise<void>
  /** Restituisce il profilo, oppure null se non esiste. */
  getById(uid: string): Promise<UserProfile | null>
}
