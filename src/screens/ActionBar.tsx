import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { FrienzyEvent } from '../domain/event'
import { barModel, WITHDRAW_COPY } from '../participation/actionBar'
import { joinEvent } from '../participation/joinEvent'
import type { ParticipationView } from '../participation/participationView'
import { useRunAction } from '../participation/useRunAction'
import { withdrawFromEvent } from '../participation/withdrawFromEvent'
import { ConfirmSheet } from '../ui/ConfirmSheet'
import { SeatsMeter } from '../ui/SeatsMeter'

interface Props {
  view: ParticipationView
  event: FrienzyEvent
  uid: string
  confirmedCount: number
  pendingCount: number
  onManage: () => void
  onChanged: () => void
}

// Barra fissa in basso: posti a sinistra, azione principale a destra. Ritirarsi chiede prima conferma.
export function ActionBar({ view, event, uid, confirmedCount, pendingCount, onManage, onChanged }: Props) {
  const { participations } = useServices()
  const { busy, error, run } = useRunAction(onChanged)
  const [confirming, setConfirming] = useState(false)
  const model = barModel(view)

  function press() {
    if (model.action === 'manage') onManage()
    else if (model.confirm) setConfirming(true)
    else if (model.action === 'join') void run(() => joinEvent(participations, event.id, uid))
  }

  async function confirmWithdraw() {
    await run(() => withdrawFromEvent(participations, event.id, uid))
    setConfirming(false)
  }

  const copy = view === 'confermato' || view === 'richiesta' ? WITHDRAW_COPY[view] : null
  return (
    <>
      <section className="action-bar" aria-label="Partecipazione">
        {error && <p role="alert" className="error action-error">{error}</p>}
        <div className="action-bar-row">
          <SeatsMeter max={event.maxPartecipanti} confirmed={confirmedCount} />
          <button type="button" className={`action-main${model.tone === 'secondary' ? ' secondary' : ''}`} disabled={busy || !model.action} aria-busy={busy && !confirming} onClick={press}>
            {model.label}
            {view === 'organizzatore' && pendingCount > 0 && <span className="action-count" aria-label={`${pendingCount} richieste`}>{pendingCount}</span>}
          </button>
        </div>
      </section>
      {confirming && copy && (
        <ConfirmSheet title={copy.title} text={copy.text} confirmLabel={copy.yes} busy={busy} onConfirm={confirmWithdraw} onClose={() => setConfirming(false)} />
      )}
    </>
  )
}
