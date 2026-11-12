import { CHOICE_OPTIONS } from '../theme/choices'
import { useTheme } from '../theme/useTheme'
import { Icon } from '../ui/Icon'

// Scheda "Aspetto" del Profilo: tema Chiaro, Scuro o Automatico (segue il telefono).
export function AppearanceSettings() {
  const { choice, mode, setChoice } = useTheme()
  return (
    <section className="card appearance-card" aria-label="Aspetto">
      <h3><Icon name={mode === 'scuro' ? 'moon' : 'sun'} size={20} /> Aspetto</h3>
      <div className="theme-options" role="radiogroup" aria-label="Tema dell'app">
        {CHOICE_OPTIONS.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={choice === o.value} className="theme-option" onClick={() => setChoice(o.value)}>
            <Icon name={o.icon} size={20} filled={choice === o.value} />
            <span>{o.label}</span>
          </button>
        ))}
      </div>
      <p className="muted theme-hint">{choice === 'auto' ? 'Segue le impostazioni del telefono.' : 'Scelta salvata su questo telefono.'}</p>
    </section>
  )
}
