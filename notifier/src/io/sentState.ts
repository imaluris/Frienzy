import type { Firestore } from 'firebase-admin/firestore'

// notificheInviate/stato: UN solo documento con le chiavi già inviate (chiave → ora in millisecondi).
// Una lettura e una scrittura per esecuzione, invece di leggere tante piccole schede: Firestore gratuito conta le letture.
const ref = (db: Firestore) => db.doc('notificheInviate/stato')

export interface SentState {
  /** false al primissimo avvio: allora si registra tutto senza inviare. */
  exists: boolean
  keys: Record<string, number>
}

export async function loadSent(db: Firestore): Promise<SentState> {
  const snap = await ref(db).get()
  return { exists: snap.exists, keys: (snap.data()?.chiavi as Record<string, number> | undefined) ?? {} }
}

export async function saveSent(db: Firestore, keys: Record<string, number>): Promise<void> {
  await ref(db).set({ chiavi: keys, aggiornatoIl: new Date() })
}
