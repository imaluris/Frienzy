import { STEPS, stepLabel, stepNumber, type Step } from './steps'

// Indicatore di avanzamento: una barretta per passo (quelle fatte sono piene) e la scritta "Passo 2 di 4".
export function StepProgress({ step }: { step: Step }) {
  const current = stepNumber(step)
  return (
    <div className="step-progress" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={current} aria-label={stepLabel(step)}>
      <div className="step-bars" aria-hidden="true">
        {STEPS.map((id, i) => <span key={id} className={i < current ? 'step-bar done' : 'step-bar'} />)}
      </div>
      <p className="step-label">{stepLabel(step)}</p>
    </div>
  )
}
