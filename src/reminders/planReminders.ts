import type { FrienzyEvent } from '../domain/event'
import { reminderId } from './reminderId'
import { reminderText } from './reminderText'
import type { Reminder, ReminderKind } from './types'

const HOUR = 3_600_000
const BEFORE: Record<ReminderKind, number> = { '24h': 24 * HOUR, '2h': 2 * HOUR }

/**
 * Quali promemoria programmare, dati gli eventi a cui partecipo o che organizzo.
 * Solo eventi aperti; un promemoria il cui momento è già passato non si programma
 * (un evento tra 5 ore ha solo quello "2 ore prima"). Funzione pura, ordinata per orario.
 */
export function planReminders(events: readonly FrienzyEvent[], now: Date): Reminder[] {
  const out: Reminder[] = []
  for (const event of events) {
    if (event.stato !== 'aperto') continue
    for (const kind of ['24h', '2h'] as const) {
      const at = new Date(event.dataOra.getTime() - BEFORE[kind])
      if (at.getTime() <= now.getTime()) continue
      out.push({ id: reminderId(event.id, kind), at, ...reminderText(event, kind) })
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime())
}
