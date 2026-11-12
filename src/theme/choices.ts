import type { IconName } from '../ui/Icon'
import type { ThemeChoice } from './preference'

// Le tre opzioni mostrate nel Profilo, con icona e testo.
export const CHOICE_OPTIONS: ReadonlyArray<{ value: ThemeChoice; label: string; icon: IconName }> = [
  { value: 'chiaro', label: 'Chiaro', icon: 'sun' },
  { value: 'scuro', label: 'Scuro', icon: 'moon' },
  { value: 'auto', label: 'Automatico', icon: 'phone' },
]
