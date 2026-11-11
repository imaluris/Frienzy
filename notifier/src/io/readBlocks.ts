import type { Firestore } from 'firebase-admin/firestore'
import type { BlockLite } from '../logic/types'

/** I blocchi che riguardano questi organizzatori, in un senso o nell'altro (due letture per organizzatore). */
export async function readBlocksOf(db: Firestore, organizerIds: string[]): Promise<BlockLite[]> {
  const out = new Map<string, BlockLite>()
  for (const id of organizerIds) {
    const [byOrg, ofOrg] = await Promise.all([
      db.collection('blocchi').where('blockerId', '==', id).get(),
      db.collection('blocchi').where('blockedId', '==', id).get(),
    ])
    for (const d of [...byOrg.docs, ...ofOrg.docs]) out.set(d.id, { blockerId: String(d.data().blockerId), blockedId: String(d.data().blockedId) })
  }
  return [...out.values()]
}
