import { useEffect } from 'react'
import { useServices } from '../app/ServicesContext'
import { useMyPosition } from '../filters/useMyPosition'
import { buildDevice } from '../notifications/device'
import { PREF_KEYS, PREF_LABELS } from '../notifications/prefs'
import { useNotificationPrefs } from '../notifications/useNotificationPrefs'
import { usePush } from '../push/usePush'
import { Icon } from '../ui/Icon'

// Scheda "Notifiche" del Profilo: attivazione sul telefono e quattro interruttori.
export function NotificationSettings({ uid }: { uid: string }) {
  const { push, notifications } = useServices()
  const { prefs, loaded, error, toggle } = useNotificationPrefs(uid)
  const { state, enable } = usePush(push)
  const position = useMyPosition()
  const point = position.state.status === 'ok' ? position.state.point : null

  // Quando arriva il token (o cambia la zona) si aggiorna il dispositivo salvato.
  useEffect(() => {
    const device = buildDevice(state.token, point, prefs.inviti)
    if (device) void notifications.saveDevice(uid, device).catch(() => undefined)
  }, [state.token, point, prefs.inviti, notifications, uid])

  function onToggle(key: (typeof PREF_KEYS)[number]) {
    // Per gli inviti serve la zona: la si chiede nel momento in cui si accendono.
    if (key === 'inviti' && !prefs.inviti) position.ask()
    void toggle(key)
  }

  return (
    <section className="card notif-card" aria-label="Notifiche">
      <h3><Icon name="bell" size={20} /> Notifiche</h3>
      {state.status === 'unsupported' && <p className="muted">Le notifiche arrivano sul telefono, dentro l'app Android.</p>}
      {state.status === 'denied' && <p className="muted">Le notifiche sono bloccate: puoi riattivarle dalle impostazioni del telefono.</p>}
      {state.status === 'error' && <p role="alert" className="error">{state.error}</p>}
      {(state.status === 'idle' || state.status === 'registering') && (
        <button type="button" className="secondary wide" onClick={() => void enable()} aria-busy={state.status === 'registering'}>Attiva le notifiche</button>
      )}
      {state.status === 'registered' && <p className="notif-on"><Icon name="check-circle" size={20} /> Notifiche attive su questo telefono</p>}
      <ul className="notif-list">
        {PREF_KEYS.map((key) => (
          <li key={key} className="notif-row">
            <span className="notif-text">
              <strong>{PREF_LABELS[key].title}</strong>
              <span className="muted">{PREF_LABELS[key].hint}</span>
            </span>
            <button type="button" role="switch" aria-checked={prefs[key]} aria-label={PREF_LABELS[key].title} disabled={!loaded} className="switch" onClick={() => onToggle(key)}>
              <span className="switch-knob" />
            </button>
          </li>
        ))}
      </ul>
      {prefs.inviti && position.state.status === 'denied' && <p className="muted">Senza la posizione non posso invitarti a eventi vicini.</p>}
      {error && <p role="alert" className="error">{error}</p>}
    </section>
  )
}
