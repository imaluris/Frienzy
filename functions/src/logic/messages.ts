import type { ReminderKind } from './reminders'
import type { EventLite } from './types'

export interface Message {
  title: string
  body: string
}

const EMOJI: Record<string, string> = { aperitivo: '🍹', cena: '🍽️', mostra: '🖼️', trekking: '🥾', passeggiata: '🚶', sport: '⚽', altro: '✨' }
const emoji = (tipo: string) => EMOJI[tipo] ?? '✨'

function timeLabel(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', timeZone }).format(date)
}

export function reminderMessage(event: EventLite, kind: ReminderKind, timeZone = 'Europe/Rome'): Message {
  const when = kind === '24h' ? `domani alle ${timeLabel(event.dataOra, timeZone)}` : `tra circa due ore, alle ${timeLabel(event.dataOra, timeZone)}`
  return { title: `${emoji(event.tipo)} ${event.titolo}`, body: `Ci vediamo ${when} (${event.zonaNome}).` }
}

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
