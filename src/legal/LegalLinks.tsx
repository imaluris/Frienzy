import { legalLink } from '../config/links'
import { Icon } from '../ui/Icon'

// Scheda del Profilo con i due testi legali. Si aprono sul sito, fuori dall'app.
export function LegalLinks() {
  return (
    <section className="card legal-links" aria-label="Informazioni legali">
      <h3>Informazioni</h3>
      <a className="legal-link" href={legalLink('privacy')} target="_blank" rel="noopener noreferrer"><Icon name="shield" size={20} /> Informativa privacy</a>
      <a className="legal-link" href={legalLink('termini')} target="_blank" rel="noopener noreferrer"><Icon name="file-text" size={20} /> Termini d'uso</a>
    </section>
  )
}
