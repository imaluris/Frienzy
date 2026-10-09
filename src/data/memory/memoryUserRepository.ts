import type { UserRepository } from '../userRepository'
import type { UserProfile } from '../../domain/user'

export class MemoryUserRepository implements UserRepository {
  private users = new Map<string, UserProfile>()

  async save(profile: UserProfile): Promise<void> {
    // Copia: così chi ha passato l'oggetto non può modificare i dati "salvati".
    this.users.set(profile.uid, { ...profile, interessi: [...profile.interessi] })
  }

  async getById(uid: string): Promise<UserProfile | null> {
    const found = this.users.get(uid)
    return found ? { ...found, interessi: [...found.interessi] } : null
  }
}
