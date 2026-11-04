export type MineTab = 'organizzo' | 'iscrizioni' | 'salvati'

const TABS: { id: MineTab; label: string }[] = [
  { id: 'organizzo', label: 'Organizzo' },
  { id: 'iscrizioni', label: 'Iscrizioni' },
  { id: 'salvati', label: 'Salvati' },
]

interface Props {
  active: MineTab
  onSelect: (tab: MineTab) => void
  counts: Record<MineTab, number>
}

// Selettore a segmenti sopra le liste di "I miei eventi", con il numero di elementi accanto a ogni voce.
export function MineTabs({ active, onSelect, counts }: Props) {
  return (
    <div className="segments" role="tablist" aria-label="I miei eventi">
      {TABS.map(({ id, label }) => (
        <button key={id} type="button" role="tab" aria-selected={active === id} onClick={() => onSelect(id)}>
          {label}
          {counts[id] > 0 && <span className="count" aria-label={`${counts[id]}`}>{counts[id]}</span>}
        </button>
      ))}
    </div>
  )
}
