import { useServices } from '../app/ServicesContext'
import type { UserProfile } from '../domain/user'
import { calculateAge } from '../profile/age'
import { Avatar } from '../ui/Avatar'
import { InterestChips } from '../ui/InterestChips'

interface Props {
  profile: UserProfile
  onEdit: () => void
  onDebug: () => void
}

// Scheda "Profilo": avatar, nome ed età (mai la data di nascita), bio, interessi; poi Modifica, Debug, Esci.
export function ProfileView({ profile, onEdit, onDebug }: Props) {
  const { auth } = useServices()
  return (
    <section className="card profile-card">
      <Avatar name={profile.nome} size="lg" />
      <h2>{profile.nome}, {calculateAge(profile.dataNascita)} anni</h2>
      {profile.bio ? <p>{profile.bio}</p> : <p className="muted">Nessuna bio: raccontati in due righe.</p>}
      <InterestChips interests={profile.interessi} />
      <button type="button" onClick={onEdit}>Modifica profilo</button>
      <div className="stack-actions">
        <button type="button" className="link" onClick={onDebug}>Debug</button>
        <button type="button" className="link" onClick={() => void auth.logout()}>Esci</button>
      </div>
    </section>
  )
}
