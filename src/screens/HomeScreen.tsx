import { appConfig } from '../config/app'
import { useServices } from '../app/ServicesContext'
import type { UserProfile } from '../domain/user'
import { calculateAge } from '../profile/age'

// Schermata per chi è collegato e ha il profilo. Mostra l'età, mai la data di nascita.
export function HomeScreen({ profile, onEdit, onCreateEvent, onBrowse, onMap, onMine, onDebug }: { profile: UserProfile; onEdit: () => void; onCreateEvent: () => void; onBrowse: () => void; onMap: () => void; onMine: () => void; onDebug: () => void }) {
  const { auth } = useServices()
  return (
    <main className="card">
      <h1>{appConfig.name}</h1>
      <p>Ciao {profile.nome}, {calculateAge(profile.dataNascita)} anni. L'app è in costruzione.</p>
      <button type="button" onClick={onBrowse}>Eventi</button>{' '}
      <button type="button" onClick={onMap}>Mappa</button>{' '}
      <button type="button" onClick={onMine}>I miei eventi</button>{' '}
      <button type="button" onClick={onCreateEvent}>Crea evento</button>{' '}
      <button type="button" onClick={onEdit}>Modifica profilo</button>{' '}
      <button type="button" className="link" onClick={onDebug}>Debug</button>{' '}
      <button type="button" className="link" onClick={() => void auth.logout()}>Esci</button>
    </main>
  )
}
