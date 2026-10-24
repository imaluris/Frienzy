import { useState } from 'react'

/**
 * Esegue un'azione asincrona (iscriviti, accetta...) e tiene d'occhio due cose:
 * se è in corso (per spegnere i pulsanti) e l'eventuale messaggio d'errore da mostrare.
 * Dopo un successo chiama `onDone` (la schermata ricarica i dati).
 */
export function useRunAction(onDone: () => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Qualcosa è andato storto')
    } finally {
      setBusy(false)
      onDone() // anche dopo un errore: i dati (es. posti) potrebbero essere cambiati
    }
  }
  return { busy, error, run }
}
