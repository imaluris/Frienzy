import { useEffect, useRef, useState } from 'react'
import { useServices } from '../app/ServicesContext'
import type { UserProfile } from '../domain/user'
import { useMyPosition } from '../filters/useMyPosition'
import { saveProfile } from '../profile/profileService'
import type { ProfileInput } from '../profile/validation'
import { Icon } from '../ui/Icon'
import { StepInterests } from './StepInterests'
import { StepLocation } from './StepLocation'
import { StepProfile } from './StepProfile'
import { StepProgress } from './StepProgress'
import { interestsActionLabel, nextStep, previousStep, validateProfileStep, type Step } from './steps'

const EMPTY: ProfileInput = { nome: '', dataNascita: '', bio: '', interessi: [], fotoUrl: '' }

// Passi 2-4 della registrazione (l'account esiste già): profilo, interessi, posizione.
// Il profilo si salva solo alla fine, così chi esce a metà non lascia un profilo incompleto.
export function OnboardingFlow({ uid, onSaved }: { uid: string; onSaved: (profile: UserProfile) => void }) {
  const { users, auth } = useServices()
  const [step, setStep] = useState<Step>('profilo')
  const [input, setInput] = useState<ProfileInput>(EMPTY)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { state: position, ask } = useMyPosition()
  const finishing = useRef(false)

  async function finish() {
    if (finishing.current) return
    finishing.current = true
    setBusy(true)
    try {
      onSaved(await saveProfile(users, uid, input))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Qualcosa è andato storto.')
      finishing.current = false
      setBusy(false)
    }
  }

  // Quando il telefono ha risposto alla richiesta di posizione (sì, no o non disponibile) si conclude.
  useEffect(() => {
    if (position.status !== 'idle' && position.status !== 'asking') void finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.status])

  function goNext() {
    if (step === 'profilo') {
      const problem = validateProfileStep(input)
      setError(problem)
      if (problem) return
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
        {step === 'profilo' && <StepProfile input={input} error={error} onChange={(patch) => setInput((old) => ({ ...old, ...patch }))} />}
        {step === 'interessi' && <StepInterests selected={input.interessi} onChange={(interessi) => setInput((old) => ({ ...old, interessi }))} />}
        {step === 'posizione' && <StepLocation />}
        {step === 'posizione' && error && <p role="alert" className="error">{error}</p>}
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
