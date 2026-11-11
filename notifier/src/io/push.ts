import { getMessaging } from 'firebase-admin/messaging'
import { tokensFor } from '../logic/recipients'
import type { Send } from '../logic/plan'

/**
 * Manda un invio con Firebase Cloud Messaging (sendEachForMulticast). Restituisce true se la richiesta a FCM è partita
 * (anche se qualche telefono ha rifiutato: token scaduti sono normali); false se la chiamata stessa è fallita,
 * e in quel caso la chiave NON va registrata, così al prossimo giro si riprova.
 */
export async function sendPush(send: Send): Promise<boolean> {
  const tokens = tokensFor(send.recipients, send.pref)
  if (tokens.length === 0) return true
  try {
    const result = await getMessaging().sendEachForMulticast({ tokens, notification: { title: send.message.title, body: send.message.body } })
    if (result.failureCount > 0) console.log(`  ${send.key}: ${result.failureCount} telefoni non raggiunti (token scaduti?)`)
    return true
  } catch (error) {
    console.error(`  ${send.key}: invio non riuscito`, error)
    return false
  }
}
