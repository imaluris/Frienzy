// Intestazione fissa in alto: titolo e, se serve, il pulsante per tornare indietro.
export function AppHeader({ title, onBack }: { title: string; onBack: (() => void) | null }) {
  return (
    <header className="appbar">
      {onBack ? (
        <button type="button" className="back" aria-label="Indietro" onClick={onBack}>
          <span aria-hidden="true">←</span>
        </button>
      ) : (
        <span className="back-space" />
      )}
      <h1 className="appbar-title">{title}</h1>
    </header>
  )
}
