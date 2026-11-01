import { EVENT_TYPE_EMOJI, isEventTypeId } from '../domain/eventTypes'
import type { CreateStep } from '../create/createSteps'
import { bumpSeats } from '../create/createSteps'
import type { EventField, EventFieldErrors } from '../events/fieldErrors'
import { DESCRIPTION_MAX, MAX_PARTICIPANTS_LIMIT, type EventInput } from '../events/validation'
import { TYPE_COLOR } from '../map/typeColors'
import { Icon } from '../ui/Icon'
import { Field } from './Field'
import { LocationField } from './LocationField'
import { TypeSelector } from './TypeSelector'

interface Props {
  step: Exclude<CreateStep, 'riepilogo'>
  input: EventInput
  errors: EventFieldErrors
  change: (field: EventField, patch: Partial<EventInput>) => void
}

// Contenuto dei cinque passi con campi (il riepilogo ha un componente suo).
export function CreateStepBody({ step, input, errors, change }: Props) {
  const bad = (field: EventField) => (errors[field] ? true : undefined)
  const emoji = isEventTypeId(input.tipo) ? EVENT_TYPE_EMOJI[input.tipo] : '✨'
  switch (step) {
    case 'tipo':
      return <TypeSelector value={input.tipo} onChange={(tipo) => change('tipo', { tipo })} />
    case 'testo':
      return (
        <>
          <Field label="Titolo" error={errors.titolo}>
            <input value={input.titolo} aria-invalid={bad('titolo')} placeholder="Es. Aperitivo ai Navigli" onChange={(e) => change('titolo', { titolo: e.target.value })} />
          </Field>
          <Field label={`Descrizione (${input.descrizione.length}/${DESCRIPTION_MAX})`} error={errors.descrizione}>
            <textarea value={input.descrizione} aria-invalid={bad('descrizione')} placeholder="Cosa si fa? Chi è il benvenuto?" onChange={(e) => change('descrizione', { descrizione: e.target.value })} />
          </Field>
        </>
      )
    case 'quando':
      return (
        <Field label="Data e ora" error={errors.dataOra}>
          <input type="datetime-local" value={input.dataOra} aria-invalid={bad('dataOra')} onChange={(e) => change('dataOra', { dataOra: e.target.value })} />
        </Field>
      )
    case 'dove':
      return (
        <>
          <LocationField lat={input.lat} lng={input.lng} emoji={emoji} color={isEventTypeId(input.tipo) ? TYPE_COLOR[input.tipo] : TYPE_COLOR.altro} error={errors.punto} onPick={(p) => change('punto', { lat: p.lat.toFixed(6), lng: p.lng.toFixed(6) })} />
          <Field label="Zona" hint="Visibile a tutti, ad esempio il quartiere." error={errors.zonaNome}>
            <input value={input.zonaNome} aria-invalid={bad('zonaNome')} onChange={(e) => change('zonaNome', { zonaNome: e.target.value })} />
          </Field>
          <Field label="Indirizzo esatto" hint="Lo vedono solo tu e chi è confermato." error={errors.indirizzo}>
            <input value={input.indirizzo} aria-invalid={bad('indirizzo')} onChange={(e) => change('indirizzo', { indirizzo: e.target.value })} />
          </Field>
        </>
      )
    case 'posti':
      return (
        <>
          <Field label="Massimo partecipanti" error={errors.maxPartecipanti}>
            <span className="stepper">
              <button type="button" className="secondary" aria-label="Un posto in meno" onClick={() => change('maxPartecipanti', { maxPartecipanti: bumpSeats(input.maxPartecipanti, -1, MAX_PARTICIPANTS_LIMIT) })}><Icon name="minus" /></button>
              <input inputMode="numeric" value={input.maxPartecipanti} aria-invalid={bad('maxPartecipanti')} onChange={(e) => change('maxPartecipanti', { maxPartecipanti: e.target.value })} />
              <button type="button" className="secondary" aria-label="Un posto in più" onClick={() => change('maxPartecipanti', { maxPartecipanti: bumpSeats(input.maxPartecipanti, 1, MAX_PARTICIPANTS_LIMIT) })}><Icon name="plus" /></button>
            </span>
          </Field>
          <label className="switch-row">
            <span>
              <strong>Le richieste vanno approvate da me</strong>
              <span className="hint">Se è spento, chi preme "Partecipa" entra subito finché ci sono posti.</span>
            </span>
            <input type="checkbox" role="switch" checked={input.richiedeApprovazione} onChange={(e) => change('tipo', { richiedeApprovazione: e.target.checked })} />
          </label>
        </>
      )
  }
}
