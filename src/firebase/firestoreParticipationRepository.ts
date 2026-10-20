import { collectionGroup, doc, getDoc, getDocs, query, runTransaction, setDoc, updateDoc, where, collection } from 'firebase/firestore'
import type { ParticipationRepository } from '../data/participationRepository'
import type { Participation, ParticipationStatus } from '../domain/participation'
import { db } from './app'
import { decideJoin } from '../participation/joinDecision'
import { decideResponse, type ResponseAction } from '../participation/responseDecision'
import { eventFromData, participationFromData, participationToData } from './converters'

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

  async listConfirmed(eventId: string): Promise<Participation[]> {
    const q = query(collection(db(), 'events', eventId, 'partecipanti'), where('stato', '==', 'confermato'))
    const snap = await getDocs(q)
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

  // Transazione: Firestore rilegge e riprova se qualcun altro scrive nel frattempo,
  // quindi leggere il contatore e scriverlo +1 non può far superare i posti.
  // Il numero di confermati sta in events/{id}/contatori/posti (una query non è ammessa in transazione).
  async join(eventId: string, uid: string): Promise<Participation> {
    const eventRef = doc(db(), 'events', eventId)
    const seatsRef = doc(eventRef, 'contatori', 'posti')
    return runTransaction(db(), async (tx) => {
      const [eventSnap, seatsSnap, existingSnap] = await Promise.all([
        tx.get(eventRef),
        tx.get(seatsRef),
        tx.get(ref(eventId, uid)),
      ])
      const decision = decideJoin({
        event: eventSnap.exists() ? eventFromData(eventId, eventSnap.data()) : null,
        uid,
        existing: existingSnap.exists() ? participationFromData(existingSnap.data()) : null,
        confermati: seatsSnap.exists() ? (seatsSnap.data().confermati as number) : 0,
      })
      if (!decision.ok) throw new Error(decision.motivo)
      const created: Participation = { eventId, uid, stato: decision.stato, creatoIl: new Date() }
      tx.set(ref(eventId, uid), participationToData(created))
      // Solo chi occupa un posto fa salire il contatore.
      if (decision.stato === 'confermato') {
        tx.set(seatsRef, { confermati: (seatsSnap.exists() ? (seatsSnap.data().confermati as number) : 0) + 1 })
      }
      return created
    })
  }

  // Transazione: legge evento, richiesta e contatore; se si accetta, stato e contatore +1 si scrivono insieme.
  async respond(eventId: string, uid: string, actorUid: string, azione: ResponseAction): Promise<Participation> {
    const eventRef = doc(db(), 'events', eventId)
    const seatsRef = doc(eventRef, 'contatori', 'posti')
    return runTransaction(db(), async (tx) => {
      const [eventSnap, seatsSnap, partSnap] = await Promise.all([tx.get(eventRef), tx.get(seatsRef), tx.get(ref(eventId, uid))])
      const confermati = seatsSnap.exists() ? (seatsSnap.data().confermati as number) : 0
      const participation = partSnap.exists() ? participationFromData(partSnap.data()) : null
      const decision = decideResponse({
        event: eventSnap.exists() ? eventFromData(eventId, eventSnap.data()) : null,
        actorUid,
        participation,
        confermati,
        azione,
      })
      if (!decision.ok || !participation) throw new Error(decision.ok ? 'Richiesta non trovata' : decision.motivo)
      tx.update(ref(eventId, uid), { stato: decision.stato })
      if (decision.stato === 'confermato') tx.set(seatsRef, { confermati: confermati + 1 })
      return { ...participation, stato: decision.stato }
    })
  }
}
