import { useState, type ReactNode } from 'react'
import { ToastProvider, useToast } from '../feedback/ToastContext'
import type { UserProfile } from '../domain/user'
import { CreateEventScreen } from '../screens/CreateEventScreen'
import { DebugScreen } from '../screens/DebugScreen'
import { EventDetailScreen } from '../screens/EventDetailScreen'
import { EventListScreen } from '../screens/EventListScreen'
import { MapScreen } from '../screens/MapScreen'
import { MyEventsScreen } from '../screens/MyEventsScreen'
import { ProfileScreen } from '../screens/ProfileScreen'
import { ProfileView } from '../screens/ProfileView'
import { SavedProvider } from '../saved/SavedContext'
import { AppHeader } from './AppHeader'
import { canGoBack, goBack, openDebug, openEdit, openEvent, selectTab, showsAppHeader, showsTabBar, START, titleOf, type Nav } from './navState'
import { screenKey, transitionKind } from './screenTransition'
import { TabBar } from './TabBar'

interface Props {
  uid: string
  profile: UserProfile
  onProfileSaved: (profile: UserProfile) => void
}

// Guscio dell'app per chi è collegato: intestazione, contenuto della scheda attiva e barra in basso.
function Shell({ uid, profile, onProfileSaved }: Props) {
  const { show } = useToast()
  const [nav, setNav] = useState<Nav>(START)
  const open = (id: string) => setNav((n) => openEvent(n, id))

  function content(): ReactNode {
    switch (nav.overlay.kind) {
      case 'event': return <EventDetailScreen eventId={nav.overlay.id} onBack={() => setNav((n) => goBack(n))} />
      case 'debug': return <DebugScreen />
      case 'edit': return <ProfileScreen uid={uid} current={profile} onSaved={(saved) => { onProfileSaved(saved); setNav((n) => goBack(n)); show('Profilo aggiornato', 'success') }} />
    }
    switch (nav.tab) {
      case 'eventi': return <EventListScreen uid={uid} name={profile.nome} interessi={profile.interessi} onOpen={open} onCreate={() => setNav(selectTab('crea'))} />
      case 'mappa': return <MapScreen onOpen={open} />
      case 'crea': return <CreateEventScreen uid={uid} onDone={() => { setNav(selectTab('miei')); show('Evento pubblicato!', 'success') }} />
      case 'miei': return <MyEventsScreen uid={uid} onOpen={open} />
      case 'profilo': return <ProfileView profile={profile} onEdit={() => setNav((n) => openEdit(n))} onDebug={() => setNav((n) => openDebug(n))} />
    }
  }

  return (
    <div className="shell">
      {showsAppHeader(nav) && <AppHeader title={titleOf(nav)} onBack={canGoBack(nav) ? () => setNav((n) => goBack(n)) : null} />}
      <main className="shell-content"><div key={screenKey(nav)} className={`screen screen-${transitionKind(nav)}${nav.overlay.kind === 'event' ? ' screen-bleed' : ''}`}>{content()}</div></main>
      {showsTabBar(nav) && <TabBar active={nav.tab} onSelect={(tab) => setNav(selectTab(tab))} />}
    </div>
  )
}

// Il toast sta sopra tutta l'app collegata, così sopravvive ai cambi di schermata.
export function AppShell(props: Props) {
  return (
    <ToastProvider>
      <SavedProvider uid={props.uid}>
        <Shell {...props} />
      </SavedProvider>
    </ToastProvider>
  )
}
