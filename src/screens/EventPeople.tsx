import { EVENT_TYPE_EMOJI } from '../domain/eventTypes'
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
            {p.fotoUrl && <img src={p.fotoUrl} alt="" width={40} height={40} />}
            <strong>{p.nome}</strong>, {p.eta} anni{p.ruolo === 'organizzatore' ? ' · organizza' : ''}
            {p.bio && <p>{p.bio}</p>}
            {p.interessi.length > 0 && <p>{p.interessi.map((i) => EVENT_TYPE_EMOJI[i]).join(' ')}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
