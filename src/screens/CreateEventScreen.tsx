import { useState, type FormEvent } from 'react'
import { useServices } from '../app/ServicesContext'
import { EVENT_TYPE_EMOJI, isEventTypeId } from '../domain/eventTypes'
import { createEvent } from '../events/eventService'
import { validateEventFields, type EventField, type EventFieldErrors } from '../events/fieldErrors'
import { DESCRIPTION_MAX, type EventInput } from '../events/validation'
import { Field } from './Field'
import { LocationField } from './LocationField'
import { TypeSelector } from './TypeSelector'

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
}

// Form per creare un evento. Gli errori compaiono accanto a ogni campo, dopo il primo tentativo di invio.
export function CreateEventScreen({ uid, onDone }: Props) {
  const { events } = useServices()
  const [input, setInput] = useState<EventInput>(EMPTY)
  const [errors, setErrors] = useState<EventFieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Modifica un campo e toglie il suo errore: l'utente vede subito che sta correggendo.
  function change(field: EventField, patch: Partial<EventInput>) {
    setInput((old) => ({ ...old, ...patch }))
    setErrors((old) => ({ ...old, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const found = validateEventFields(input)
    setErrors(found)
    if (Object.keys(found).length > 0) return
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

  const emoji = isEventTypeId(input.tipo) ? EVENT_TYPE_EMOJI[input.tipo] : '✨'
  const bad = (field: EventField) => (errors[field] ? true : undefined)

  return (
    <form className="card create-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <span className="field-label">Che tipo di evento è?</span>
        <TypeSelector value={input.tipo} onChange={(tipo) => change('tipo', { tipo })} />
      </div>
      <Field label="Titolo" error={errors.titolo}>
        <input value={input.titolo} aria-invalid={bad('titolo')} onChange={(e) => change('titolo', { titolo: e.target.value })} />
      </Field>
      <Field label={`Descrizione (${input.descrizione.length}/${DESCRIPTION_MAX})`} error={errors.descrizione}>
        <textarea value={input.descrizione} aria-invalid={bad('descrizione')} onChange={(e) => change('descrizione', { descrizione: e.target.value })} />
      </Field>
      <Field label="Data e ora" error={errors.dataOra}>
        <input type="datetime-local" value={input.dataOra} aria-invalid={bad('dataOra')} onChange={(e) => change('dataOra', { dataOra: e.target.value })} />
      </Field>
      <LocationField
        lat={input.lat}
        lng={input.lng}
        emoji={emoji}
        error={errors.punto}
        onPick={(p) => change('punto', { lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })}
      />
      <Field label="Zona" hint="Visibile a tutti, ad esempio il quartiere." error={errors.zonaNome}>
        <input value={input.zonaNome} aria-invalid={bad('zonaNome')} onChange={(e) => change('zonaNome', { zonaNome: e.target.value })} />
      </Field>
      <Field label="Indirizzo esatto" hint="Lo vedono solo tu e chi è confermato." error={errors.indirizzo}>
        <input value={input.indirizzo} aria-invalid={bad('indirizzo')} onChange={(e) => change('indirizzo', { indirizzo: e.target.value })} />
      </Field>
      <Field label="Massimo partecipanti" error={errors.maxPartecipanti}>
        <input inputMode="numeric" value={input.maxPartecipanti} aria-invalid={bad('maxPartecipanti')} onChange={(e) => change('maxPartecipanti', { maxPartecipanti: e.target.value })} />
      </Field>
      <label className="inline approval">
        <input
          type="checkbox"
          checked={input.richiedeApprovazione}
          onChange={(e) => setInput((old) => ({ ...old, richiedeApprovazione: e.target.checked }))}
        />
        Le richieste vanno approvate da me
      </label>
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" disabled={busy}>Crea evento</button>
    </form>
  )
}
