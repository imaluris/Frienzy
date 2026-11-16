import { EmptyArt } from '../art/EmptyArt'

interface Props {
  text: string
  /** Se c'è, compare il pulsante "Riprova". */
  onRetry?: () => void
}

// Caricamento fallito: se il telefono è senza rete si vede l'illustrazione "offline", altrimenti quella dell'errore.
export function LoadFailed({ text, onRetry }: Props) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  return (
    <div className="empty-state" role="alert">
      <EmptyArt kind={offline ? 'offline' : 'failure'} label="" />
      <p className="error">{offline ? 'Sei offline: controlla la connessione e riprova.' : text}</p>
      {onRetry && <button type="button" className="secondary" onClick={onRetry}>Riprova</button>}
    </div>
  )
}
