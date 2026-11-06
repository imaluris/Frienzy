import { Fragment, useEffect, useRef, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { canDeleteMessage } from '../chat/chatRules'
import { chatRoleOf } from '../chat/chatRole'
import { groupMessages } from '../chat/groupMessages'
import { useChat } from '../chat/useChat'
import type { ChatRole } from '../chat/message'
import { useToast } from '../feedback/ToastContext'
import { ConfirmSheet } from '../ui/ConfirmSheet'
import { EmptyState } from '../ui/EmptyState'
import { Icon } from '../ui/Icon'
import { ChatBubble } from './ChatBubble'
import { ChatComposer } from './ChatComposer'

interface Props {
  eventId: string
  uid: string
  onBack: () => void
}

// Chat dell'evento: elenco in tempo reale in alto, campo di scrittura fisso in basso.
export function ChatScreen({ eventId, uid, onBack }: Props) {
  const services = useServices()
  const { show } = useToast()
  const { messages, status, names } = useChat(services, eventId, uid)
  const [title, setTitle] = useState('')
  const [role, setRole] = useState<ChatRole>('nessuno')
  const [deleting, setDeleting] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void services.events.getById(eventId).then((e) => setTitle(e?.titolo ?? '')).catch(() => setTitle(''))
    void chatRoleOf(services.events, services.participations, eventId, uid).then(setRole).catch(() => setRole('nessuno'))
  }, [services, eventId, uid])

  // A ogni messaggio nuovo si scende in fondo, come in tutte le chat.
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: 'end' }) }, [messages.length])

  async function send(testo: string): Promise<string | null> {
    try {
      await services.chat.send(eventId, uid, testo)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Messaggio non inviato'
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await services.chat.remove(eventId, uid, deleting)
      show('Messaggio cancellato')
    } catch {
      show('Non sono riuscito a cancellarlo', 'warning')
    }
    setDeleting(null)
  }

  const items = groupMessages(messages, uid)
  const mayDelete = canDeleteMessage(role)
  return (
    <div className="chat-page">
      <header className="chat-top">
        <button type="button" className="icon-button" aria-label="Indietro" onClick={onBack}><Icon name="back" /></button>
        <div className="chat-top-text">
          <h1>Chat dell'evento</h1>
          {title && <p>{title}</p>}
        </div>
      </header>
      {status === 'loading' && <p className="loading chat-state">Caricamento…</p>}
      {status === 'denied' && (
        <div className="chat-state">
          <EmptyState art="no-messages" text="La chat si apre quando sei confermato."><p className="muted">Qui parlano chi organizza e chi ha il posto.</p></EmptyState>
        </div>
      )}
      {status === 'ready' && (
        <>
          <div className="chat-scroll">
            {items.length === 0 ? (
              <EmptyState art="no-messages" text="Ancora nessun messaggio. Rompi il ghiaccio!" />
            ) : (
              <ul className="chat-list" aria-label="Messaggi">
                {items.map((item) => (
                  <Fragment key={item.message.id}>
                    {item.dayLabel && <li className="chat-day">{item.dayLabel}</li>}
                    <ChatBubble item={item} authorName={names[item.message.authorUid] ?? '…'} onDelete={mayDelete ? () => setDeleting(item.message.id) : null} />
                  </Fragment>
                ))}
              </ul>
            )}
            <div ref={endRef} />
          </div>
          <ChatComposer onSend={send} />
        </>
      )}
      {deleting && (
        <ConfirmSheet title="Cancellare il messaggio?" text="Sparirà per tutti. Non si può annullare." confirmLabel="Sì, cancella" onConfirm={confirmDelete} onClose={() => setDeleting(null)} />
      )}
    </div>
  )
}
