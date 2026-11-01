import { appConfig } from '../config/app'
import { Icon } from '../ui/Icon'
import { WelcomeArt } from './WelcomeArt'

interface Props {
  onRegister: () => void
  onLogin: () => void
}

// Prima schermata per chi non è collegato: logo grande, illustrazione, frase di presentazione e due pulsanti.
export function WelcomeScreen({ onRegister, onLogin }: Props) {
  return (
    <main className="welcome">
      <header className="welcome-brand">
        <img className="welcome-logo" src={appConfig.icon} alt="" />
        <h1 className="brand">{appConfig.name}</h1>
      </header>
      <WelcomeArt />
      <div className="welcome-copy">
        <h2>Nuove amicizie, una serata alla volta</h2>
        <p>Trova un aperitivo, una camminata o una mostra vicino a te e vai a conoscere gente nuova.</p>
      </div>
      <div className="welcome-actions">
        <button type="button" className="wide" onClick={onRegister}>Crea il tuo account <Icon name="next" size={20} /></button>
        <button type="button" className="secondary wide" onClick={onLogin}>Accedi</button>
        <p className="welcome-note"><Icon name="shield" size={16} /> Riservata a chi ha almeno 18 anni</p>
      </div>
    </main>
  )
}
