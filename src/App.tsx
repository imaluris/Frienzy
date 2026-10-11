import { useState } from 'react'
import { ServicesProvider, useServices } from './app/ServicesContext'
import { useSession } from './auth/useSession'
import type { Services } from './firebase/createServices'
import { appConfig } from './config/app'
import { HomeScreen } from './screens/HomeScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RegisterScreen } from './screens/RegisterScreen'

// Schermate per chi non è collegato. Lo stato "sto registrando" vive qui:
// quando l'utente entra questo componente sparisce, e al prossimo logout si riparte dal login.
function LoggedOut() {
  const [registering, setRegistering] = useState(false)
  return (
    <main>
      <h1 className="brand">{appConfig.name}</h1>
      {registering ? (
        <RegisterScreen onGoLogin={() => setRegistering(false)} />
      ) : (
        <LoginScreen onGoRegister={() => setRegistering(true)} />
      )}
    </main>
  )
}

// Sceglie la schermata in base a chi è collegato.
function Router() {
  const { auth } = useServices()
  const session = useSession(auth)
  if (!session.ready) return <p className="card">Caricamento…</p>
  return session.uid ? <HomeScreen /> : <LoggedOut />
}

export function App({ services }: { services: Services }) {
  return (
    <ServicesProvider services={services}>
      <Router />
    </ServicesProvider>
  )
}
