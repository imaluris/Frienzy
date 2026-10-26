import { TAB_LABEL, type Tab } from './navState'

const TABS: { tab: Tab; icon: string }[] = [
  { tab: 'eventi', icon: '🗓️' },
  { tab: 'mappa', icon: '🗺️' },
  { tab: 'crea', icon: '➕' },
  { tab: 'miei', icon: '🎟️' },
  { tab: 'profilo', icon: '🙂' },
]

// Barra a schede in fondo allo schermo. La scheda attiva è segnata con aria-current.
export function TabBar({ active, onSelect }: { active: Tab; onSelect: (tab: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Sezioni">
      {TABS.map(({ tab, icon }) => (
        <button key={tab} type="button" className="tab" aria-current={tab === active ? 'page' : undefined} onClick={() => onSelect(tab)}>
          <span className="tab-icon" aria-hidden="true">{icon}</span>
          <span className="tab-label">{TAB_LABEL[tab]}</span>
        </button>
      ))}
    </nav>
  )
}
