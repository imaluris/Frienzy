import { useState, type ReactNode } from 'react'
import type { UserProfile } from '../domain/user'
import { CreateEventScreen } from '../screens/CreateEventScreen'
import { DebugScreen } from '../screens/DebugScreen'
import { EventDetailScreen } from '../screens/EventDetailScreen'
import { EventListScreen } from '../screens/EventListScreen'
import { MapScreen } from '../screens/MapScreen'
import { MyEventsScreen } from '../screens/MyEventsScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { ProfileView } from '../screens/ProfileView'
import { AppHeader } from './AppHeader'
import { canGoBack, goBack, openDebug, openEdit, openEvent, selectTab, START, titleOf, type Nav } from './navState'
import { TabBar } from './TabBar'

interface Props {
  uid: string
  profile: UserProfile
  onProfileSaved: (profile: UserProfile) => void
}

// Guscio dell'app per chi è collegato: intestazione, contenuto della scheda attiva e barra in basso.
export function AppShell({ uid, profile, onProfileSaved }: Props) {
  const [nav, setNav] = useState<Nav>(START)
  const open = (id: string) => setNav((n) => openEvent(n, id))

  function content(): ReactNode {
    switch (nav.overlay.kind) {
      case 'event': return <EventDetailScreen eventId={nav.overlay.id} />
      case 'debug': return <DebugScreen />
      case 'edit': return <ProfileScreen uid={uid} current={profile} onSaved={(saved) => { onProfileSaved(saved); setNav((n) => goBack(n)) }} />
    }
    switch (nav.tab) {
      case 'eventi': return <EventListScreen onOpen={open} />
      case 'mappa': return <MapScreen onOpen={open} />
      case 'crea': return <CreateEventScreen uid={uid} onDone={() => setNav(selectTab('miei'))} />
      case 'miei': return <MyEventsScreen uid={uid} onOpen={open} />
      case 'profilo': return <ProfileView profile={profile} onEdit={() => setNav((n) => openEdit(n))} onDebug={() => setNav((n) => openDebug(n))} />
    }
  }

  return (
    <div className="shell">
      <AppHeader title={titleOf(nav)} onBack={canGoBack(nav) ? () => setNav((n) => goBack(n)) : null} />
      <main className="shell-content">{content()}</main>
      <TabBar active={nav.tab} onSelect={(tab) => setNav(selectTab(tab))} />
    </div>
  )
}
