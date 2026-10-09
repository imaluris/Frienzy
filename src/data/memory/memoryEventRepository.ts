import type { EventRepository } from '../eventRepository'
import type { ExactPlace, FrienzyEvent, NewEvent } from '../../domain/event'

export class MemoryEventRepository implements EventRepository {
  private events = new Map<string, FrienzyEvent>()
  private places = new Map<string, ExactPlace>()

  constructor(
    private newId: () => string = () => crypto.randomUUID(),
    private now: () => Date = () => new Date(),
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
