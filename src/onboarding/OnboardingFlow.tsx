import { useEffect, useRef, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { UserProfile } from '../domain/user'
import { buildConsent, NO_CONSENT, validateConsent, type ConsentChecks } from '../legal/consent'
import { useMyPosition } from '../filters/useMyPosition'
import { positionMessage } from '../map/positionMessage'
import { saveProfile } from '../profile/profileService'
import type { ProfileInput } from '../profile/validation'
import { Icon } from '../ui/Icon'
import { StepInterests } from './StepInterests'
import { StepLocation } from './StepLocation'
import { StepProfile } from './StepProfile'
import { StepProgress } from './StepProgress'
import { interestsActionLabel, nextStep, previousStep, validateProfileStep, type Step } from './steps'
import { errorMessage } from '../errors/reportError'

const EMPTY: ProfileInput = { nome: '', dataNascita: '', bio: '', interessi: [], fotoUrl: '' }

// Passi 2-4 della registrazione (l'account esiste già): profilo, interessi, posizione.
// Il profilo si salva solo alla fine, così chi esce a metà non lascia un profilo incompleto.
export function OnboardingFlow({ uid, onSaved }: { uid: string; onSaved: (profile: UserProfile) => void }) {
  const { users, auth } = useServices()
  const [step, setStep] = useState<Step>('profilo')
  const [input, setInput] = useState<ProfileInput>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [consentError, setConsentError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { state: position, ask } = useMyPosition()
  const [checks, setChecks] = useState<ConsentChecks>(NO_CONSENT)
  const finishing = useRef(false)
  const positionNote = positionMessage(position)

  async function finish() {
    if (finishing.current) return
    finishing.current = true
    setBusy(true)
    try {
      onSaved(await saveProfile(users, uid, input, new Date(), buildConsent(checks)))
    } catch (e) {
      setError(errorMessage(e, 'registrazione'))
      finishing.current = false
      setBusy(false)
    }
  }

  // Quando la posizione è stata letta (o il dispositivo non la offre) si conclude.
  // Se il permesso è negato si resta qui con il messaggio: "Attiva la posizione" riprova (o apre le impostazioni
  // dell'app) e "Non ora" prosegue senza posizione.
  // Solo nell'ultimo passo: se il permesso era già concesso la posizione si legge da sola fin dall'inizio,
  // e senza questo controllo la registrazione si chiuderebbe (con errore) già sul passo del profilo.
  useEffect(() => {
    if (step === 'posizione' && (position.status === 'ok' || position.status === 'unsupported')) void finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, position.status])

  function goNext() {
    if (step === 'profilo') {
      // Prima i campi del profilo, poi le due caselle (maggiore età e termini).
      const problem = validateProfileStep(input)
      const consentProblem = problem ? null : validateConsent(checks)
      setError(problem)
      setConsentError(consentProblem)
      if (problem || consentProblem) return
    }
    setStep(nextStep(step) ?? step)
  }

  const back = previousStep(step)
  return (
    <main className="auth onboarding">
      <header className="onboarding-top">
        {back && back !== 'account' ? (
          <button type="button" className="icon-button" aria-label="Indietro" onClick={() => setStep(back)}><Icon name="back" /></button>
        ) : null}
        <StepProgress step={step} />
      </header>
      <section className="onboarding-body">
        {step === 'profilo' && <StepProfile input={input} error={error} checks={checks} onChecks={(next) => { setChecks(next); setConsentError(null) }} consentError={consentError} onChange={(patch) => setInput((old) => ({ ...old, ...patch }))} />}
        {step === 'interessi' && <StepInterests selected={input.interessi} onChange={(interessi) => setInput((old) => ({ ...old, interessi }))} />}
        {step === 'posizione' && <StepLocation />}
        {step === 'posizione' && error && <p role="alert" className="error">{error}</p>}
        {step === 'posizione' && positionNote && <p role="status" className="step-hint centered">{positionNote}</p>}
      </section>
      <footer className="onboarding-actions">
        {step === 'posizione' ? (
          <>
            <button type="button" className="wide" aria-busy={busy || position.status === 'asking'} onClick={ask}>Attiva la posizione</button>
            <button type="button" className="link" disabled={busy} onClick={() => void finish()}>Non ora</button>
          </>
        ) : (
          <>
            <button type="button" className="wide" onClick={goNext}>{step === 'interessi' ? interestsActionLabel(input.interessi.length) : 'Continua'}</button>
            {step === 'profilo' && <button type="button" className="link" onClick={() => void auth.logout()}>Esci</button>}
          </>
        )}
      </footer>
    </main>
  )
}
