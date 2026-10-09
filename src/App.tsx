import { appConfig } from './config/app'

export function App() {
  return (
    <main className="card">
      <h1>{appConfig.name}</h1>
      <p>Benvenuto! L'app è in costruzione.</p>
    </main>
  )
}
