import { Avatar } from '../ui/Avatar'
import { InterestChips } from '../ui/InterestChips'
import type { PublicProfile } from '../people/publicProfile'

// "Chi c'è": organizzatore per primo, poi i confermati, ognuno con avatar, nome, età, bio e interessi.
export function EventPeople({ people }: { people: PublicProfile[] }) {
  if (people.length === 0) return null
  return (
    <section className="detail-section" aria-label="Persone">
      <h3>Chi c'è <span className="count-pill">{people.length}</span></h3>
      <ul className="people">
        {people.map((p) => (
          <li key={p.uid}>
            <Avatar name={p.nome} size="md" />
            <div className="person">
              <p className="person-head">
                <strong>{p.nome}</strong>
                <span className="person-age">{p.eta} anni</span>
                {p.ruolo === 'organizzatore' && <span className="badge">Organizza</span>}
              </p>
              {p.bio && <p className="person-bio">{p.bio}</p>}
              <InterestChips interests={p.interessi} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
