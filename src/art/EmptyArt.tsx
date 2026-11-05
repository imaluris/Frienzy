import { NoEventsArt, NoResultsArt } from './empty/calendarArt'
import { NoSavedArt } from './empty/heartArt'
import { FailureArt, OfflineArt } from './empty/failureArt'
import { NoJoinedArt, NoOrganizedArt } from './empty/ticketArt'

// Le sette illustrazioni per gli stati vuoti, di errore e senza connessione.
export const EMPTY_ART = {
  'no-events': NoEventsArt,
  'no-results': NoResultsArt,
  'no-joined': NoJoinedArt,
  'no-organized': NoOrganizedArt,
  'no-saved': NoSavedArt,
  failure: FailureArt,
  offline: OfflineArt,
} as const

export type EmptyArtKind = keyof typeof EMPTY_ART

export function EmptyArt({ kind, label }: { kind: EmptyArtKind; label: string }) {
  const Art = EMPTY_ART[kind]
  return (
    <svg className="empty-art" viewBox="0 0 160 120" role="img" aria-label={label}>
      <Art />
    </svg>
  )
}
