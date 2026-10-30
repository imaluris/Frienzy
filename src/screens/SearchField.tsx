import { Icon } from '../ui/Icon'

// Campo di ricerca arrotondato con la lente a sinistra.
export function SearchField({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  return (
    <label className="search">
      <Icon name="search" size={20} />
      <input type="search" aria-label="Cerca eventi" placeholder="Cerca per titolo o zona" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
