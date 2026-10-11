import { appConfig } from '../config/app'
import { useServices } from '../app/ServicesContext'

// Schermata per chi è collegato (per ora solo benvenuto e uscita).
export function HomeScreen() {
  const { auth } = useServices()
  return (
    <main className="card">
      <h1>{appConfig.name}</h1>
      <p>Benvenuto! L'app è in costruzione.</p>
      <button type="button" onClick={() => void auth.logout()}>Esci</button>
    </main>
  )
}
