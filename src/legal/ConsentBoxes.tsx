import { useEffect, useRef } from 'react'
import { legalLink } from '../config/links'
import type { ConsentChecks } from './consent'

interface Props {
  checks: ConsentChecks
  /** Messaggio da mostrare sotto le caselle (manca una spunta). */
  error?: string | null
  onChange: (checks: ConsentChecks) => void
}

// Le due caselle obbligatorie della registrazione: maggiore età e accettazione dei testi legali.
// I link si aprono in una nuova scheda, così non si perde quello che si è già scritto nel form.
export function ConsentBoxes({ checks, error, onChange }: Props) {
  const alert = useRef<HTMLParagraphElement>(null)
  // Il pulsante Continua è fisso in basso e coprirebbe il messaggio: lo si porta in vista.
  useEffect(() => { if (error) alert.current?.scrollIntoView?.({ block: 'center' }) }, [error])
  return (
    <fieldset className="consent">
      <legend className="sr-only">Maggiore età e condizioni</legend>
      <label className="consent-row">
        <input type="checkbox" checked={checks.adult} onChange={(e) => onChange({ ...checks, adult: e.target.checked })} />
        <span>Ho almeno 18 anni.</span>
      </label>
      <label className="consent-row">
        <input type="checkbox" checked={checks.terms} onChange={(e) => onChange({ ...checks, terms: e.target.checked })} />
        <span>
          Accetto i <a href={legalLink('termini')} target="_blank" rel="noopener noreferrer">Termini d'uso</a> e
          l'<a href={legalLink('privacy')} target="_blank" rel="noopener noreferrer">Informativa privacy</a>.
        </span>
      </label>
      {error && <p ref={alert} role="alert" className="error">{error}</p>}
    </fieldset>
  )
}
