// Un messaggio della chat di un evento, salvato in events/{eventId}/messaggi/{id}.
export interface ChatMessage {
  id: string
  eventId: string
  authorUid: string
  testo: string
  creatoIl: Date
}

/** Chi sei rispetto alla chat di un evento. */
export type ChatRole = 'organizzatore' | 'confermato' | 'nessuno'

export const MAX_MESSAGE_LENGTH = 500
