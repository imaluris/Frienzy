// Controlli sui dati di accesso, prima di chiamare il servizio di autenticazione.
// Restituiscono il messaggio d'errore (in italiano) oppure null se va tutto bene.

export const MIN_PASSWORD_LENGTH = 6

// Controllo volutamente semplice: qualcosa@qualcosa.qualcosa, senza spazi.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): string | null {
  return EMAIL_PATTERN.test(email.trim()) ? null : 'Inserisci un indirizzo email valido.'
}

export function validatePassword(password: string): string | null {
  return password.length >= MIN_PASSWORD_LENGTH
    ? null
    : `La password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri.`
}

export function validateLogin(email: string, password: string): string | null {
  return validateEmail(email) ?? (password ? null : 'Inserisci la password.')
}

export function validateRegistration(
  email: string,
  password: string,
  confirm: string,
): string | null {
  return (
    validateEmail(email) ??
    validatePassword(password) ??
    (password === confirm ? null : 'Le due password non coincidono.')
  )
}
