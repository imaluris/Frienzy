import { Icon } from '../ui/Icon'

interface Props {
  title: string
  /** 0 = sopra la copertina (solo i due tasti tondi), 1 = barra piena con titolo. */
  progress: number
  onBack: () => void
  onShare: (() => void) | null
}

// Barra fissa in alto nel dettaglio: indietro e condividi sempre a portata di pollice; il titolo compare scorrendo.
export function DetailTopBar({ title, progress, onBack, onShare }: Props) {
  return (
    <header className="detail-bar" style={{ ['--p' as string]: progress, backgroundColor: `rgba(255, 248, 240, ${progress})` }}>
      <button type="button" className="round-btn" aria-label="Indietro" onClick={onBack}><Icon name="back" size={24} /></button>
      <p className="detail-bar-title" aria-hidden={progress < 0.9}>{title}</p>
      {onShare ? <button type="button" className="round-btn" aria-label="Condividi" onClick={onShare}><Icon name="share" size={24} /></button> : <span className="round-spacer" />}
    </header>
  )
}
