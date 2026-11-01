import { useState } from 'react'
import { ServicesProvider, useServices } from './app/ServicesContext'
import { useSession } from './auth/useSession'
import type { Services } from './firebase/createServices'
import { AuthBrand } from './screens/AuthBrand'
import { LoginScreen } from './screens/LoginScreen'
import { ProfileGate } from './screens/ProfileGate'
import { RegisterScreen } from './screens/RegisterScreen'
import { WelcomeScreen } from './screens/WelcomeScreen'
import { Icon } from './ui/Icon'

// Schermate per chi non è collegato: benvenuto, poi accesso o registrazione (con freccia per tornare al benvenuto).
// Lo stato vive qui: quando l'utente entra questo componente sparisce, e al prossimo logout si riparte dal benvenuto.
type Mode = 'welcome' | 'login' | 'register'

function LoggedOut() {
  const [mode, setMode] = useState<Mode>('welcome')
  if (mode === 'welcome') return <WelcomeScreen onRegister={() => setMode('register')} onLogin={() => setMode('login')} />
  return (
    <main className="auth">
      <button type="button" className="icon-button auth-back" aria-label="Indietro" onClick={() => setMode('welcome')}><Icon name="back" /></button>
      <AuthBrand />
      {mode === 'register' ? <RegisterScreen onGoLogin={() => setMode('login')} /> : <LoginScreen onGoRegister={() => setMode('register')} />}
    </main>
  )
}

// Sceglie la schermata in base a chi è collegato.
function Router() {
  const { auth } = useServices()
  const session = useSession(auth)
  if (!session.ready) return <p className="card">Caricamento…</p>
  return session.uid ? <ProfileGate uid={session.uid} /> : <LoggedOut />
}

export function App({ services }: { services: Services }) {
  return (
    <ServicesProvider services={services}>
      <Router />
    </ServicesProvider>
  )
}
