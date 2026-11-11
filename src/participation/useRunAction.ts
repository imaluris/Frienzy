import { useState } from 'react'
import { notifyDataChanged } from '../reminders/syncSignal'

/**
 * Esegue un'azione asincrona (iscriviti, accetta...) e tiene d'occhio due cose:
 * se è in corso (per spegnere i pulsanti) e l'eventuale messaggio d'errore da mostrare.
 * Restituisce true se è andata a buon fine. Dopo ogni esito chiama `onDone` (la schermata ricarica i dati).
 */
export function useRunAction(onDone: () => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function run(action: () => Promise<unknown>): Promise<boolean> {
    setBusy(true)
    setError('')
    try {
      await action()
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Qualcosa è andato storto')
      return false
    } finally {
      setBusy(false)
      onDone() // anche dopo un errore: i dati (es. posti) potrebbero essere cambiati
      notifyDataChanged() // promemoria e avvisi si ricalcolano
    }
  }
  return { busy, error, run }
}
