import { validateBio, validateBirthDate, validateName, type ProfileInput } from '../profile/validation'

// I passi della registrazione, nell'ordine. Il primo (account) vive nella schermata di registrazione,
// gli altri tre si fanno dopo, quando l'account esiste già.
export const STEPS = ['account', 'profilo', 'interessi', 'posizione'] as const
export type Step = (typeof STEPS)[number]

/** Numero del passo da mostrare (1-4). */
export function stepNumber(step: Step): number {
  return STEPS.indexOf(step) + 1
}

/** Testo dell'indicatore: "Passo 2 di 4". */
export function stepLabel(step: Step): string {
  return `Passo ${stepNumber(step)} di ${STEPS.length}`
}

/** Il passo dopo `step`, oppure null se è l'ultimo. */
export function nextStep(step: Step): Step | null {
  return STEPS[STEPS.indexOf(step) + 1] ?? null
}

/** Il passo prima di `step`, oppure null se è il primo. */
export function previousStep(step: Step): Step | null {
  return STEPS[STEPS.indexOf(step) - 1] ?? null
}

/** Controlla solo i campi del passo "profilo": messaggio d'errore oppure null. */
export function validateProfileStep(input: ProfileInput, today: Date = new Date()): string | null {
  return validateName(input.nome) ?? validateBirthDate(input.dataNascita, today) ?? validateBio(input.bio)
}

/** Gli interessi sono facoltativi: senza scelte il pulsante diventa "Salta per ora". */
export function interestsActionLabel(count: number): string {
  return count > 0 ? 'Continua' : 'Salta per ora'
}
