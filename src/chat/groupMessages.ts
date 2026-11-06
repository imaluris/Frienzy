import type { ChatMessage } from './message'

export interface ChatItem {
  message: ChatMessage
  mine: boolean
  /** Il nome si mostra sul primo messaggio di una serie dello stesso autore (mai sui miei). */
  showAuthor: boolean
  /** Etichetta del giorno ("Oggi", "Ieri", "mar 3 nov") sul primo messaggio di ogni giorno, altrimenti null. */
  dayLabel: string | null
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** Etichetta del giorno di un messaggio, rispetto a `today`. */
export function dayLabelOf(date: Date, today: Date): string {
  if (sameDay(date, today)) return 'Oggi'
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (sameDay(date, yesterday)) return 'Ieri'
  return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).format(date)
}

/** Ora del messaggio, es. "18:05". */
export const timeOf = (date: Date): string => new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(date)

/** Prepara i messaggi (già in ordine cronologico) per la schermata: serie dello stesso autore e separatori di giorno. */
export function groupMessages(messages: ChatMessage[], myUid: string, today: Date = new Date()): ChatItem[] {
  return messages.map((message, i) => {
    const prev = messages[i - 1]
    const newDay = !prev || !sameDay(prev.creatoIl, message.creatoIl)
    return {
      message,
      mine: message.authorUid === myUid,
      showAuthor: message.authorUid !== myUid && (newDay || prev.authorUid !== message.authorUid),
      dayLabel: newDay ? dayLabelOf(message.creatoIl, today) : null,
    }
  })
}
