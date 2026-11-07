import type { ChatMessage } from './message'

// Contratto della chat. Chi lo usa non sa se dietro c'è Firebase o la memoria.
export interface ChatRepository {
  /**
   * Segue i messaggi dell'evento in tempo reale, dal più vecchio al più recente:
   * `onMessages` riceve l'elenco completo a ogni cambiamento. Restituisce la funzione per smettere di ascoltare.
   * Se `uid` non può leggere la chat, chiama `onError` e non invia nulla.
   */
  subscribe(eventId: string, uid: string, onMessages: (messages: ChatMessage[]) => void, onError: (error: Error) => void): () => void
  /** Invia un messaggio come `uid`; errore se non è organizzatore o confermato, o se il testo non è valido. */
  send(eventId: string, uid: string, testo: string): Promise<void>
  /** Cancella un messaggio come `uid`; errore se non è l'organizzatore dell'evento. */
  remove(eventId: string, uid: string, messageId: string): Promise<void>
  /** Cancella tutti i messaggi scritti da `uid` in questo evento (eliminazione account). Nessun messaggio = nessun errore. */
  removeOwn(eventId: string, uid: string): Promise<void>
}
