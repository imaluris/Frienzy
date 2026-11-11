import type { AlertKind, AppAlert } from '../alerts/alertTypes'
import { Icon, type IconName } from '../ui/Icon'

const ICON: Record<AlertKind, IconName> = { richieste: 'users', risposte: 'check-circle', inviti: 'sparkles' }

interface Props {
  alert: AppAlert
  /** Non ancora visto prima di aprire la schermata. */
  fresh: boolean
  onOpen: (eventId: string) => void
}

// Una riga della schermata Avvisi: icona del tipo, titolo, frase, e un puntino terracotta se è nuova.
export function AlertRow({ alert, fresh, onOpen }: Props) {
  return (
    <li>
      <button type="button" className={`alert-row alert-${alert.kind}${fresh ? ' is-fresh' : ''}`} onClick={() => onOpen(alert.eventId)}>
        <span className="alert-icon" aria-hidden="true"><Icon name={ICON[alert.kind]} size={24} /></span>
        <span className="alert-text">
          <strong>{alert.title}</strong>
          <span>{alert.body}</span>
        </span>
        {fresh && <span className="alert-dot" role="img" aria-label="Nuovo" />}
      </button>
    </li>
  )
}
