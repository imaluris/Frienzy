import { Icon } from '../ui/Icon'

// Intestazione fissa in alto: titolo e, se serve, il pulsante per tornare indietro.
export function AppHeader({ title, onBack }: { title: string; onBack: (() => void) | null }) {
  return (
    <header className="appbar">
      {onBack ? (
        <button type="button" className="back" aria-label="Indietro" onClick={onBack}>
          <Icon name="back" size={24} />
        </button>
      ) : null}
      <h1 className="appbar-title">{title}</h1>
    </header>
  )
}
