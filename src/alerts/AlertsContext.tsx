import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useServices } from '../app/ServicesContext'
import type { EventTypeId } from '../domain/eventTypes'
import { useMyPosition } from '../filters/useMyPosition'
import { isForeground, onForeground } from '../native/foreground'
import { onDataChanged } from '../reminders/syncSignal'
import type { AppAlert } from './alertTypes'
import { loadAlerts } from './loadAlerts'
import { unseen, withSeen } from './seenState'

/** Ogni quanto si rileggono gli avvisi, SOLO con l'app in primo piano (le letture di Firestore gratuite sono contate). */
export const POLL_MS = 60_000

interface AlertsValue {
  alerts: AppAlert[]
  /** Chiavi già viste. */
  seen: ReadonlySet<string>
  unseenCount: number
  loading: boolean
  failed: boolean
  refresh: () => Promise<void>
  /** Segna tutti gli avvisi attuali come visti (si salva sul server). */
  markAllSeen: () => void
}

const EMPTY: AlertsValue = { alerts: [], seen: new Set(), unseenCount: 0, loading: false, failed: false, refresh: async () => {}, markAllSeen: () => {} }
const AlertsContext = createContext<AlertsValue>(EMPTY)

// Tiene in un posto solo gli avvisi, così la campanella (con il contatore) e la schermata Avvisi restano d'accordo.
export function AlertsProvider({ uid, interessi, children }: { uid: string; interessi: readonly EventTypeId[]; children: ReactNode }) {
  const services = useServices()
  const { state: position } = useMyPosition()
  const point = position.status === 'ok' ? position.point : null
  const [data, setData] = useState<{ alerts: AppAlert[]; seen: string[] }>({ alerts: [], seen: [] })
  const [status, setStatus] = useState({ loading: true, failed: false })
  const latest = useRef(data)
  latest.current = data

  const refresh = useCallback(async () => {
    try {
      const loaded = await loadAlerts(services, { uid, interessi, position: point })
      setData(loaded)
      setStatus({ loading: false, failed: false })
    } catch {
      setStatus({ loading: false, failed: latest.current.alerts.length === 0 }) // con avvisi già a schermo un errore passeggero non li toglie
    }
  }, [services, uid, interessi, point])

  // Prima lettura, ritorno in primo piano, dati cambiati (iscrizione, ritiro...) e controllo ogni 60 secondi se l'app è visibile.
  useEffect(() => {
    void refresh()
    const timer = setInterval(() => { if (isForeground()) void refresh() }, POLL_MS)
    const offs = [onForeground(() => void refresh()), onDataChanged(() => void refresh())]
    return () => { clearInterval(timer); offs.forEach((off) => off()) }
  }, [refresh])

  const markAllSeen = useCallback(() => {
    const { alerts, seen } = latest.current
    const next = withSeen(seen, alerts)
    if (next.length === seen.length) return
    setData({ alerts, seen: next })
    void services.seen.save(uid, next).catch(() => undefined) // se non si salva, riapparirà "nuovo": niente di grave
  }, [services, uid])

  const seenSet = useMemo(() => new Set(data.seen), [data.seen])
  const value = useMemo<AlertsValue>(
    () => ({ alerts: data.alerts, seen: seenSet, unseenCount: unseen(data.alerts, seenSet).length, ...status, refresh, markAllSeen }),
    [data.alerts, seenSet, status, refresh, markAllSeen],
  )
  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
}

/** Senza provider (test dei singoli schermi) non ci sono avvisi. */
export const useAlerts = (): AlertsValue => useContext(AlertsContext)
