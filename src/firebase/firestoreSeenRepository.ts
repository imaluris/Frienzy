import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { SEEN_MAX, type SeenRepository } from '../alerts/seenRepository'
import { db } from './app'

// users/{uid}/notifiche/visti: un solo documento con l'elenco delle chiavi (max 200), privato del proprietario.
const ref = (uid: string) => doc(db(), 'users', uid, 'notifiche', 'visti')

export class FirestoreSeenRepository implements SeenRepository {
  async get(uid: string): Promise<string[]> {
    const snap = await getDoc(ref(uid))
    const keys = snap.exists() ? snap.data().chiavi : []
    return Array.isArray(keys) ? keys.filter((k): k is string => typeof k === 'string') : []
  }

  async save(uid: string, keys: string[]): Promise<void> {
    await setDoc(ref(uid), { chiavi: keys.slice(-SEEN_MAX), aggiornatoIl: serverTimestamp() })
  }

  async clear(uid: string): Promise<void> {
    await deleteDoc(ref(uid))
  }
}
