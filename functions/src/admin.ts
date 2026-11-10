import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import type { Contact } from './logic/types'
import type { Message } from './logic/messages'

if (getApps().length === 0) initializeApp()
export const db = getFirestore()

/** Legge preferenze e dispositivo di una persona (users/{uid}/notifiche/*). Mancanti = vuoti. */
export async function loadContact(uid: string): Promise<Contact> {
  const [prefs, device] = await Promise.all([
    db.doc(`users/${uid}/notifiche/preferenze`).get(),
    db.doc(`users/${uid}/notifiche/dispositivo`).get(),
  ])
  return { uid, prefs: prefs.data() ?? {}, device: device.data() ?? {} }
}

/** Invia lo stesso messaggio a più telefoni. Un errore di invio non deve mai far fallire la funzione. */
export async function sendTo(tokens: string[], message: Message): Promise<void> {
  if (tokens.length === 0) return
  try {
    await getMessaging().sendEachForMulticast({ tokens, notification: { title: message.title, body: message.body } })
  } catch (error) {
    console.error('Invio notifiche non riuscito', error)
  }
}
