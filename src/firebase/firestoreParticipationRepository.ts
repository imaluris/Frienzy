import { collectionGroup, doc, getDoc, getDocs, query, runTransaction, setDoc, updateDoc, where, collection } from 'firebase/firestore'
import type { ParticipationRepository } from '../data/participationRepository'
import type { Participation, ParticipationStatus } from '../domain/participation'
import { db } from './app'
import { decideJoin } from '../participation/joinDecision'
import { decideWithdraw } from '../participation/withdrawDecision'
import { decideWaitlist, waitlistPosition } from '../participation/waitlist'
import { decideResponse, type ResponseAction } from '../participation/responseDecision'
import { blockId } from './firestoreBlockRepository'
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
      // Blocco tra chi si iscrive e chi organizza, in un senso qualunque (blocchi/{chi}_{chi}).
      const organizer = eventSnap.exists() ? String(eventSnap.data().organizzatoreId) : ''
      const [blockOne, blockTwo] = await Promise.all([
        tx.get(doc(db(), 'blocchi', blockId(organizer, uid))),
        tx.get(doc(db(), 'blocchi', blockId(uid, organizer))),
      ])
      const decision = decideJoin({
        event: eventSnap.exists() ? eventFromData(eventId, eventSnap.data()) : null,
        uid,
        existing: existingSnap.exists() ? participationFromData(existingSnap.data()) : null,
        confermati: seatsSnap.exists() ? (seatsSnap.data().confermati as number) : 0,
        blocked: blockOne.exists() || blockTwo.exists(),
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

  // La coda d'attesa sta in events/{id}/contatori/attesa.coda (uid in ordine di arrivo): una query non è ammessa
  // in transazione, e la coda serve sia a dare la posizione sia a trovare chi promuovere.
  // Transazione: se la partecipazione era confermata, la cancellazione, il contatore e la promozione del primo
  // in lista avvengono insieme (se il primo sale a "confermato" il numero di posti occupati non cambia).
  async withdraw(eventId: string, uid: string): Promise<void> {
    const eventRef = doc(db(), 'events', eventId)
    const seatsRef = doc(eventRef, 'contatori', 'posti')
    const queueRef = doc(eventRef, 'contatori', 'attesa')
    await runTransaction(db(), async (tx) => {
      const [eventSnap, seatsSnap, queueSnap, partSnap] = await Promise.all([tx.get(eventRef), tx.get(seatsRef), tx.get(queueRef), tx.get(ref(eventId, uid))])
      const coda = queueSnap.exists() ? (queueSnap.data().coda as string[]) : []
      const mine = partSnap.exists() ? participationFromData(partSnap.data()) : null
      // Serve la partecipazione del primo in lista solo se chi esce occupava un posto.
      const firstSnap = mine?.stato === 'confermato' && coda[0] ? await tx.get(ref(eventId, coda[0])) : null
      const waiting = firstSnap?.exists() ? [participationFromData(firstSnap.data())] : []
      const decision = decideWithdraw({ participation: mine, event: eventSnap.exists() ? eventFromData(eventId, eventSnap.data()) : null, all: waiting })
      if (!decision.ok) throw new Error(decision.motivo)
      tx.delete(ref(eventId, uid))
      if (mine?.stato === 'inAttesa') tx.set(queueRef, { coda: coda.filter((u) => u !== uid) })
      const taken = seatsSnap.exists() ? (seatsSnap.data().confermati as number) : 0
      if (decision.promuovi) {
        tx.update(ref(eventId, decision.promuovi.uid), { stato: decision.promuovi.stato })
        tx.set(queueRef, { coda: coda.slice(1) })
        if (decision.promuovi.stato !== 'confermato') tx.set(seatsRef, { confermati: Math.max(0, taken - 1) })
      } else if (decision.liberaPosto && seatsSnap.exists()) {
        tx.set(seatsRef, { confermati: Math.max(0, taken - 1) })
      }
    })
  }

  // Transazione: coda e iscrizione 'inAttesa' si scrivono insieme, solo se l'evento è davvero pieno.
  async joinWaitlist(eventId: string, uid: string): Promise<Participation> {
    const eventRef = doc(db(), 'events', eventId)
    const seatsRef = doc(eventRef, 'contatori', 'posti')
    const queueRef = doc(eventRef, 'contatori', 'attesa')
    return runTransaction(db(), async (tx) => {
      const [eventSnap, seatsSnap, queueSnap, existingSnap] = await Promise.all([tx.get(eventRef), tx.get(seatsRef), tx.get(queueRef), tx.get(ref(eventId, uid))])
      const organizer = eventSnap.exists() ? String(eventSnap.data().organizzatoreId) : ''
      const [blockOne, blockTwo] = await Promise.all([
        tx.get(doc(db(), 'blocchi', blockId(organizer, uid))),
        tx.get(doc(db(), 'blocchi', blockId(uid, organizer))),
      ])
      const decision = decideWaitlist({
        event: eventSnap.exists() ? eventFromData(eventId, eventSnap.data()) : null,
        uid,
        existing: existingSnap.exists() ? participationFromData(existingSnap.data()) : null,
        confermati: seatsSnap.exists() ? (seatsSnap.data().confermati as number) : 0,
        blocked: blockOne.exists() || blockTwo.exists(),
      })
      if (!decision.ok) throw new Error(decision.motivo)
      const created: Participation = { eventId, uid, stato: 'inAttesa', creatoIl: new Date() }
      tx.set(ref(eventId, uid), participationToData(created))
      tx.set(queueRef, { coda: [...(queueSnap.exists() ? (queueSnap.data().coda as string[]) : []), uid] })
      return created
    })
  }

  // Posizione = indice nella coda + 1. Si costruiscono partecipazioni minime solo per riusare waitlistPosition.
  async waitlistPosition(eventId: string, uid: string): Promise<number | null> {
    const snap = await getDoc(doc(db(), 'events', eventId, 'contatori', 'attesa'))
    const coda = snap.exists() ? (snap.data().coda as string[]) : []
    const base = Date.now()
    return waitlistPosition(
      coda.map((u, i) => ({ eventId, uid: u, stato: 'inAttesa' as const, creatoIl: new Date(base + i) })),
      uid,
    )
  }
}
