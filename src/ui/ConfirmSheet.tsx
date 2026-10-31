import { BottomSheet } from './BottomSheet'

interface Props {
  title: string
  text: string
  confirmLabel: string
  cancelLabel?: string
  busy?: boolean
  onConfirm: () => void
  onClose: () => void
}

// Conferma prima di un'azione che non si annulla con un tocco: due pulsanti grandi, "resta" è quello sicuro.
export function ConfirmSheet({ title, text, confirmLabel, cancelLabel = 'No, resta', busy = false, onConfirm, onClose }: Props) {
  return (
    <BottomSheet title={title} onClose={onClose}>
      <p className="sheet-text">{text}</p>
      <div className="sheet-actions">
        <button type="button" className="danger" disabled={busy} aria-busy={busy} onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" className="secondary" disabled={busy} onClick={onClose}>{cancelLabel}</button>
      </div>
    </BottomSheet>
  )
}
