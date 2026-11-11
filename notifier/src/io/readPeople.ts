import type { Firestore } from 'firebase-admin/firestore'
import type { DeviceLite, PrefsLite } from '../logic/types'

const CHUNK = 300

/** Legge molti documenti insieme (getAll) a blocchi, restituendo `uid → dati` solo per quelli che esistono. */
async function readMany(db: Firestore, uids: string[], path: (uid: string) => string): Promise<Record<string, FirebaseFirestore.DocumentData>> {
  const out: Record<string, FirebaseFirestore.DocumentData> = {}
  for (let i = 0; i < uids.length; i += CHUNK) {
    const refs = uids.slice(i, i + CHUNK).map((uid) => db.doc(path(uid)))
    const snaps = refs.length ? await db.getAll(...refs) : []
    snaps.forEach((snap, j) => { if (snap.exists) out[uids[i + j]] = snap.data() ?? {} })
  }
  return out
}

/** Tutti i dispositivi registrati: UNA lettura della raccolta `dispositivi` (token e zona di ~5 km, mai la posizione esatta). */
export async function readDevices(db: Firestore): Promise<Record<string, DeviceLite>> {
  const snap = await db.collection('dispositivi').get()
  const out: Record<string, DeviceLite> = {}
  snap.docs.forEach((d) => { out[d.id] = { token: String(d.data().token ?? '') || undefined, zona: String(d.data().zona ?? '') } })
  return out
}

export async function readPrefs(db: Firestore, uids: string[]): Promise<Record<string, PrefsLite>> {
  return readMany(db, uids, (uid) => `users/${uid}/notifiche/preferenze`) as Promise<Record<string, PrefsLite>>
}

/** Nome e interessi dai profili. */
export async function readProfiles(db: Firestore, uids: string[]): Promise<Record<string, { nome: string; interessi: string[] }>> {
  const docs = await readMany(db, uids, (uid) => `users/${uid}`)
  const out: Record<string, { nome: string; interessi: string[] }> = {}
  for (const [uid, data] of Object.entries(docs)) out[uid] = { nome: String(data.nome ?? ''), interessi: Array.isArray(data.interessi) ? data.interessi.map(String) : [] }
  return out
}
