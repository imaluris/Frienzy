import { useServices } from '../app/ServicesContext'
import { AppShell } from '../nav/AppShell'
import { useProfile } from '../profile/useProfile'
import { OnboardingFlow } from '../onboarding/OnboardingFlow'

// Chi è collegato ma non ha ancora il profilo prosegue la registrazione (passi 2-4); poi entra nell'app a schede.
export function ProfileGate({ uid }: { uid: string }) {
  const { users } = useServices()
  const { loading, profile, setProfile } = useProfile(users, uid)

  if (loading) return <p className="card loading">Caricamento…</p>
  if (!profile) return <OnboardingFlow uid={uid} onSaved={setProfile} />
  return <AppShell uid={uid} profile={profile} onProfileSaved={setProfile} />
}
