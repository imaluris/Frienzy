import type { ParticipationRepository } from '../participationRepository'
import type { Participation, ParticipationStatus } from '../../domain/participation'

export class MemoryParticipationRepository implements ParticipationRepository {
  private items = new Map<string, Participation>()

  constructor(private now: () => Date = () => new Date()) {}

  // Stessa forma del percorso Firestore: evento + utente identificano la partecipazione.
  private key(eventId: string, uid: string): string {
    return `${eventId}/${uid}`
  }

  async add(eventId: string, uid: string, stato: ParticipationStatus): Promise<Participation> {
    const key = this.key(eventId, uid)
    if (this.items.has(key)) throw new Error('Già iscritto a questo evento')
    const created: Participation = { eventId, uid, stato, creatoIl: this.now() }
    this.items.set(key, created)
    return { ...created }
  }

  async get(eventId: string, uid: string): Promise<Participation | null> {
    const found = this.items.get(this.key(eventId, uid))
    return found ? { ...found } : null
  }

  async listByEvent(eventId: string): Promise<Participation[]> {
    return [...this.items.values()].filter((p) => p.eventId === eventId).map((p) => ({ ...p }))
  }

  async listByUser(uid: string): Promise<Participation[]> {
    return [...this.items.values()].filter((p) => p.uid === uid).map((p) => ({ ...p }))
  }

  async setStatus(eventId: string, uid: string, stato: ParticipationStatus): Promise<Participation> {
    const current = this.items.get(this.key(eventId, uid))
    if (!current) throw new Error('Partecipazione non trovata')
    const updated = { ...current, stato }
    this.items.set(this.key(eventId, uid), updated)
    return { ...updated }
  }
}
