import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import type { SavedRepository } from '../saved/savedRepository'
import { db } from './app'

// users/{uid}/salvati/{eventId}: un documento per evento salvato, leggibile e scrivibile solo dal proprietario.
const ref = (uid: string, eventId: string) => doc(db(), 'users', uid, 'salvati', eventId)

export class FirestoreSavedRepository implements SavedRepository {
  async listIds(uid: string): Promise<string[]> {
    const snap = await getDocs(query(collection(db(), 'users', uid, 'salvati'), orderBy('creatoIl', 'desc')))
    return snap.docs.map((d) => d.id)
  }

  async add(uid: string, eventId: string): Promise<void> {
    await setDoc(ref(uid, eventId), { eventId, creatoIl: serverTimestamp() })
  }

  async remove(uid: string, eventId: string): Promise<void> {
    await deleteDoc(ref(uid, eventId))
  }
}
