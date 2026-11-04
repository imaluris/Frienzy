import { haptic } from '../feedback/haptics'
import { useToast } from '../feedback/ToastContext'
import { useSaved } from '../saved/SavedContext'
import { Icon } from './Icon'

// Cuore per salvare l'evento: lo stato vive in SavedProvider e si ricorda anche dopo aver chiuso l'app.
export function SaveButton({ eventId, className = '' }: { eventId: string; className?: string }) {
  const { isSaved, toggle } = useSaved()
  const { show } = useToast()
  const saved = isSaved(eventId)
  return (
    <button
      type="button"
      className={`save-button${saved ? ' is-saved' : ''} ${className}`.trim()}
      aria-pressed={saved}
      aria-label={saved ? 'Rimuovi dai salvati' : 'Salva evento'}
      onClick={() => {
        void haptic('tap')
        void toggle(eventId).then((now) => show(now ? 'Salvato' : 'Tolto dai salvati', 'info'))
      }}
    >
      <Icon name="heart" size={20} solid={saved} />
    </button>
  )
}
