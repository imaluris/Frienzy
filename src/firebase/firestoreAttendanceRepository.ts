import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, type DocumentData, type Timestamp } from 'firebase/firestore'
import type { EventRepository } from '../data/eventRepository'
import type { ParticipationRepository } from '../data/participationRepository'
import type { AttendanceRepository } from '../attendance/attendanceRepository'
import { decideMarkPresence, decideRating } from '../attendance/decide'
import { docId, type NewRating, type Presence, type PresenceStatus, type Rating } from '../attendance/types'
import { db } from './app'

// presenze/{evento}_{uid} e valutazioni/{evento}_{uid}. I controlli sono fatti due volte: qui (messaggi chiari) e nelle regole (sicurezza vera).
const toPresence = (d: DocumentData): Presence => ({
  eventId: d.eventId, uid: d.uid, organizzatoreId: d.organizzatoreId, stato: d.stato, segnatoIl: (d.segnatoIl as Timestamp).toDate(),
})
const toRating = (d: DocumentData): Rating => ({
  eventId: d.eventId, uid: d.uid, organizzatoreId: d.organizzatoreId, stelle: d.stelle, etichetta: d.etichetta, creatoIl: (d.creatoIl as Timestamp).toDate(),
})

export class FirestoreAttendanceRepository implements AttendanceRepository {
  constructor(private events: Pick<EventRepository, 'getById'>, private participations: Pick<ParticipationRepository, 'get'>) {}

  async markPresence(eventId: string, actorUid: string, uid: string, stato: PresenceStatus): Promise<Presence> {
    const event = await this.events.getById(eventId)
    const target = await this.participations.get(eventId, uid)
    const decision = decideMarkPresence({ event, actorUid, target, now: new Date() })
    if (!decision.ok) throw new Error(decision.reason)
    const ref = doc(db(), 'presenze', docId(eventId, uid))
    await setDoc(ref, { eventId, uid, organizzatoreId: actorUid, stato, segnatoIl: serverTimestamp() })
    return toPresence((await getDoc(ref)).data() as DocumentData)
  }

  async listPresenceByEvent(eventId: string): Promise<Presence[]> {
    const snap = await getDocs(query(collection(db(), 'presenze'), where('eventId', '==', eventId)))
    return snap.docs.map((d) => toPresence(d.data()))
  }

  async listPresenceByUser(uid: string): Promise<Presence[]> {
    const snap = await getDocs(query(collection(db(), 'presenze'), where('uid', '==', uid)))
    return snap.docs.map((d) => toPresence(d.data()))
  }

  async rate(eventId: string, uid: string, rating: NewRating): Promise<Rating> {
    const event = await this.events.getById(eventId)
    const mine = await this.participations.get(eventId, uid)
    const existing = await this.getRating(eventId, uid)
    const decision = decideRating({ event, uid, mine, existing, rating, now: new Date() })
    if (!decision.ok || !event) throw new Error(decision.ok ? 'Evento non trovato' : decision.reason)
    const ref = doc(db(), 'valutazioni', docId(eventId, uid))
    await setDoc(ref, { eventId, uid, organizzatoreId: event.organizzatoreId, stelle: rating.stelle, etichetta: rating.etichetta, creatoIl: serverTimestamp() })
    return toRating((await getDoc(ref)).data() as DocumentData)
  }

  async getRating(eventId: string, uid: string): Promise<Rating | null> {
    const snap = await getDoc(doc(db(), 'valutazioni', docId(eventId, uid)))
    return snap.exists() ? toRating(snap.data()) : null
  }

  async listRatingsForOrganizer(organizerUid: string): Promise<Rating[]> {
    const snap = await getDocs(query(collection(db(), 'valutazioni'), where('organizzatoreId', '==', organizerUid)))
    return snap.docs.map((d) => toRating(d.data()))
  }
}
