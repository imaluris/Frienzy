import { Icon, type IconName } from '../ui/Icon'
import type { ToastMessage, ToastTone } from './toastModel'

const ICON: Partial<Record<ToastTone, IconName>> = { success: 'check-circle', warning: 'ban' }

// Messaggio breve sopra la barra a schede, annunciato agli screen reader (role="status").
export function Toast({ message }: { message: ToastMessage }) {
  const icon = ICON[message.tone]
  return (
    <p className={`toast toast-${message.tone}`} role="status">
      {icon && <Icon name={icon} size={20} />}
      <span>{message.text}</span>
    </p>
  )
}
