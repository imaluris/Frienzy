import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { useProfile } from '../profile/useProfile'
import { CreateEventScreen } from './CreateEventScreen'
import { HomeScreen } from './HomeScreen'
import { ProfileScreen } from './ProfileScreen'

// Chi è collegato ma non ha ancora il profilo deve prima completarlo.
export function ProfileGate({ uid }: { uid: string }) {
  const { users } = useServices()
  const { loading, profile, setProfile } = useProfile(users, uid)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)

  if (loading) return <p className="card">Caricamento…</p>
  if (!profile || editing) {
    return (
      <ProfileScreen
        uid={uid}
        current={profile}
        onSaved={(saved) => {
          setProfile(saved)
          setEditing(false)
        }}
      />
    )
  }
  if (creating) {
    return <CreateEventScreen uid={uid} onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />
  }
  return <HomeScreen profile={profile} onEdit={() => setEditing(true)} onCreateEvent={() => setCreating(true)} />
}
