import type { EventLite } from './types'

export interface Message {
  title: string
  body: string
}

const EMOJI: Record<string, string> = { aperitivo: '🍹', cena: '🍽️', mostra: '🖼️', trekking: '🥾', passeggiata: '🚶', sport: '⚽', altro: '✨' }
const emoji = (tipo: string) => EMOJI[tipo] ?? '✨'

export function requestMessage(event: EventLite, requesterName: string): Message {
  return { title: 'Nuova richiesta', body: `${requesterName} vorrebbe partecipare a "${event.titolo}".` }
}

export function answerMessage(event: EventLite, outcome: 'confermato' | 'rifiutato'): Message {
  return outcome === 'confermato'
    ? { title: 'Sei dentro! 🎉', body: `Ti hanno accettato a "${event.titolo}".` }
    : { title: 'Richiesta non accettata', body: `Stavolta "${event.titolo}" non è andata. Ci sono tanti altri eventi!` }
}

/** Invito: solo tipo, titolo e zona dell'evento. Niente nomi né dati di chi lo riceve. */
export function inviteMessage(event: EventLite): Message {
  return { title: `${emoji(event.tipo)} Un evento vicino a te`, body: `${event.titolo} · ${event.zonaNome}` }
}
