import type { EventLite } from './types'

export type ReminderKind = '24h' | '2h'

const HOUR = 3_600_000
// Il controllo gira ogni 15 minuti: una finestra larga un'ora per tipo perdona un ritardo del servizio,
// mentre il segno "già inviato" evita i doppioni.
const WINDOWS: Record<ReminderKind, [number, number]> = { '24h': [23 * HOUR, 24 * HOUR], '2h': [1 * HOUR, 2 * HOUR] }

export interface SentFlags {
  h24?: boolean
  h2?: boolean
}

export interface DueReminder {
  event: EventLite
  kind: ReminderKind
}

/** Quali promemoria vanno inviati adesso. Eventi annullati o chiusi non ne hanno; quelli già inviati nemmeno. */
export function dueReminders(events: EventLite[], sent: Record<string, SentFlags>, now: Date): DueReminder[] {
  const out: DueReminder[] = []
  for (const event of events) {
    if (event.stato !== 'aperto') continue
    const wait = event.dataOra.getTime() - now.getTime()
    for (const kind of ['24h', '2h'] as const) {
      const [from, to] = WINDOWS[kind]
      const flag = kind === '24h' ? sent[event.id]?.h24 : sent[event.id]?.h2
      if (wait > from && wait <= to && !flag) out.push({ event, kind })
    }
  }
  return out
}
