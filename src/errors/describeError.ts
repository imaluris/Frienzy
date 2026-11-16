// Gestore centrale degli errori: trasforma QUALSIASI errore in un messaggio italiano chiaro,
// senza mai far arrivare all'utente testi tecnici in inglese di Firebase.
export type ErrorKind = 'rete' | 'permesso' | 'limite' | 'accesso' | 'nonTrovato' | 'servizio' | 'generico'

export interface DescribedError {
  kind: ErrorKind
  message: string
  /** true se ha senso mostrare "Riprova" (problema temporaneo). */
  retryable: boolean
  /** Codice tecnico (es. "unavailable"), solo per il registro locale. */
  code: string
}

const BY_CODE: Record<string, Omit<DescribedError, 'code'>> = {
  unavailable: { kind: 'rete', retryable: true, message: 'Non riesco a collegarmi. Controlla la connessione e riprova.' },
  'network-request-failed': { kind: 'rete', retryable: true, message: 'Non riesco a collegarmi. Controlla la connessione e riprova.' },
  'deadline-exceeded': { kind: 'rete', retryable: true, message: 'Ci sta mettendo troppo. Riprova tra un attimo.' },
  aborted: { kind: 'servizio', retryable: true, message: 'Qualcun altro ha appena fatto una modifica. Riprova.' },
  'resource-exhausted': { kind: 'limite', retryable: true, message: 'Troppe richieste in poco tempo. Aspetta qualche secondo e riprova.' },
  'too-many-requests': { kind: 'limite', retryable: true, message: 'Troppi tentativi. Aspetta un po\' e riprova.' },
  'permission-denied': { kind: 'permesso', retryable: false, message: 'Non puoi farlo, oppure stai andando troppo veloce. Aspetta qualche secondo e riprova.' },
  unauthenticated: { kind: 'accesso', retryable: false, message: 'La tua sessione è scaduta. Accedi di nuovo.' },
  'not-found': { kind: 'nonTrovato', retryable: false, message: 'Non lo trovo: forse è stato eliminato.' },
  'failed-precondition': { kind: 'servizio', retryable: false, message: 'Non è possibile in questo momento.' },
  internal: { kind: 'servizio', retryable: true, message: 'Problema dei nostri server. Riprova tra poco.' },
}

const FALLBACK: Omit<DescribedError, 'code'> = { kind: 'generico', retryable: true, message: 'Qualcosa è andato storto. Riprova.' }

/** Estrae il codice da un errore Firebase ("firestore/unavailable", "auth/network-request-failed", "unavailable"). */
export function errorCode(error: unknown): string {
  const raw = typeof error === 'object' && error !== null ? (error as { code?: unknown }).code : undefined
  if (typeof raw !== 'string') return ''
  return raw.includes('/') ? raw.split('/').slice(1).join('/') : raw
}

// I nostri errori (es. "Il messaggio è troppo lungo") hanno un testo italiano scritto apposta e passano così come sono.
// Quelli di Firebase hanno un codice o iniziano con "Firebase:": mai mostrarli grezzi.
function isOurOwn(error: unknown): error is Error {
  return error instanceof Error && !errorCode(error) && !/firebase|firestore|\[code=/i.test(error.message) && error.message.trim().length > 0
}

export function describeError(error: unknown): DescribedError {
  const code = errorCode(error)
  const known = BY_CODE[code]
  if (known) return { ...known, code }
  if (isOurOwn(error)) return { kind: 'generico', retryable: false, message: error.message, code }
  return { ...FALLBACK, code }
}
