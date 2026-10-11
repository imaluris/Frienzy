import { authErrorMessage } from '../auth/errorMessages'
import { validateRegistration } from '../auth/validation'
import { useServices } from '../app/ServicesContext'
import { AuthForm } from './AuthForm'

export function RegisterScreen({ onGoLogin }: { onGoLogin: () => void }) {
  const { auth } = useServices()
  return (
    <>
      <AuthForm
        title="Crea il tuo account"
        submitLabel="Registrati"
        askConfirm
        validate={validateRegistration}
        onSubmit={async (email, password) => void (await auth.register(email, password))}
        describeError={authErrorMessage}
      />
      <p className="switch">
        Hai già un account? <button type="button" className="link" onClick={onGoLogin}>Accedi</button>
      </p>
    </>
  )
}
