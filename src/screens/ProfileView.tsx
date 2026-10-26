import { useServices } from '../app/ServicesContext'
import type { UserProfile } from '../domain/user'
import { calculateAge } from '../profile/age'

interface Props {
  profile: UserProfile
  onEdit: () => void
  onDebug: () => void
}

// Scheda "Profilo": i dati propri (età, mai la data di nascita) con Modifica, Debug ed Esci.
export function ProfileView({ profile, onEdit, onDebug }: Props) {
  const { auth } = useServices()
  return (
    <section className="card">
      <h2>{profile.nome}, {calculateAge(profile.dataNascita)} anni</h2>
      {profile.bio && <p>{profile.bio}</p>}
      {profile.interessi.length > 0 && <p>Interessi: {profile.interessi.join(', ')}</p>}
      <button type="button" onClick={onEdit}>Modifica profilo</button>
      <div className="stack-actions">
        <button type="button" className="link" onClick={onDebug}>Debug</button>
        <button type="button" className="link" onClick={() => void auth.logout()}>Esci</button>
      </div>
    </section>
  )
}
