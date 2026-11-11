import type { Firestore } from 'firebase-admin/firestore'
import { gather } from './gather'
import { loadSent, saveSent } from './io/sentState'
import { sendPush } from './io/push'
import { applyBaseline, mergeSent } from './logic/baseline'
import { plan } from './logic/plan'

/** Una esecuzione del notificatore: legge, pianifica, invia, ricorda cosa ha inviato. */
export async function run(db: Firestore, now: Date = new Date()): Promise<void> {
  const state = await loadSent(db)
  const sends = plan(await gather(db, now, new Set(Object.keys(state.keys))))
  const { toSend, toRecord } = applyBaseline(sends, !state.exists)

  const recorded: string[] = state.exists ? [] : toRecord
  for (const send of toSend) if (await sendPush(send)) recorded.push(send.key)

  console.log(state.exists ? `Pianificati ${sends.length} invii, registrati ${recorded.length}.` : `Primo avvio: ${recorded.length} chiavi registrate senza inviare.`)
  if (recorded.length > 0 || !state.exists) await saveSent(db, mergeSent(state.keys, recorded, now))
}
