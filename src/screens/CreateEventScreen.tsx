import { useState, type FormEvent } from 'react'
import { useServices } from '../app/ServicesContext'
import { EVENT_TYPE_EMOJI, EVENT_TYPE_IDS } from '../domain/eventTypes'
import { createEvent } from '../events/eventService'
import { DESCRIPTION_MAX, type EventInput } from '../events/validation'

const EMPTY: EventInput = {
  tipo: 'aperitivo',
  titolo: '',
  descrizione: '',
  dataOra: '',
  zonaNome: '',
  indirizzo: '',
  lat: '',
  lng: '',
  maxPartecipanti: '10',
  richiedeApprovazione: false,
}

interface Props {
  uid: string
  onDone: () => void
  onCancel: () => void
}

// Form per creare un evento. La mappa per scegliere il punto arriverà col task 9: per ora le coordinate si scrivono.
export function CreateEventScreen({ uid, onDone, onCancel }: Props) {
  const { events } = useServices()
  const [input, setInput] = useState<EventInput>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<EventInput>) => setInput((old) => ({ ...old, ...patch }))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      setError(null)
      await createEvent(events, uid, input)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Qualcosa è andato storto.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Crea un evento</h2>
      <label>
        Tipo
        <select value={input.tipo} onChange={(e) => set({ tipo: e.target.value })}>
          {EVENT_TYPE_IDS.map((id) => (
            <option key={id} value={id}>{EVENT_TYPE_EMOJI[id]} {id}</option>
          ))}
        </select>
      </label>
      <label>
        Titolo
        <input value={input.titolo} onChange={(e) => set({ titolo: e.target.value })} />
      </label>
      <label>
        Descrizione ({input.descrizione.length}/{DESCRIPTION_MAX})
        <textarea value={input.descrizione} onChange={(e) => set({ descrizione: e.target.value })} />
      </label>
      <label>
        Data e ora
        <input type="datetime-local" value={input.dataOra} onChange={(e) => set({ dataOra: e.target.value })} />
      </label>
      <label>
        Zona (visibile a tutti)
        <input value={input.zonaNome} onChange={(e) => set({ zonaNome: e.target.value })} />
      </label>
      <label>
        Indirizzo esatto (solo per te e per chi è confermato)
        <input value={input.indirizzo} onChange={(e) => set({ indirizzo: e.target.value })} />
      </label>
      <label>
        Latitudine
        <input inputMode="decimal" value={input.lat} onChange={(e) => set({ lat: e.target.value })} />
      </label>
      <label>
        Longitudine
        <input inputMode="decimal" value={input.lng} onChange={(e) => set({ lng: e.target.value })} />
      </label>
      <label>
        Massimo partecipanti
        <input inputMode="numeric" value={input.maxPartecipanti} onChange={(e) => set({ maxPartecipanti: e.target.value })} />
      </label>
      <label className="inline">
        <input
          type="checkbox"
          checked={input.richiedeApprovazione}
          onChange={(e) => set({ richiedeApprovazione: e.target.checked })}
        />
        Le richieste vanno approvate da me
      </label>
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" disabled={busy}>Crea evento</button>{' '}
      <button type="button" className="link" onClick={onCancel}>Annulla</button>
    </form>
  )
}
