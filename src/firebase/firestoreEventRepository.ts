import { collection, doc, getDoc, getDocs, serverTimestamp, Timestamp, updateDoc, writeBatch } from 'firebase/firestore'
import type { EventRepository } from '../data/eventRepository'
import type { ExactPlace, FrienzyEvent, NewEvent } from '../domain/event'
import { db } from './app'
import { eventFromData, newEventToData, placeFromData, placeToData } from './converters'

type Changes = Partial<NewEvent & Pick<FrienzyEvent, 'stato'>>

export class FirestoreEventRepository implements EventRepository {
  async create(event: NewEvent, place: ExactPlace): Promise<FrienzyEvent> {
    const eventRef = doc(collection(db(), 'events')) // id generato da Firestore
    // Batch: evento pubblico e luogo esatto vengono scritti insieme o per niente.
    const batch = writeBatch(db())
    batch.set(eventRef, { ...newEventToData(event), stato: 'aperto', creatoIl: serverTimestamp() })
    batch.set(doc(eventRef, 'privato', 'luogo'), placeToData(place))
    await batch.commit()
    return this.mustGet(eventRef.id)
  }

  async getById(id: string): Promise<FrienzyEvent | null> {
    const snap = await getDoc(doc(db(), 'events', id))
    return snap.exists() ? eventFromData(id, snap.data()) : null
  }

  // Le regole di sicurezza decidono davvero: a chi non può leggere Firestore risponde "permission-denied",
  // che qui diventa null (nessuna differenza tra "non esiste" e "non puoi vederlo").
  async getExactPlace(eventId: string, viewerUid: string | null): Promise<ExactPlace | null> {
    if (!viewerUid) return null
    try {
      const snap = await getDoc(doc(db(), 'events', eventId, 'privato', 'luogo'))
      return snap.exists() ? placeFromData(snap.data()) : null
    } catch (error) {
      if ((error as { code?: string }).code === 'permission-denied') return null
      throw error
    }
  }

  async list(): Promise<FrienzyEvent[]> {
    const snap = await getDocs(collection(db(), 'events'))
    return snap.docs.map((d) => eventFromData(d.id, d.data()))
  }

  async update(id: string, changes: Changes): Promise<FrienzyEvent> {
    // Se cambia la data, va convertita in Timestamp come alla creazione.
    const data = changes.dataOra ? { ...changes, dataOra: Timestamp.fromDate(changes.dataOra) } : changes
    await updateDoc(doc(db(), 'events', id), data)
    return this.mustGet(id)
  }

  private async mustGet(id: string): Promise<FrienzyEvent> {
    const event = await this.getById(id)
    if (!event) throw new Error(`Evento non trovato: ${id}`)
    return event
  }
}
