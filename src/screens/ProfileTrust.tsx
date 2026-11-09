import type { Trust } from '../attendance/useTrust'
import { Icon } from '../ui/Icon'

// Riepilogo "Di te ci si può fidare": eventi fatti, affidabilità e, se ci sono, il voto come organizzatore. Nessun dato sensibile.
export function ProfileTrust({ trust }: { trust: Trust }) {
  const { reliability: r, stars, loading } = trust
  const percent = loading ? '–' : r.percent === null ? 'Presto' : `${r.percent}%`
  const hint = r.percent === null && !loading ? `Servono almeno 3 presenze segnate (ora ${r.marked})` : 'Presenze segnate da chi organizza'
  return (
    <section className="card profile-trust" aria-label="Affidabilità">
      <div className="trust-item">
        <span className="trust-value">{loading ? '–' : r.done}</span>
        <span className="trust-label">Eventi fatti</span>
      </div>
      <span className="stat-divider" aria-hidden="true" />
      <div className="trust-item">
        <span className="trust-value">{percent}</span>
        <span className="trust-label">Affidabilità</span>
      </div>
      {stars.average !== null && (
        <>
          <span className="stat-divider" aria-hidden="true" />
          <div className="trust-item">
            <span className="trust-value trust-stars">{String(stars.average).replace('.', ',')} <Icon name="star" size={20} solid /></span>
            <span className="trust-label">{stars.count} {stars.count === 1 ? 'voto' : 'voti'} ricevuti</span>
          </div>
        </>
      )}
      <p className="trust-hint">{hint}</p>
    </section>
  )
}
