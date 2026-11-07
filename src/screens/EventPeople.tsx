import { useState } from 'react'
import { visiblePeople } from '../events/visiblePeople'
import { personOptions } from '../safety/options'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icon'
import { InterestChips } from '../ui/InterestChips'
import { SafetyMenu } from './SafetyMenu'
import type { PublicProfile } from '../people/publicProfile'

// "Chi c'è": organizzatore per primo, poi i confermati, ognuno con avatar, nome, età, bio e interessi.
export function EventPeople({ people, meUid = null }: { people: PublicProfile[]; meUid?: string | null }) {
  const [expanded, setExpanded] = useState(false)
  const [acting, setActing] = useState<PublicProfile | null>(null)
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
            {meUid && p.uid !== meUid && (
              <button type="button" className="person-more" aria-label={`Altre azioni per ${p.nome}`} onClick={() => setActing(p)}><Icon name="more" size={24} /></button>
            )}
          </li>
        ))}
      </ul>
      {acting && <SafetyMenu title={acting.nome} options={personOptions(acting)} onClose={() => setActing(null)} />}
      {hidden > 0 && <button type="button" className="secondary wide" onClick={() => setExpanded(true)}>Mostra tutti ({people.length})</button>}
    </section>
  )
}
