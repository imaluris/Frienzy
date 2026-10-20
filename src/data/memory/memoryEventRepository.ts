import type { EventRepository } from '../eventRepository'
import type { ExactPlace, FrienzyEvent, NewEvent } from '../../domain/event'
import type { Participation } from '../../domain/participation'
import { canSeeExactPlace } from '../../place/placeAccess'

// Come trovare la partecipazione di un utente (fornita da chi assembla i servizi).
export type ParticipationLookup = (eventId: string, uid: string) => Promise<Participation | null>

export class MemoryEventRepository implements EventRepository {
  private events = new Map<string, FrienzyEvent>()
  private places = new Map<string, ExactPlace>()

  constructor(
    private newId: () => string = () => crypto.randomUUID(),
    private now: () => Date = () => new Date(),
    private findParticipation: ParticipationLookup = async () => null,
  ) {}

  async create(event: NewEvent, place: ExactPlace): Promise<FrienzyEvent> {
    const created: FrienzyEvent = { ...event, id: this.newId(), stato: 'aperto', creatoIl: this.now() }
    this.events.set(created.id, created)
    this.places.set(created.id, place)
    return { ...created }
  }

  async getById(id: string): Promise<FrienzyEvent | null> {
    const found = this.events.get(id)
    return found ? { ...found } : null
  }

  async getExactPlace(eventId: string, viewerUid: string | null): Promise<ExactPlace | null> {
    const event = this.events.get(eventId)
    const place = this.places.get(eventId)
    if (!event || !place) return null
    const participation = viewerUid ? await this.findParticipation(eventId, viewerUid) : null
    return canSeeExactPlace(event, viewerUid, participation) ? { ...place } : null
  }

  async list(): Promise<FrienzyEvent[]> {
    return [...this.events.values()].map((e) => ({ ...e }))
  }

  async update(id: string, changes: Partial<NewEvent & Pick<FrienzyEvent, 'stato'>>): Promise<FrienzyEvent> {
    const current = this.events.get(id)
    if (!current) throw new Error(`Evento non trovato: ${id}`)
    const updated = { ...current, ...changes }
    this.events.set(id, updated)
    return { ...updated }
  }
}
