import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { DEFAULT_PREFS, type NotificationPrefs, type PrefKey } from './prefs'

// Carica le preferenze e le cambia una alla volta. Se il salvataggio fallisce l'interruttore torna com'era.
export function useNotificationPrefs(uid: string) {
  const { notifications } = useServices()
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    notifications.getPrefs(uid).then((p) => alive && (setPrefs(p), setLoaded(true))).catch(() => alive && setLoaded(true))
    return () => { alive = false }
  }, [notifications, uid])

  const toggle = useCallback(async (key: PrefKey) => {
    const before = prefs
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setError(null)
    try {
      await notifications.savePrefs(uid, next)
    } catch {
      setPrefs(before)
      setError('Non sono riuscito a salvare. Riprova tra poco.')
    }
  }, [notifications, prefs, uid])

  return { prefs, loaded, error, toggle }
}
