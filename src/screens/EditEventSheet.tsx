import { useState, type FormEvent } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { editEvent } from '../events/editEvent'
import { toInputValue, type EditInput } from '../events/editRules'
import { DESCRIPTION_MAX, TITLE_MAX } from '../events/validation'
import { useToast } from '../feedback/ToastContext'
import { useRunAction } from '../participation/useRunAction'
import { BottomSheet } from '../ui/BottomSheet'
import { Field } from './Field'

interface Props {
  event: FrienzyEvent
  uid: string
  confirmedCount: number
  onChanged: () => void
  onClose: () => void
}

// Finestra "Modifica evento": titolo, descrizione, data e posti. Tipo, zona e luogo restano quelli scelti alla creazione.
export function EditEventSheet({ event, uid, confirmedCount, onChanged, onClose }: Props) {
  const { events, participations } = useServices()
  const { show } = useToast()
  const { busy, error, run } = useRunAction(onChanged)
  const [form, setForm] = useState<EditInput>({
    titolo: event.titolo,
    descrizione: event.descrizione,
    dataOra: toInputValue(event.dataOra),
    maxPartecipanti: String(event.maxPartecipanti),
  })
  const set = (key: keyof EditInput) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    const ok = await run(() => editEvent({ events, participations }, event.id, uid, form))
    if (ok) {
      show('Evento aggiornato. Gli iscritti ne saranno avvisati', 'success')
      onClose()
    }
  }

  return (
    <BottomSheet title="Modifica evento" onClose={onClose}>
      <form className="edit-form" onSubmit={(e) => void submit(e)} noValidate>
        <Field label="Titolo">
          <input value={form.titolo} maxLength={TITLE_MAX} onChange={set('titolo')} />
        </Field>
        <Field label="Descrizione">
          <textarea rows={4} value={form.descrizione} maxLength={DESCRIPTION_MAX} onChange={set('descrizione')} />
        </Field>
        <Field label="Data e ora">
          <input type="datetime-local" value={form.dataOra} onChange={set('dataOra')} />
        </Field>
        <Field label="Posti" hint={confirmedCount > 0 ? `Almeno ${confirmedCount}: ci sono già persone confermate` : undefined}>
          <input type="number" inputMode="numeric" min={Math.max(1, confirmedCount)} value={form.maxPartecipanti} onChange={set('maxPartecipanti')} />
        </Field>
        {error && <p role="alert" className="error">{error}</p>}
        <button type="submit" className="wide" disabled={busy}>{busy ? 'Salvo…' : 'Salva modifiche'}</button>
        <button type="button" className="link wide" onClick={onClose}>Annulla</button>
      </form>
    </BottomSheet>
  )
}
