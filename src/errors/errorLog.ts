import { describeError, type ErrorKind } from './describeError'

// Registro locale degli errori: resta sul telefono (mai inviato), serve a capire cosa è andato storto.
// Non salva il testo dell'errore (potrebbe contenere email o nomi): solo dove, che tipo e il codice tecnico.
export interface ErrorLogEntry {
  at: string
  where: string
  kind: ErrorKind
  code: string
}

export const ERROR_LOG_KEY = 'frienzy.errori'
export const ERROR_LOG_MAX = 30

type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function defaultStore(): Store | null {
  try { return typeof localStorage === 'undefined' ? null : localStorage } catch { return null }
}

export function readErrorLog(store: Store | null = defaultStore()): ErrorLogEntry[] {
  if (!store) return []
  try {
    const parsed: unknown = JSON.parse(store.getItem(ERROR_LOG_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as ErrorLogEntry[]) : []
  } catch { return [] }
}

/** Aggiunge un errore al registro (gli ultimi 30) e lo restituisce già descritto per l'utente. */
export function logError(error: unknown, where: string, store: Store | null = defaultStore(), now: Date = new Date()) {
  const described = describeError(error)
  if (store) {
    const entry: ErrorLogEntry = { at: now.toISOString(), where: where.slice(0, 60), kind: described.kind, code: described.code.slice(0, 60) }
    try { store.setItem(ERROR_LOG_KEY, JSON.stringify([...readErrorLog(store), entry].slice(-ERROR_LOG_MAX))) } catch { /* telefono pieno o in modalità privata: pazienza */ }
  }
  return described
}

export function clearErrorLog(store: Store | null = defaultStore()): void {
  try { store?.removeItem(ERROR_LOG_KEY) } catch { /* niente da fare */ }
}

/** Registra gli errori che nessuno ha gestito (promesse rifiutate, errori di script). */
export function installGlobalErrorLog(target: Pick<Window, 'addEventListener'> = window): void {
  target.addEventListener('unhandledrejection', (e) => { logError((e as PromiseRejectionEvent).reason, 'non-gestito') })
  target.addEventListener('error', (e) => { logError((e as ErrorEvent).error, 'script') })
}
