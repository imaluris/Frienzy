import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { useProfile } from '../profile/useProfile'
import { DebugScreen } from './DebugScreen'
import { CreateEventScreen } from './CreateEventScreen'
import { EventDetailScreen } from './EventDetailScreen'
import { EventListScreen } from './EventListScreen'
import { HomeScreen } from './HomeScreen'
import { MapScreen } from './MapScreen'
import { MyEventsScreen } from './MyEventsScreen'
import { ProfileScreen } from './ProfileScreen'

// Chi è collegato ma non ha ancora il profilo deve prima completarlo.
export function ProfileGate({ uid }: { uid: string }) {
  const { users } = useServices()
  const { loading, profile, setProfile } = useProfile(users, uid)
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [browsing, setBrowsing] = useState(false)
  const [mapping, setMapping] = useState(false)
  const [mine, setMine] = useState(false)
  const [debug, setDebug] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

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
  if (debug) return <DebugScreen onBack={() => setDebug(false)} />
  if (creating) {
    return <CreateEventScreen uid={uid} onDone={() => setCreating(false)} onCancel={() => setCreating(false)} />
  }
  if ((browsing || mapping || mine) && openId) return <EventDetailScreen eventId={openId} onBack={() => setOpenId(null)} />
  if (mine) return <MyEventsScreen uid={uid} onOpen={setOpenId} onBack={() => setMine(false)} />
  if (mapping) return <MapScreen onOpen={setOpenId} onBack={() => setMapping(false)} />
  if (browsing) return <EventListScreen onOpen={setOpenId} onBack={() => setBrowsing(false)} />
  return (
    <HomeScreen
      profile={profile}
      onEdit={() => setEditing(true)}
      onCreateEvent={() => setCreating(true)}
      onBrowse={() => setBrowsing(true)}
      onMap={() => setMapping(true)}
      onMine={() => setMine(true)}
      onDebug={() => setDebug(true)}
    />
  )
}
