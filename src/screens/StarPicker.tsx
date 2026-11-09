import { Icon } from '../ui/Icon'

interface Props {
  value: number
  onChange: (stars: number) => void
  disabled?: boolean
}

// Cinque stelle da toccare (voto 1-5). Gruppo di pulsanti radio: leggibile anche da screen reader ("3 stelle").
export function StarPicker({ value, onChange, disabled = false }: Props) {
  return (
    <div className="stars" role="radiogroup" aria-label="Il tuo voto">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} ${n === 1 ? 'stella' : 'stelle'}`} disabled={disabled} className={n <= value ? 'star on' : 'star'} onClick={() => onChange(n)}>
          <Icon name="star" size={32} solid={n <= value} />
        </button>
      ))}
    </div>
  )
}
