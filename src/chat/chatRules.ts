import { MAX_MESSAGE_LENGTH, type ChatRole } from './message'

// Funzioni pure con le regole della chat: le stesse che applicano le regole Firestore.

/** Leggono e scrivono solo l'organizzatore e i confermati. */
export const canUseChat = (role: ChatRole): boolean => role !== 'nessuno'

/** Cancella i messaggi solo l'organizzatore. */
export const canDeleteMessage = (role: ChatRole): boolean => role === 'organizzatore'

export type MessageCheck = { ok: true; testo: string } | { ok: false; error: string }

/** Toglie gli spazi ai bordi e controlla che il testo non sia vuoto né troppo lungo. */
export function checkMessageText(raw: string): MessageCheck {
  const testo = raw.trim()
  if (testo.length === 0) return { ok: false, error: 'Scrivi qualcosa prima di inviare.' }
  if (testo.length > MAX_MESSAGE_LENGTH) return { ok: false, error: `Il messaggio può avere al massimo ${MAX_MESSAGE_LENGTH} caratteri.` }
  return { ok: true, testo }
}
