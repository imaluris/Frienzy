import { appConfig } from '../config/app'
import { Icon } from '../ui/Icon'

/** Saluto in base all'ora: mattina, pomeriggio, sera. */
export function greeting(name: string, now: Date = new Date()): string {
  const hour = now.getHours()
  const hello = hour < 5 ? 'Buonasera' : hour < 13 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'
  return `${hello}, ${name}`
}

// Testata della schermata Eventi: logo e nome dell'app piccoli, saluto grande.
export function HomeHeader({ name, alertCount = 0, onOpenAlerts }: { name: string; alertCount?: number; onOpenAlerts?: () => void }) {
  return (
    <header className="home-header">
      <img className="home-logo" src={appConfig.icon} alt="" />
      <div className="home-text">
        <p className="home-brand">{appConfig.name}</p>
        <h1 className="home-title">{greeting(name)}</h1>
      </div>
      {onOpenAlerts && (
        <button type="button" className="bell" onClick={onOpenAlerts} aria-label={alertCount > 0 ? `Avvisi, ${alertCount} nuovi` : 'Avvisi'}>
          <Icon name="bell" size={24} />
          {alertCount > 0 && <span className="bell-badge" aria-hidden="true">{alertCount > 9 ? '9+' : alertCount}</span>}
        </button>
      )}
    </header>
  )
}
