import { appConfig } from '../config/app'

/** Saluto in base all'ora: mattina, pomeriggio, sera. */
export function greeting(name: string, now: Date = new Date()): string {
  const hour = now.getHours()
  const hello = hour < 5 ? 'Buonasera' : hour < 13 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'
  return `${hello}, ${name}`
}

// Testata della schermata Eventi: logo e nome dell'app piccoli, saluto grande.
export function HomeHeader({ name }: { name: string }) {
  return (
    <header className="home-header">
      <img className="home-logo" src={appConfig.icon} alt="" />
      <div>
        <p className="home-brand">{appConfig.name}</p>
        <h1 className="home-title">{greeting(name)}</h1>
      </div>
    </header>
  )
}
