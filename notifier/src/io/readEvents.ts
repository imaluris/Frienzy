import { Timestamp, type DocumentData, type Firestore } from 'firebase-admin/firestore'
import type { EventLite, PartLite } from '../logic/types'

const toDate = (value: unknown): Date => (value instanceof Timestamp ? value.toDate() : new Date(0))

export function toEvent(id: string, data: DocumentData): EventLite {
  return {
    id, titolo: String(data.titolo ?? ''), tipo: String(data.tipo ?? 'altro'), dataOra: toDate(data.dataOra),
    zonaNome: String(data.zonaNome ?? ''), organizzatoreId: String(data.organizzatoreId ?? ''), geohash: String(data.geohash ?? ''),
    stato: String(data.stato ?? ''), richiedeApprovazione: data.richiedeApprovazione === true, creatoIl: toDate(data.creatoIl),
  }
}

/**
 * Eventi futuri. Un solo filtro, su `dataOra`: Firestore lo gestisce con l'indice automatico del campo
 * (niente indici compositi, che dal cloud non si possono creare). Il resto si filtra in codice.
 */
export async function readUpcomingEvents(db: Firestore, now: Date): Promise<EventLite[]> {
  const snap = await db.collection('events').where('dataOra', '>', Timestamp.fromDate(now)).get()
  return snap.docs.map((d) => toEvent(d.id, d.data()))
}

/** Le iscrizioni di un evento: una lettura per evento. */
export async function readParticipants(db: Firestore, eventId: string): Promise<PartLite[]> {
  const snap = await db.collection(`events/${eventId}/partecipanti`).get()
  return snap.docs.map((d) => ({ uid: d.id, stato: String(d.data().stato ?? '') }))
}
