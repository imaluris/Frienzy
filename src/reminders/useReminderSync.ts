import { useEffect } from 'react'
import { useServices } from '../app/ServicesContext'
import { onForeground } from '../native/foreground'
import { syncReminders } from './syncReminders'
import { onDataChanged } from './syncSignal'

const DEBOUNCE_MS = 600

/** Tiene aggiornati i promemoria sul telefono: all'avvio, al ritorno in primo piano e quando i dati cambiano. Gli errori non disturbano l'utente. */
export function useReminderSync(uid: string) {
  const services = useServices()
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const run = () => { void syncReminders(services, uid).catch(() => undefined) }
    const later = () => { clearTimeout(timer); timer = setTimeout(run, DEBOUNCE_MS) }
    run()
    const offs = [onForeground(run), onDataChanged(later)]
    return () => { clearTimeout(timer); offs.forEach((off) => off()) }
  }, [services, uid])
}
