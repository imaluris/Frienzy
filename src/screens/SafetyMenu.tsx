import { useState } from 'react'
import { useToast } from '../feedback/ToastContext'
import { useBlocks } from '../safety/BlocksContext'
import { optionIcon, optionLabel, type SafetyOption } from '../safety/options'
import { BottomSheet } from '../ui/BottomSheet'
import { ConfirmSheet } from '../ui/ConfirmSheet'
import { Icon } from '../ui/Icon'
import { ReportSheet } from './ReportSheet'

interface Props {
  title: string
  options: SafetyOption[]
  onClose: () => void
  /** Chiamata dopo aver bloccato una persona (la schermata può, per esempio, tornare indietro). */
  onBlocked?: (uid: string) => void
}

// Menu "Altre azioni" (segnala / blocca) e i passi che ne seguono: ogni voce apre la sua finestra.
export function SafetyMenu({ title, options, onClose, onBlocked }: Props) {
  const { block } = useBlocks()
  const { show } = useToast()
  const [step, setStep] = useState<SafetyOption | null>(null)
  const [busy, setBusy] = useState(false)

  if (step && step.kind !== 'block-user') return <ReportSheet option={step} onClose={onClose} />

  if (step) {
    const confirmBlock = async () => {
      setBusy(true)
      try {
        await block(step.uid)
        show(`Hai bloccato ${step.nome}`, 'success')
        onClose()
        onBlocked?.(step.uid)
      } catch {
        show('Non sono riuscito a bloccare, riprova', 'warning')
        setBusy(false)
      }
    }
    return (
      <ConfirmSheet
        title={`Bloccare ${step.nome}?`}
        text={`Non vedrai più i suoi eventi e lui non vedrà i tuoi. Non potrà chiederti di partecipare. Puoi sbloccarlo quando vuoi dal Profilo.`}
        confirmLabel="Blocca" cancelLabel="Annulla" busy={busy} onConfirm={() => void confirmBlock()} onClose={onClose}
      />
    )
  }

  return (
    <BottomSheet title={title} onClose={onClose}>
      <ul className="menu-list">
        {options.map((option) => (
          <li key={option.kind + ('uid' in option ? option.uid : '')}>
            <button type="button" className={`menu-item${option.kind === 'block-user' ? ' menu-danger' : ''}`} onClick={() => setStep(option)}>
              <Icon name={optionIcon(option)} size={24} /> {optionLabel(option)}
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
