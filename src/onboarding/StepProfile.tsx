import { ConsentBoxes } from '../legal/ConsentBoxes'
import type { ConsentChecks } from '../legal/consent'
import { BIO_MAX, type ProfileInput } from '../profile/validation'
import { Avatar } from '../ui/Avatar'

interface Props {
  input: ProfileInput
  error: string | null
  checks: ConsentChecks
  consentError: string | null
  onChecks: (checks: ConsentChecks) => void
  onChange: (patch: Partial<ProfileInput>) => void
}

// Passo 2: nome, data di nascita (serve solo per l'età e per il 18+) e due righe di bio.
export function StepProfile({ input, error, checks, consentError, onChecks, onChange }: Props) {
  return (
    <>
      <h2 className="step-title">Come ti chiami?</h2>
      <p className="step-hint">Gli altri vedranno il nome e l'età, mai la data di nascita.</p>
      <div className="avatar-edit step-avatar"><Avatar name={input.nome} size="lg" /></div>
      <label>
        Nome
        <input autoComplete="given-name" value={input.nome} aria-invalid={error ? true : undefined} onChange={(e) => onChange({ nome: e.target.value })} />
      </label>
      <label>
        Data di nascita
        <input type="date" value={input.dataNascita} onChange={(e) => onChange({ dataNascita: e.target.value })} />
      </label>
      <label>
        Bio ({input.bio.length}/{BIO_MAX})
        <textarea placeholder="Due righe su di te: cosa ti piace fare nel weekend?" value={input.bio} onChange={(e) => onChange({ bio: e.target.value })} />
      </label>
      <ConsentBoxes checks={checks} error={consentError} onChange={onChecks} />
      {error && <p role="alert" className="error">{error}</p>}
    </>
  )
}
