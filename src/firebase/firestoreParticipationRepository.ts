import { collectionGroup, doc, getDoc, getDocs, query, setDoc, updateDoc, where, collection } from 'firebase/firestore'
import type { ParticipationRepository } from '../data/participationRepository'
import type { Participation, ParticipationStatus } from '../domain/participation'
import { db } from './app'
import { participationFromData, participationToData } from './converters'

const ref = (eventId: string, uid: string) => doc(db(), 'events', eventId, 'partecipanti', uid)

export class FirestoreParticipationRepository implements ParticipationRepository {
  async add(eventId: string, uid: string, stato: ParticipationStatus): Promise<Participation> {
    if (await this.get(eventId, uid)) throw new Error('Già iscritto a questo evento')
    const created: Participation = { eventId, uid, stato, creatoIl: new Date() }
    await setDoc(ref(eventId, uid), participationToData(created))
    return created
  }

  async get(eventId: string, uid: string): Promise<Participation | null> {
    const snap = await getDoc(ref(eventId, uid))
    return snap.exists() ? participationFromData(snap.data()) : null
  }

  async listByEvent(eventId: string): Promise<Participation[]> {
    const snap = await getDocs(collection(db(), 'events', eventId, 'partecipanti'))
    return snap.docs.map((d) => participationFromData(d.data()))
  }

  // collectionGroup: cerca nella sotto-raccolta "partecipanti" di TUTTI gli eventi.
  async listByUser(uid: string): Promise<Participation[]> {
    const snap = await getDocs(query(collectionGroup(db(), 'partecipanti'), where('uid', '==', uid)))
    return snap.docs.map((d) => participationFromData(d.data()))
  }

  async setStatus(eventId: string, uid: string, stato: ParticipationStatus): Promise<Participation> {
    await updateDoc(ref(eventId, uid), { stato })
    const updated = await this.get(eventId, uid)
    if (!updated) throw new Error('Partecipazione non trovata')
    return updated
  }
}
