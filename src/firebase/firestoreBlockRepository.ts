import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore'
import type { BlockRepository } from '../safety/blockRepository'
import { db } from './app'

// blocchi/{chi blocca}_{chi è bloccato}: l'id contiene entrambe le persone, così le regole possono controllarlo.
export const blockId = (blocker: string, blocked: string) => `${blocker}_${blocked}`
const ref = (blocker: string, blocked: string) => doc(db(), 'blocchi', blockId(blocker, blocked))

export class FirestoreBlockRepository implements BlockRepository {
  async block(uid: string, otherUid: string): Promise<void> {
    if (uid === otherUid) throw new Error('Non puoi bloccare te stesso.')
    await setDoc(ref(uid, otherUid), { blockerId: uid, blockedId: otherUid, creatoIl: serverTimestamp() })
  }

  async unblock(uid: string, otherUid: string): Promise<void> {
    await deleteDoc(ref(uid, otherUid))
  }

  async listBlockedBy(uid: string): Promise<string[]> {
    const snap = await getDocs(query(collection(db(), 'blocchi'), where('blockerId', '==', uid)))
    return snap.docs.map((d) => String(d.data().blockedId))
  }

  async listBlockers(uid: string): Promise<string[]> {
    const snap = await getDocs(query(collection(db(), 'blocchi'), where('blockedId', '==', uid)))
    return snap.docs.map((d) => String(d.data().blockerId))
  }

  async isBlockedBetween(a: string, b: string): Promise<boolean> {
    const [one, two] = await Promise.all([getDoc(ref(a, b)), getDoc(ref(b, a))])
    return one.exists() || two.exists()
  }
}
