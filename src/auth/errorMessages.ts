// Traduce gli errori di autenticazione in frasi comprensibili.
// Firebase mette un "code" sull'errore (es. "auth/email-already-in-use"):
// anche la versione in memoria usa gli stessi codici, così il testo è uguale.

const MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'Esiste già un account con questa email.',
  'auth/weak-password': 'La password è troppo debole.',
  'auth/invalid-email': 'Indirizzo email non valido.',
  'auth/invalid-credential': 'Email o password errate.',
  'auth/user-not-found': 'Email o password errate.',
  'auth/wrong-password': 'Email o password errate.',
  'auth/too-many-requests': 'Troppi tentativi. Riprova tra qualche minuto.',
  'auth/network-request-failed': 'Problema di connessione. Riprova.',
}

const FALLBACK = 'Qualcosa è andato storto. Riprova.'

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code
  return typeof code === 'string' ? (MESSAGES[code] ?? FALLBACK) : FALLBACK
}
