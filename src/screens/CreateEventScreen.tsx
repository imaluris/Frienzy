import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { CREATE_STEPS, createStepNumber, firstInvalidStep, nextCreateStep, previousCreateStep, stepErrors, STEP_TITLE, type CreateStep } from '../create/createSteps'
import type { FrienzyEvent } from '../domain/event'
import { buildEvent, createEvent } from '../events/eventService'
import type { EventField, EventFieldErrors } from '../events/fieldErrors'
import type { EventInput } from '../events/validation'
import { ProgressBars } from '../ui/ProgressBars'
import { CreateStepBody } from './CreateStepBody'
import { CreateSummary } from './CreateSummary'

const EMPTY: EventInput = {
  tipo: 'aperitivo', titolo: '', descrizione: '', dataOra: '', zonaNome: '', indirizzo: '', lat: '', lng: '',
  maxPartecipanti: '10', richiedeApprovazione: false,
}

interface Props {
  uid: string
  onDone: () => void
}

// Crea evento a passi: tipo, titolo, quando, dove, posti, riepilogo. Si va avanti solo se i campi del passo sono giusti.
export function CreateEventScreen({ uid, onDone }: Props) {
  const { events } = useServices()
  const [step, setStep] = useState<CreateStep>('tipo')
  const [input, setInput] = useState<EventInput>(EMPTY)
  const [errors, setErrors] = useState<EventFieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Modifica un campo e toglie il suo errore: l'utente vede subito che sta correggendo.
  function change(field: EventField, patch: Partial<EventInput>) {
    setInput((old) => ({ ...old, ...patch }))
    setErrors((old) => ({ ...old, [field]: undefined }))
  }

  function goNext() {
    const found = stepErrors(step, input)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    const next = nextCreateStep(step)
    if (next) setStep(next)
  }

  async function publish() {
    const invalid = firstInvalidStep(input)
    if (invalid) {
      setErrors(stepErrors(invalid, input))
      return setStep(invalid)
    }
    setBusy(true)
    try {
      setError(null)
      await createEvent(events, uid, input)
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Qualcosa è andato storto.')
      setBusy(false)
    }
  }

  const back = previousCreateStep(step)
  const last = step === 'riepilogo'
  return (
    <section className="create-wizard" aria-label="Crea evento">
      <ProgressBars current={createStepNumber(step)} total={CREATE_STEPS.length} label={`Passo ${createStepNumber(step)} di ${CREATE_STEPS.length}`} />
      <h2 className="step-title">{STEP_TITLE[step]}</h2>
      <div className="create-body">
        {last ? <Summary input={input} uid={uid} /> : <CreateStepBody step={step} input={input} errors={errors} change={change} />}
        {error && <p role="alert" className="error">{error}</p>}
      </div>
      <footer className="wizard-actions">
        {back && <button type="button" className="secondary" disabled={busy} onClick={() => { setErrors({}); setStep(back) }}>Indietro</button>}
        <button type="button" className="grow" aria-busy={busy} onClick={last ? () => void publish() : goNext}>{last ? 'Crea evento' : 'Continua'}</button>
      </footer>
    </section>
  )
}

// Il riepilogo costruisce l'anteprima dai dati già controllati.
function Summary({ input, uid }: { input: EventInput; uid: string }) {
  const { event } = buildEvent(uid, input)
  const preview: FrienzyEvent = { ...event, id: 'anteprima', stato: 'aperto', creatoIl: new Date() }
  return <CreateSummary preview={preview} address={input.indirizzo.trim()} approval={input.richiedeApprovazione} />
}
