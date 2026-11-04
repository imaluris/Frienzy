import type { FrienzyEvent } from '../domain/event'
import { formatEventDate } from '../events/format'
import { EventCard } from '../ui/EventCard'
import { Icon } from '../ui/Icon'

interface Props {
  preview: FrienzyEvent
  address: string
  approval: boolean
}

// Ultimo passo: la scheda come la vedranno gli altri e il riepilogo di ciò che resta privato.
export function CreateSummary({ preview, address, approval }: Props) {
  return (
    <>
      <p className="step-hint">Così apparirà nell'elenco. Controlla e pubblica.</p>
      <EventCard event={preview} onOpen={() => undefined} attendance={{ names: [], confirmed: 0 }} saveable={false} />
      <ul className="summary-list">
        <li><Icon name="clock" size={20} /> {formatEventDate(preview.dataOra)}</li>
        <li><Icon name="pin" size={20} /> Indirizzo esatto (solo per te e i confermati): {address}</li>
        <li><Icon name="users" size={20} /> Fino a {preview.maxPartecipanti} persone</li>
        <li><Icon name="shield" size={20} /> {approval ? 'Approvi tu ogni richiesta' : 'Si entra subito, finché ci sono posti'}</li>
      </ul>
    </>
  )
}
