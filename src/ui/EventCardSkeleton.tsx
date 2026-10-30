// Scheda "scheletro" grigia che pulsa mentre gli eventi si caricano: la pagina non resta vuota.
export function EventCardSkeleton() {
  return (
    <div className="event-card skeleton-card" aria-hidden="true">
      <span className="skeleton skeleton-cover" />
      <span className="skeleton skeleton-line skeleton-line-lg" />
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line skeleton-line-sm" />
    </div>
  )
}

export function EventListSkeleton() {
  return (
    <div role="status" aria-label="Caricamento eventi" className="skeleton-list">
      <EventCardSkeleton />
      <EventCardSkeleton />
    </div>
  )
}
