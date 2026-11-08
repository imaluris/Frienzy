import type { AuthService } from './authService'
import { validateEmail } from './validation'

/** Attesa minima tra due invii della stessa email (evita raffiche di richieste e blocchi del server). */
export const RESEND_COOLDOWN_MS = 60_000

/** Frase unica per ogni indirizzo valido: non rivela se esiste un account con quell'email. */
export const RESET_SENT_MESSAGE = "Se esiste un account con questa email, ti abbiamo inviato un link per scegliere una nuova password. Controlla anche lo spam."

/** Recupero password: controlla l'indirizzo, chiede l'invio e restituisce il testo da mostrare. Gli errori arrivano come eccezioni. */
export async function requestPasswordReset(auth: AuthService, email: string): Promise<string> {
  const problem = validateEmail(email)
  if (problem) throw Object.assign(new Error(problem), { code: 'auth/invalid-email' })
  await auth.sendPasswordReset(email)
  return RESET_SENT_MESSAGE
}

/** Quanti secondi mancano prima di poter inviare di nuovo (0 = subito). Funzione pura: l'ora arriva da fuori. */
export function resendWaitSeconds(lastSentAt: number | null, now: number, cooldownMs: number = RESEND_COOLDOWN_MS): number {
  if (lastSentAt === null) return 0
  return Math.max(0, Math.ceil((lastSentAt + cooldownMs - now) / 1000))
}
