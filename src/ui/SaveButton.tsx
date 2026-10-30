import { useState } from 'react'
import { Icon } from './Icon'

// Cuore per salvare l'evento. Per ora lo stato vive solo qui (non si ricorda): la memoria vera arriva dopo.
export function SaveButton() {
  const [saved, setSaved] = useState(false)
  return (
    <button
      type="button"
      className={`save-button${saved ? ' is-saved' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? 'Rimuovi dai salvati' : 'Salva evento'}
      onClick={() => setSaved((s) => !s)}
    >
      <Icon name="heart" size={20} solid={saved} />
    </button>
  )
}
