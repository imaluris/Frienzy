import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useServices } from '../app/ServicesContext'
import { toggleId } from './savedState'

interface SavedValue {
  /** Id salvati, dal più recente. */
  ids: string[]
  isSaved: (eventId: string) => boolean
  /** Salva o toglie. Il cuore cambia subito; se la scrittura fallisce torna com'era. Restituisce il nuovo stato. */
  toggle: (eventId: string) => Promise<boolean>
  reload: () => void
}

const SavedContext = createContext<SavedValue | null>(null)

// Tiene in un posto solo l'elenco dei salvati, così il cuore di ogni scheda e la scheda "Salvati" restano d'accordo.
export function SavedProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const { saved } = useServices()
  const [ids, setIds] = useState<string[]>([])
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    saved.listIds(uid).then((list) => active && setIds(list)).catch(() => undefined)
    return () => {
      active = false
    }
  }, [saved, uid, version])

  const toggle = useCallback(
    async (eventId: string) => {
      const was = ids.includes(eventId)
      setIds((current) => toggleId(current, eventId))
      try {
        await (was ? saved.remove(uid, eventId) : saved.add(uid, eventId))
      } catch {
        setIds((current) => toggleId(current, eventId)) // annulla: torna com'era
        return was
      }
      return !was
    },
    [ids, saved, uid],
  )

  const value = useMemo<SavedValue>(
    () => ({ ids, isSaved: (id) => ids.includes(id), toggle, reload: () => setVersion((v) => v + 1) }),
    [ids, toggle],
  )
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved(): SavedValue {
  const value = useContext(SavedContext)
  if (!value) throw new Error('SavedProvider mancante')
  return value
}
