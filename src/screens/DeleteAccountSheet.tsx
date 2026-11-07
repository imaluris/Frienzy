import { useEffect, useState, type FormEvent } from 'react'
import { useServices } from '../app/ServicesContext'
import { AccountDeletionError, countEventsToCancel, deleteAccount, type DeletionStep } from '../account/deleteAccount'
import { authErrorMessage } from '../auth/errorMessages'
import { BottomSheet } from '../ui/BottomSheet'

// Frase da mostrare quando la cancellazione si ferma a metà: si dice a che punto e che riprovare è sicuro.
const STEP_TEXT: Record<DeletionStep, string> = {
  password: 'la verifica della password',
  messaggi: 'la cancellazione dei messaggi',
  eventi: "l'annullamento dei tuoi eventi",
  iscrizioni: 'il ritiro dalle iscrizioni',
  salvati: 'la cancellazione dei salvati',
  blocchi: 'la cancellazione dei blocchi',
  profilo: 'la cancellazione del profilo',
  account: "la chiusura dell'accesso",
}

export function errorText(error: unknown): string {
  if (error instanceof AccountDeletionError) {
    if (error.step === 'password') return authErrorMessage(error.cause) === 'Email o password errate.' ? 'Password errata.' : authErrorMessage(error.cause)
    return `Si è fermato durante ${STEP_TEXT[error.step]}. Riprova: quello che è già stato cancellato resta cancellato.`
  }
  return 'Qualcosa è andato storto. Riprova.'
}

// Eliminazione account in due passi: prima si spiega cosa succede, poi si conferma con la password.
export function DeleteAccountSheet({ onClose }: { onClose: () => void }) {
  const services = useServices()
  const [step, setStep] = useState<'info' | 'password'>('info')
  const [toCancel, setToCancel] = useState(0)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    countEventsToCancel(services).then((n) => active && setToCancel(n)).catch(() => undefined)
    return () => { active = false }
  }, [services])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await deleteAccount(services, password) // se va a buon fine l'utente risulta scollegato e questa schermata sparisce
    } catch (err) {
      setError(errorText(err))
      setBusy(false)
    }
  }

  if (step === 'info') {
    return (
      <BottomSheet title="Eliminare il tuo account?" onClose={onClose}>
        <p className="sheet-text">Verranno cancellati per sempre il tuo profilo, le tue iscrizioni, i tuoi messaggi nelle chat e gli eventi salvati. Non si può tornare indietro.</p>
        {toCancel > 0 && <p className="sheet-text delete-warning" role="status">{toCancel === 1 ? 'Verrà annullato 1 evento che organizzi e che non è ancora passato.' : `Verranno annullati ${toCancel} eventi che organizzi e che non sono ancora passati.`}</p>}
        <div className="sheet-actions">
          <button type="button" className="danger" onClick={() => setStep('password')}>Continua</button>
          <button type="button" className="secondary" onClick={onClose}>No, torno indietro</button>
        </div>
      </BottomSheet>
    )
  }
  return (
    <BottomSheet title="Conferma con la password" onClose={onClose}>
      <form onSubmit={(e) => void submit(e)}>
        <label>Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={error ? true : undefined} />
        </label>
        {error && <p role="alert" className="error">{error}</p>}
        <div className="sheet-actions">
          <button type="submit" className="danger" disabled={busy || password.length === 0} aria-busy={busy}>Elimina definitivamente</button>
          <button type="button" className="secondary" disabled={busy} onClick={onClose}>Annulla</button>
        </div>
      </form>
    </BottomSheet>
  )
}
