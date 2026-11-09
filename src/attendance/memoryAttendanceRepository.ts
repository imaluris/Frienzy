import type { EventRepository } from '../data/eventRepository'
import type { ParticipationRepository } from '../data/participationRepository'
import type { AttendanceRepository } from './attendanceRepository'
import { decideMarkPresence, decideRating } from './decide'
import { docId, type NewRating, type Presence, type PresenceStatus, type Rating } from './types'

// Versione in memoria (test e demo): stesse regole di decideMarkPresence / decideRating.
export class MemoryAttendanceRepository implements AttendanceRepository {
  private presences = new Map<string, Presence>()
  private ratings = new Map<string, Rating>()

  constructor(
    private events: Pick<EventRepository, 'getById'>,
    private participations: Pick<ParticipationRepository, 'get'>,
    private now: () => Date = () => new Date(),
  ) {}

  async markPresence(eventId: string, actorUid: string, uid: string, stato: PresenceStatus): Promise<Presence> {
    const event = await this.events.getById(eventId)
    const target = await this.participations.get(eventId, uid)
    const decision = decideMarkPresence({ event, actorUid, target, now: this.now() })
    if (!decision.ok) throw new Error(decision.reason)
    const presence: Presence = { eventId, uid, organizzatoreId: actorUid, stato, segnatoIl: this.now() }
    this.presences.set(docId(eventId, uid), presence)
    return { ...presence }
  }

  async listPresenceByEvent(eventId: string): Promise<Presence[]> {
    return [...this.presences.values()].filter((p) => p.eventId === eventId).map((p) => ({ ...p }))
  }

  async listPresenceByUser(uid: string): Promise<Presence[]> {
    return [...this.presences.values()].filter((p) => p.uid === uid).map((p) => ({ ...p }))
  }

  async rate(eventId: string, uid: string, rating: NewRating): Promise<Rating> {
    const event = await this.events.getById(eventId)
    const mine = await this.participations.get(eventId, uid)
    const existing = this.ratings.get(docId(eventId, uid)) ?? null
    const decision = decideRating({ event, uid, mine, existing, rating, now: this.now() })
    if (!decision.ok || !event) throw new Error(decision.ok ? 'Evento non trovato' : decision.reason)
    const saved: Rating = { eventId, uid, organizzatoreId: event.organizzatoreId, ...rating, creatoIl: this.now() }
    this.ratings.set(docId(eventId, uid), saved)
    return { ...saved }
  }

  async getRating(eventId: string, uid: string): Promise<Rating | null> {
    const found = this.ratings.get(docId(eventId, uid))
    return found ? { ...found } : null
  }

  async listRatingsForOrganizer(organizerUid: string): Promise<Rating[]> {
    return [...this.ratings.values()].filter((r) => r.organizzatoreId === organizerUid).map((r) => ({ ...r }))
  }
}
