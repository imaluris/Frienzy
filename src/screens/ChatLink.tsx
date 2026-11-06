import { Icon } from '../ui/Icon'

// Riga nel dettaglio: apre la chat se sei organizzatore o confermato, altrimenti spiega quando si apre.
export function ChatLink({ open, onOpen }: { open: boolean; onOpen: () => void }) {
  if (!open) {
    return (
      <div className="chat-link locked" role="note">
        <span className="chat-link-icon"><Icon name="chat" size={24} /></span>
        <span className="chat-link-text"><strong>Chat dell'evento</strong><small>La chat si apre quando sei confermato.</small></span>
      </div>
    )
  }
  return (
    <button type="button" className="chat-link" onClick={onOpen}>
      <span className="chat-link-icon"><Icon name="chat" size={24} filled /></span>
      <span className="chat-link-text"><strong>Chat dell'evento</strong><small>Parla con chi organizza e con gli altri iscritti.</small></span>
      <Icon name="next" size={20} />
    </button>
  )
}
