import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { db, loadContact, sendTo } from './admin'
import { answerMessage, requestMessage } from './logic/messages'
import { tokensFor } from './logic/recipients'
import { toEvent } from './remindersJob'

const PATH = 'events/{eventId}/partecipanti/{uid}'

// Nuova richiesta di partecipazione → avviso all'organizzatore (se ha la preferenza accesa).
export const notifyNewRequest = onDocumentCreated(PATH, async (event) => {
  const data = event.data?.data()
  if (!data || data.stato !== 'richiesta') return
  const eventSnap = await db.doc(`events/${event.params.eventId}`).get()
  if (!eventSnap.exists) return
  const ev = toEvent(eventSnap.id, eventSnap.data()!)
  const requester = await db.doc(`users/${event.params.uid}`).get()
  const name = String(requester.data()?.nome ?? 'Qualcuno')
  await sendTo(tokensFor([await loadContact(ev.organizzatoreId)], 'richieste'), requestMessage(ev, name))
})

// Richiesta (o lista d'attesa) accettata o rifiutata → avviso a chi aveva chiesto.
export const notifyAnswer = onDocumentUpdated(PATH, async (event) => {
  const before = event.data?.before.data()
  const after = event.data?.after.data()
  if (!before || !after || before.stato === after.stato) return
  if ((before.stato !== 'richiesta' && before.stato !== 'inAttesa') || (after.stato !== 'confermato' && after.stato !== 'rifiutato')) return
  const eventSnap = await db.doc(`events/${event.params.eventId}`).get()
  if (!eventSnap.exists) return
  const ev = toEvent(eventSnap.id, eventSnap.data()!)
  await sendTo(tokensFor([await loadContact(event.params.uid)], 'risposte'), answerMessage(ev, after.stato))
})
