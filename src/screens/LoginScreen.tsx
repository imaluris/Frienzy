import { authErrorMessage } from '../auth/errorMessages'
import { validateLogin } from '../auth/validation'
import { useServices } from '../app/ServicesContext'
import { AuthForm } from './AuthForm'

export function LoginScreen({ onGoRegister }: { onGoRegister: () => void }) {
  const { auth } = useServices()
  return (
    <>
      <AuthForm
        title="Accedi"
        submitLabel="Accedi"
        askConfirm={false}
        validate={(email, password) => validateLogin(email, password)}
        onSubmit={async (email, password) => void (await auth.login(email, password))}
        describeError={authErrorMessage}
      />
      <p className="switch">
        Non hai un account? <button type="button" className="link" onClick={onGoRegister}>Registrati</button>
      </p>
    </>
  )
}
