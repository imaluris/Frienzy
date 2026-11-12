import { Icon } from '../ui/Icon'

interface Props {
  title: string
  /** 0 = sopra la copertina (solo i due tasti tondi), 1 = barra piena con titolo. */
  progress: number
  onBack: () => void
  onShare: (() => void) | null
  /** Apre il menu segnala/blocca; assente per chi organizza l'evento. */
  onMore?: (() => void) | null
}

// Barra fissa in alto nel dettaglio: indietro e condividi sempre a portata di pollice; il titolo compare scorrendo.
export function DetailTopBar({ title, progress, onBack, onShare, onMore = null }: Props) {
  return (
    <header className="detail-bar" style={{ ['--p' as string]: progress, backgroundColor: `color-mix(in srgb, var(--color-background) ${Math.round(progress * 100)}%, transparent)` }}>
      <button type="button" className="round-btn" aria-label="Indietro" onClick={onBack}><Icon name="back" size={24} /></button>
      <p className="detail-bar-title" aria-hidden={progress < 0.9}>{title}</p>
      <div className="detail-bar-actions">
        {onShare ? <button type="button" className="round-btn" aria-label="Condividi" onClick={onShare}><Icon name="share" size={24} /></button> : <span className="round-spacer" />}
        {onMore && <button type="button" className="round-btn" aria-label="Altre azioni" onClick={onMore}><Icon name="more" size={24} /></button>}
      </div>
    </header>
  )
}
