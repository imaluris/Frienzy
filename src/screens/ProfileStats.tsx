import type { ProfileStats as Stats } from '../profile/stats'

// Due numeri in evidenza: eventi organizzati e eventi a cui partecipo (confermato).
export function ProfileStats({ stats, loading }: { stats: Stats; loading: boolean }) {
  const item = (value: number, label: string) => (
    <div className="stat">
      <span className="stat-value">{loading ? '–' : value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
  return (
    <section className="card profile-stats" aria-label="Statistiche">
      {item(stats.organized, 'Organizzati')}
      <span className="stat-divider" aria-hidden="true" />
      {item(stats.joined, 'Partecipati')}
    </section>
  )
}
