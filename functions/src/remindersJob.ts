import { Timestamp } from 'firebase-admin/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { db, loadContact, sendTo } from './admin'
import { reminderMessage } from './logic/messages'
import { dueReminders, type SentFlags } from './logic/reminders'
import { reminderUids, tokensFor } from './logic/recipients'
import type { EventLite } from './logic/types'

export function toEvent(id: string, d: FirebaseFirestore.DocumentData): EventLite {
  return {
    id, titolo: d.titolo, tipo: d.tipo, zonaNome: d.zonaNome, organizzatoreId: d.organizzatoreId,
    geohash: d.geohash, stato: d.stato, dataOra: (d.dataOra as Timestamp).toDate(),
  }
}

// Ogni 15 minuti: cerca gli eventi nelle prossime 24 ore, invia i promemoria dovuti e li segna come inviati
// (events/{id}/contatori/promemoria) così non si ripetono.
export const sendReminders = onSchedule('every 15 minutes', async () => {
  const now = new Date()
  const limit = Timestamp.fromMillis(now.getTime() + 24 * 3_600_000)
  const snap = await db.collection('events').where('stato', '==', 'aperto').where('dataOra', '>', Timestamp.fromDate(now)).where('dataOra', '<=', limit).get()
  const events = snap.docs.map((d) => toEvent(d.id, d.data()))
  const flagDocs = await Promise.all(events.map((e) => db.doc(`events/${e.id}/contatori/promemoria`).get()))
  const sent: Record<string, SentFlags> = {}
  events.forEach((e, i) => { sent[e.id] = (flagDocs[i].data() ?? {}) as SentFlags })

  for (const { event, kind } of dueReminders(events, sent, now)) {
    const people = await db.collection(`events/${event.id}/partecipanti`).where('stato', '==', 'confermato').get()
    const uids = reminderUids(event.organizzatoreId, people.docs.map((p) => ({ uid: p.id, stato: String(p.data().stato) })))
    const contacts = await Promise.all(uids.map(loadContact))
    await sendTo(tokensFor(contacts, 'promemoria'), reminderMessage(event, kind))
    await db.doc(`events/${event.id}/contatori/promemoria`).set(kind === '24h' ? { h24: true } : { h2: true }, { merge: true })
  }
})
