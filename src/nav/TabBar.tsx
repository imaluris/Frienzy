import { Icon, type IconName } from '../ui/Icon'
import { TAB_LABEL, type Tab } from './navState'

const TABS: { tab: Tab; icon: IconName }[] = [
  { tab: 'eventi', icon: 'calendar' },
  { tab: 'mappa', icon: 'map' },
  { tab: 'crea', icon: 'plus' },
  { tab: 'miei', icon: 'ticket' },
  { tab: 'profilo', icon: 'user' },
]

// Barra a schede stile Material 3: icona a contorno, piena e con "pillola" dietro quando è la scheda attiva.
export function TabBar({ active, onSelect }: { active: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Sezioni">
      {TABS.map(({ tab, icon }) => {
        const isActive = tab === active
        return (
          <button key={tab} type="button" className="tab" aria-current={isActive ? 'page' : undefined} onClick={() => onSelect(tab)}>
            <span className="tab-pill"><Icon name={icon} size={24} filled={isActive} /></span>
            <span className="tab-label">{TAB_LABEL[tab]}</span>
          </button>
        )
      })}
    </nav>
  )
}
