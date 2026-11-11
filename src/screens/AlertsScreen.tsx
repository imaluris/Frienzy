import { useEffect, useState } from 'react'
import { useAlerts } from '../alerts/AlertsContext'
import { EmptyState } from '../ui/EmptyState'
import { LoadFailed } from '../ui/LoadFailed'
import { PullToRefresh } from '../ui/PullToRefresh'
import { AlertRow } from './AlertRow'

// Schermata "Avvisi": richieste in attesa, risposte alle tue richieste e inviti a eventi nuovi.
// Alla apertura segna tutto come visto (il contatore della campanella torna a zero) ma ricorda cosa era nuovo per mostrarlo.
export function AlertsScreen({ onOpen }: { onOpen: (eventId: string) => void }) {
  const { alerts, seen, loading, failed, refresh, markAllSeen } = useAlerts()
  const [wasSeen] = useState(() => seen) // gli avvisi non in questo elenco erano nuovi quando ho aperto la schermata

  useEffect(() => { if (!loading) markAllSeen() }, [loading, alerts, markAllSeen])

  return (
    <PullToRefresh onRefresh={refresh}>
      <section className="alerts" aria-label="Avvisi">
        {loading && <ul className="alert-list" aria-busy="true">{[0, 1, 2].map((i) => <li key={i} className="alert-skeleton skeleton" />)}</ul>}
        {!loading && failed && <LoadFailed text="Non riesco a caricare gli avvisi." />}
        {!loading && !failed && alerts.length === 0 && <EmptyState art="no-alerts" text="Nessun avviso per ora. Qui trovi richieste, risposte e inviti a eventi nuovi." />}
        {!loading && !failed && alerts.length > 0 && (
          <ul className="alert-list">{alerts.map((a) => <AlertRow key={a.key} alert={a} fresh={!wasSeen.has(a.key)} onOpen={onOpen} />)}</ul>
        )}
      </section>
    </PullToRefresh>
  )
}
