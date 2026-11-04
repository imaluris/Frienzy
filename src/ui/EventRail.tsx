import type { ReactNode } from 'react'

// Sezione con titolo e una fila di schede che scorre di lato e si ferma sulla scheda (scroll-snap).
export function EventRail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rail" aria-label={title}>
      <h2>{title}</h2>
      <ul className="rail-track">{children}</ul>
    </section>
  )
}
