import { authErrorMessage } from '../auth/errorMessages'
import { validateRegistration } from '../auth/validation'
import { useServices } from '../app/ServicesContext'
import { StepProgress } from '../onboarding/StepProgress'
import { AuthForm } from './AuthForm'

export function RegisterScreen({ onGoLogin }: { onGoLogin: () => void }) {
  const { auth } = useServices()
  return (
    <>
      <StepProgress step="account" />
      <AuthForm
        title="Crea il tuo account"
        submitLabel="Continua"
        askConfirm
        validate={validateRegistration}
        onSubmit={async (email, password) => {
          await auth.register(email, password)
          // L'email di conferma è un di più: se non parte (rete, limiti) la registrazione resta valida e il Profilo la richiederà.
          await auth.sendVerificationEmail().catch(() => undefined)
        }}
        describeError={authErrorMessage}
      />
      <p className="switch">
        Hai già un account? <button type="button" className="link" onClick={onGoLogin}>Accedi</button>
      </p>
    </>
  )
}
