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

// Scheda "Profilo": in alto fascia colorata con avatar, nome ed età (mai la data di nascita);
// sotto bio e interessi; in fondo Modifica e una sezione Account con Debug ed Esci.
export function ProfileView({ profile, onEdit, onDebug }: Props) {
  const { auth } = useServices()
  return (
    <div className="profile-page">
      <section className="card profile-hero">
        <div className="profile-band" />
        <div className="profile-avatar"><Avatar name={profile.nome} size="lg" /></div>
        <h2>{profile.nome}</h2>
        <p className="profile-age">{calculateAge(profile.dataNascita)} anni</p>
      </section>
      <section className="card profile-about">
        <h3>Chi sono</h3>
        {profile.bio ? <p>{profile.bio}</p> : <p className="muted">Nessuna bio: raccontati in due righe.</p>}
        {profile.interessi.length > 0 && <h3>Cosa mi piace</h3>}
        <InterestChips interests={profile.interessi} />
        <button type="button" className="wide" onClick={onEdit}>Modifica profilo</button>
      </section>
      <section className="card profile-account" aria-label="Account">
        <button type="button" className="secondary wide" onClick={() => void auth.logout()}>Esci</button>
        <button type="button" className="link" onClick={onDebug}>Debug</button>
      </section>
    </div>
  )
}
