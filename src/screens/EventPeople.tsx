import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
import { Avatar } from '../ui/Avatar'
import type { PublicProfile } from '../people/publicProfile'

// Elenco di organizzatore e partecipanti confermati: nome, età, bio, interessi.
export function EventPeople({ people }: { people: PublicProfile[] }) {
  if (people.length === 0) return null
  return (
    <section aria-label="Persone">
      <h3>Chi c'è</h3>
      <ul className="people">
        {people.map((p) => (
          <li key={p.uid}>
            <Avatar name={p.nome} size="sm" />
            <div className="person">
              <strong>{p.nome}</strong>, {p.eta} anni{p.ruolo === 'organizzatore' ? <span className="badge">organizza</span> : ''}
              {p.bio && <p>{p.bio}</p>}
              {p.interessi.length > 0 && <p aria-label="Interessi">{p.interessi.map((i) => EVENT_TYPE_EMOJI[i]).join(' ')}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
