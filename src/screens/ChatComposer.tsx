import { useState, type FormEvent } from 'react'
import { checkMessageText } from '../chat/chatRules'
import { MAX_MESSAGE_LENGTH } from '../chat/message'
import { Icon } from '../ui/Icon'

// Campo di scrittura fisso in fondo: invio con il pulsante tondo; contatore solo quando ci si avvicina al limite.
export function ChatComposer({ onSend }: { onSend: (testo: string) => Promise<string | null> }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const canSend = checkMessageText(text).ok && !busy

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSend) return
    setBusy(true)
    const failure = await onSend(text)
    setBusy(false)
    setError(failure ?? '')
    if (!failure) setText('')
  }

  return (
    <form className="chat-composer" onSubmit={submit}>
      {error && <p role="alert" className="error chat-error">{error}</p>}
      <div className="chat-composer-row">
        <textarea
          aria-label="Scrivi un messaggio"
          placeholder="Scrivi un messaggio…"
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="chat-send" aria-label="Invia" disabled={!canSend}><Icon name="send" size={24} /></button>
      </div>
      {text.length >= MAX_MESSAGE_LENGTH - 60 && <small className="chat-count">{text.length}/{MAX_MESSAGE_LENGTH}</small>}
    </form>
  )
}
