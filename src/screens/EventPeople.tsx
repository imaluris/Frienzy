import { useState } from 'react'
import { visiblePeople } from '../events/visiblePeople'
import { Avatar } from '../ui/Avatar'
import { InterestChips } from '../ui/InterestChips'
import type { PublicProfile } from '../people/publicProfile'

// "Chi c'è": organizzatore per primo, poi i confermati, ognuno con avatar, nome, età, bio e interessi.
export function EventPeople({ people }: { people: PublicProfile[] }) {
  const [expanded, setExpanded] = useState(false)
  if (people.length === 0) return null
  const { shown, hidden } = visiblePeople(people, expanded)
  return (
    <section className="detail-section" aria-label="Persone">
      <h3>Chi c'è <span className="count-pill">{people.length}</span></h3>
      <ul className="people">
        {shown.map((p) => (
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
      {hidden > 0 && <button type="button" className="secondary wide" onClick={() => setExpanded(true)}>Mostra tutti ({people.length})</button>}
    </section>
  )
}
