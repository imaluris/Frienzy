import { EmptyArt } from '../art/EmptyArt'

// Caricamento fallito: se il telefono è senza rete si vede l'illustrazione "offline", altrimenti quella dell'errore.
export function LoadFailed({ text }: { text: string }) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  return (
    <div className="empty-state" role="alert">
      <EmptyArt kind={offline ? 'offline' : 'failure'} label="" />
      <p className="error">{offline ? 'Sei offline: controlla la connessione e riprova.' : text}</p>
    </div>
  )
}
