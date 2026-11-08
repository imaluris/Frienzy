import { useCallback, useEffect, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { authErrorMessage } from '../auth/errorMessages'
import { useCooldown } from '../auth/useCooldown'
import { useToast } from '../feedback/ToastContext'
import { Icon } from '../ui/Icon'

// Avviso nel Profilo finché l'email non è confermata. Non blocca l'uso dell'app: invita soltanto.
export function VerifyEmailBanner() {
  const { auth } = useServices()
  const { show } = useToast()
  const [verified, setVerified] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const cooldown = useCooldown()

  const check = useCallback(async () => {
    try {
      setVerified(await auth.isEmailVerified())
    } catch {
      setVerified(null) // offline o errore: meglio nessun avviso che un avviso sbagliato
    }
  }, [auth])
  useEffect(() => { void check() }, [check])

  async function resend() {
    setBusy(true)
    setError(null)
    try {
      await auth.sendVerificationEmail()
      cooldown.start()
      show('Email di conferma inviata')
    } catch (e) {
      setError(authErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  async function iConfirmed() {
    await check()
    if (await auth.isEmailVerified().catch(() => false)) show('Email confermata, grazie!', 'success')
    else setError('Non risulta ancora confermata: apri il link nell\'email e riprova.')
  }

  if (verified !== false) return null
  return (
    <section className="card verify-banner" aria-label="Conferma email">
      <div className="verify-head">
        <span className="verify-icon"><Icon name="mail" size={24} /></span>
        <div>
          <h3>Conferma la tua email</h3>
          <p className="muted">Apri il link che ti abbiamo scritto: ci aiuta a tenere al sicuro il tuo account.</p>
        </div>
      </div>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="verify-actions">
        <button type="button" className="secondary" disabled={busy || cooldown.seconds > 0} aria-busy={busy} onClick={() => void resend()}>
          {cooldown.seconds > 0 ? `Rinvia tra ${cooldown.seconds} s` : "Rinvia l'email"}
        </button>
        <button type="button" className="link" onClick={() => void iConfirmed()}>Ho confermato</button>
      </div>
    </section>
  )
}
