import type { EventRepository } from '../eventRepository'
import type { ParticipationRepository } from '../participationRepository'
import { decideJoin } from '../../participation/joinDecision'
import { decideWithdraw } from '../../participation/withdrawDecision'
import { decideResponse, type ResponseAction } from '../../participation/responseDecision'
import type { Participation, ParticipationStatus } from '../../domain/participation'

export class MemoryParticipationRepository implements ParticipationRepository {
  private items = new Map<string, Participation>()

  constructor(
    private events: Pick<EventRepository, 'getById'> | null = null,
    private now: () => Date = () => new Date(),
  ) {}

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

  async listConfirmed(eventId: string): Promise<Participation[]> {
    return (await this.listByEvent(eventId)).filter((p) => p.stato === 'confermato')
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

  // Atomico perché, dopo l'unico await (la lettura dell'evento), controllo e scrittura
  // avvengono nello stesso passo di JavaScript: nessun'altra iscrizione può infilarsi in mezzo.
  async join(eventId: string, uid: string): Promise<Participation> {
    if (!this.events) throw new Error('Repository degli eventi non collegato')
    const event = await this.events.getById(eventId)
    const confermati = [...this.items.values()].filter((p) => p.eventId === eventId && p.stato === 'confermato').length
    const decision = decideJoin({ event, uid, existing: this.items.get(this.key(eventId, uid)) ?? null, confermati })
    if (!decision.ok) throw new Error(decision.motivo)
    return this.add(eventId, uid, decision.stato)
  }

  // Atomico come join: dopo l'unico await controllo e scrittura stanno nello stesso passo.
  async respond(eventId: string, uid: string, actorUid: string, azione: ResponseAction): Promise<Participation> {
    if (!this.events) throw new Error('Repository degli eventi non collegato')
    const event = await this.events.getById(eventId)
    const confermati = [...this.items.values()].filter((p) => p.eventId === eventId && p.stato === 'confermato').length
    const participation = this.items.get(this.key(eventId, uid)) ?? null
    const decision = decideResponse({ event, actorUid, participation, confermati, azione })
    if (!decision.ok) throw new Error(decision.motivo)
    return this.setStatus(eventId, uid, decision.stato)
  }

  // Il contatore dei posti in memoria è sempre contato dalle partecipazioni: togliere la riga libera il posto.
  async withdraw(eventId: string, uid: string): Promise<void> {
    const decision = decideWithdraw(this.items.get(this.key(eventId, uid)) ?? null)
    if (!decision.ok) throw new Error(decision.motivo)
    this.items.delete(this.key(eventId, uid))
  }
}
