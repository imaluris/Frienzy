import type { FrienzyEvent } from '../domain/event'

export type PeriodId = 'oggi' | 'domani' | 'settimana' | 'dopo'

export interface PeriodGroup {
  id: PeriodId
  title: string
  events: FrienzyEvent[]
}

const TITLES: Record<PeriodId, string> = { oggi: 'Oggi', domani: 'Domani', settimana: 'Questa settimana', dopo: 'Più avanti' }
const ORDER: PeriodId[] = ['oggi', 'domani', 'settimana', 'dopo']

/** Mezzanotte (ora locale) del giorno di `date`. */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

/** Giorni di calendario tra oggi e la data dell'evento (0 = oggi, 1 = domani...). Conta i giorni, non le 24 ore. */
export function daysFromToday(date: Date, now: Date): number {
  const a = startOfDay(now)
  const b = startOfDay(date)
  return Math.round((b.getTime() - a.getTime()) / (24 * 3600 * 1000))
}

export function periodOf(date: Date, now: Date): PeriodId {
  const days = daysFromToday(date, now)
  if (days <= 0) return 'oggi'
  if (days === 1) return 'domani'
  return days <= 7 ? 'settimana' : 'dopo'
}

/** Raggruppa eventi (già ordinati per data) in Oggi / Domani / Questa settimana / Più avanti. Le sezioni vuote spariscono. */
export function groupByPeriod(events: FrienzyEvent[], now: Date = new Date()): PeriodGroup[] {
  const buckets: Record<PeriodId, FrienzyEvent[]> = { oggi: [], domani: [], settimana: [], dopo: [] }
  for (const event of events) buckets[periodOf(event.dataOra, now)].push(event)
  return ORDER.filter((id) => buckets[id].length > 0).map((id) => ({ id, title: TITLES[id], events: buckets[id] }))
}
