import { useState, type FormEvent } from 'react'
import { useServices } from '../app/ServicesContext'
import { authErrorMessage } from '../auth/errorMessages'
import { requestPasswordReset } from '../auth/emailActions'
import { useCooldown } from '../auth/useCooldown'
import { Icon } from '../ui/Icon'

// "Password dimenticata?": una sola domanda (l'email) e una risposta uguale per tutti gli indirizzi validi.
export function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const { auth } = useServices()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const cooldown = useCooldown()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      setSent(await requestPasswordReset(auth, email))
      cooldown.start()
    } catch (e) {
      setError(e instanceof Error && (e as { code?: string }).code === 'auth/invalid-email' ? e.message : authErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <form className="card" onSubmit={handleSubmit} noValidate>
        <h2>Password dimenticata?</h2>
        <p className="muted">Scrivi l'email con cui ti sei iscritto: ti mandiamo un link per sceglierne una nuova.</p>
        <label>
          Email
          <input type="email" inputMode="email" autoComplete="email" aria-invalid={error ? true : undefined} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {error && <p role="alert" className="error">{error}</p>}
        {sent && (
          <p className="status-note status-ok" role="status">
            <Icon name="mail-check" size={20} />
            <span>{sent}</span>
          </p>
        )}
        <button type="submit" disabled={busy || cooldown.seconds > 0} aria-busy={busy}>
          {cooldown.seconds > 0 ? `Puoi rinviarlo tra ${cooldown.seconds} s` : sent ? 'Invia di nuovo' : 'Invia il link'}
        </button>
      </form>
      <p className="switch">
        <button type="button" className="link" onClick={onBack}>Torna all'accesso</button>
      </p>
    </>
  )
}
