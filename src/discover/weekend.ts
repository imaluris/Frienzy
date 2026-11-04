import type { FrienzyEvent } from '../domain/event'
import { startOfDay } from '../events/periods'


/**
 * Il fine settimana "in corso o in arrivo": [inizio, fine) in ora locale.
 * Dal lunedì al venerdì è il prossimo sabato e domenica; di sabato e domenica è quello di oggi.
 */
export function weekendRange(now: Date): { from: Date; to: Date } {
  const today = startOfDay(now)
  const weekday = today.getDay() // 0 = domenica, 6 = sabato
  const toSaturday = weekday === 0 ? -1 : 6 - weekday
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() + toSaturday)
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 2)
  return { from, to }
}

/** Eventi di sabato e domenica, dal più vicino (quelli già passati sono esclusi). */
export function weekendEvents(events: FrienzyEvent[], now: Date): FrienzyEvent[] {
  const { from, to } = weekendRange(now)
  return events
    .filter((e) => e.dataOra.getTime() >= from.getTime() && e.dataOra.getTime() < to.getTime() && e.dataOra.getTime() > now.getTime())
    .sort((a, b) => a.dataOra.getTime() - b.dataOra.getTime())
}

