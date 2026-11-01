// Indicatore di avanzamento a barrette: quelle già fatte (fino a `current`) sono piene. Serve a tutti i percorsi a passi.
export function ProgressBars({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="step-progress" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current} aria-label={label}>
      <div className="step-bars" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <span key={i} className={i < current ? 'step-bar done' : 'step-bar'} />)}
      </div>
      <p className="step-label">{label}</p>
    </div>
  )
}
