import { useState, type FormEvent } from 'react'

interface Props {
  title: string
  submitLabel: string
  /** Se true mostra anche il campo "ripeti password". */
  askConfirm: boolean
  /** Controlla i dati: messaggio d'errore oppure null. */
  validate: (email: string, password: string, confirm: string) => string | null
  /** Esegue l'azione vera (registrazione o login). Può lanciare un errore. */
  onSubmit: (email: string, password: string) => Promise<void>
  /** Trasforma un errore in testo. */
  describeError: (error: unknown) => string
}

// Form riusato da login e registrazione: cambiano solo campi e azione.
export function AuthForm({ title, submitLabel, askConfirm, validate, onSubmit, describeError }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const problem = validate(email, password, confirm)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      await onSubmit(email.trim(), password)
    } catch (e) {
      setError(describeError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>{title}</h2>
      <label>
        Email
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete={askConfirm ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {askConfirm && (
        <label>
          Ripeti la password
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
      )}
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" disabled={busy}>{submitLabel}</button>
    </form>
  )
}
