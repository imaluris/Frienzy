import { ProgressBars } from '../ui/ProgressBars'
import { STEPS, stepLabel, stepNumber, type Step } from './steps'

// Avanzamento della registrazione: "Passo 2 di 4".
export function StepProgress({ step }: { step: Step }) {
  return <ProgressBars current={stepNumber(step)} total={STEPS.length} label={stepLabel(step)} />
}
