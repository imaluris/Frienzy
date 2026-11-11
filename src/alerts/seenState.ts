import type { AppAlert } from './alertTypes'
import { SEEN_MAX } from './seenRepository'

/** Gli avvisi non ancora visti. */
export const unseen = (alerts: readonly AppAlert[], seen: ReadonlySet<string>): AppAlert[] => alerts.filter((a) => !seen.has(a.key))

/** Aggiunge le chiavi degli avvisi correnti a quelle già viste, senza doppioni, tenendo le ultime SEEN_MAX. */
export function withSeen(seen: readonly string[], alerts: readonly AppAlert[]): string[] {
  const known = new Set(seen)
  const added = alerts.map((a) => a.key).filter((key) => !known.has(key))
  return [...seen, ...new Set(added)].slice(-SEEN_MAX)
}
