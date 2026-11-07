import { useState } from 'react'
import { useBlocks } from '../safety/BlocksContext'
import { useServices } from '../app/ServicesContext'
import type { UserProfile } from '../domain/user'
import { useMine } from '../mine/useMine'
import { calculateAge } from '../profile/age'
import { profileStats } from '../profile/stats'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icon'
import { InterestChips } from '../ui/InterestChips'
import { BlockedSheet } from './BlockedSheet'
import { DeleteAccountSheet } from './DeleteAccountSheet'
import { ProfileStats } from './ProfileStats'

interface Props {
  profile: UserProfile
  onEdit: () => void
  onDebug: () => void
}

// Scheda "Profilo": testata a colori con avatar grande, nome ed età (mai la data di nascita),
// statistiche, "Chi sono" con interessi, e in fondo la sezione Account.
export function ProfileView({ profile, onEdit, onDebug }: Props) {
  const services = useServices()
  const { loading, mine } = useMine(services, profile.uid)
  const { blockedByMe } = useBlocks()
  const [showBlocked, setShowBlocked] = useState(false)
  const [deleting, setDeleting] = useState(false)
  return (
    <div className="profile-page">
      <section className="card profile-hero">
        <div className="profile-band" aria-hidden="true">
          <span className="band-dot band-dot-a" />
          <span className="band-dot band-dot-b" />
          <span className="band-dot band-dot-c" />
        </div>
        <div className="profile-avatar"><Avatar name={profile.nome} size="lg" /></div>
        <h2>{profile.nome}</h2>
        <p className="profile-age">{calculateAge(profile.dataNascita)} anni</p>
        <button type="button" className="secondary profile-edit" onClick={onEdit}><Icon name="edit" size={20} /> Modifica profilo</button>
      </section>
      <ProfileStats stats={profileStats(mine)} loading={loading} />
      <section className="card profile-about">
        <h3>Chi sono</h3>
        {profile.bio ? <p>{profile.bio}</p> : <p className="muted">Nessuna bio: raccontati in due righe.</p>}
        {profile.interessi.length > 0 && <h3>Cosa mi piace</h3>}
        <InterestChips interests={profile.interessi} />
      </section>
      <section className="card profile-account" aria-label="Account">
        {blockedByMe.length > 0 && (
          <button type="button" className="secondary wide" onClick={() => setShowBlocked(true)}><Icon name="user-x" size={20} /> Utenti bloccati ({blockedByMe.length})</button>
        )}
        <button type="button" className="secondary wide" onClick={() => void services.auth.logout()}><Icon name="logout" size={20} /> Esci</button>
        <button type="button" className="link danger-link" onClick={() => setDeleting(true)}>Elimina account</button>
        <button type="button" className="link" onClick={onDebug}>Debug</button>
      </section>
      {deleting && <DeleteAccountSheet onClose={() => setDeleting(false)} />}
      {showBlocked && <BlockedSheet onClose={() => setShowBlocked(false)} />}
    </div>
  )
}
