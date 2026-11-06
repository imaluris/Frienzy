import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore'
import { checkMessageText } from '../chat/chatRules'
import type { ChatRepository } from '../chat/chatRepository'
import type { ChatMessage } from '../chat/message'
import { db } from './app'

// events/{eventId}/messaggi/{id}: le regole Firestore lasciano leggere e scrivere solo organizzatore e confermati.
const messages = (eventId: string) => collection(db(), 'events', eventId, 'messaggi')

export class FirestoreChatRepository implements ChatRepository {
  subscribe(eventId: string, _uid: string, onMessages: (m: ChatMessage[]) => void, onError: (e: Error) => void): () => void {
    return onSnapshot(
      query(messages(eventId), orderBy('creatoIl', 'asc')),
      (snap) => onMessages(snap.docs.map((d) => {
        const data = d.data({ serverTimestamps: 'estimate' })
        const when = data.creatoIl instanceof Timestamp ? data.creatoIl.toDate() : new Date()
        return { id: d.id, eventId, authorUid: String(data.authorUid), testo: String(data.testo), creatoIl: when }
      })),
      (error) => onError(error),
    )
  }

  async send(eventId: string, uid: string, testo: string): Promise<void> {
    const check = checkMessageText(testo)
    if (!check.ok) throw new Error(check.error)
    await addDoc(messages(eventId), { authorUid: uid, testo: check.testo, creatoIl: serverTimestamp() })
  }

  async remove(eventId: string, _uid: string, messageId: string): Promise<void> {
    await deleteDoc(doc(db(), 'events', eventId, 'messaggi', messageId))
  }
}
