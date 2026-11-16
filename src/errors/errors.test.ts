import { describeError, errorCode } from './describeError'
import { clearErrorLog, ERROR_LOG_MAX, installGlobalErrorLog, logError, readErrorLog } from './errorLog'
import { errorMessage } from './reportError'

const firebaseError = (code: string, message = 'Firebase: Error (secret-detail).') => Object.assign(new Error(message), { code })

function memoryStore() {
  const data = new Map<string, string>()
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v), removeItem: (k: string) => void data.delete(k) }
}

describe('describeError', () => {
  it('traduce i codici Firebase in italiano, con o senza prefisso', () => {
    expect(describeError(firebaseError('unavailable')).kind).toBe('rete')
    expect(describeError(firebaseError('firestore/unavailable')).retryable).toBe(true)
    expect(describeError(firebaseError('auth/network-request-failed')).kind).toBe('rete')
    expect(describeError(firebaseError('permission-denied')).kind).toBe('permesso')
    expect(describeError(firebaseError('resource-exhausted')).kind).toBe('limite')
    expect(describeError(firebaseError('unauthenticated')).retryable).toBe(false)
  })
  it('non fa mai arrivare all\'utente i testi tecnici di Firebase', () => {
    expect(describeError(firebaseError('boh', 'Firebase: Error (secret-detail).')).message).not.toMatch(/firebase|secret/i)
    expect(describeError(new Error('Firebase: Missing or insufficient permissions.')).message).not.toMatch(/firebase/i)
  })
  it('lascia passare i nostri messaggi in italiano', () => {
    expect(describeError(new Error('Il messaggio è troppo lungo.')).message).toBe('Il messaggio è troppo lungo.')
  })
  it('regge valori che non sono errori', () => {
    expect(describeError(undefined).message).toMatch(/Riprova/)
    expect(describeError('boom').kind).toBe('generico')
    expect(describeError(null).retryable).toBe(true)
  })
  it('errorCode toglie il prefisso', () => {
    expect(errorCode(firebaseError('firestore/not-found'))).toBe('not-found')
    expect(errorCode(new Error('x'))).toBe('')
  })
})

describe('registro errori locale', () => {
  it('salva dove, tipo e codice, mai il testo dell\'errore', () => {
    const store = memoryStore()
    logError(firebaseError('unavailable', 'mario@example.com non raggiungibile'), 'chat', store, new Date('2026-11-16T10:00:00Z'))
    const [entry] = readErrorLog(store)
    expect(entry).toEqual({ at: '2026-11-16T10:00:00.000Z', where: 'chat', kind: 'rete', code: 'unavailable' })
    expect(JSON.stringify(readErrorLog(store))).not.toContain('mario')
  })
  it('tiene solo gli ultimi errori', () => {
    const store = memoryStore()
    for (let i = 0; i < ERROR_LOG_MAX + 5; i++) logError(new Error('x'), `n${i}`, store)
    const log = readErrorLog(store)
    expect(log).toHaveLength(ERROR_LOG_MAX)
    expect(log[log.length - 1].where).toBe(`n${ERROR_LOG_MAX + 4}`)
  })
  it('si svuota e regge un registro rovinato o un telefono senza storage', () => {
    const store = memoryStore()
    logError(new Error('x'), 'a', store)
    clearErrorLog(store)
    expect(readErrorLog(store)).toEqual([])
    store.setItem('frienzy.errori', '{non json')
    expect(readErrorLog(store)).toEqual([])
    expect(() => logError(new Error('x'), 'a', null)).not.toThrow()
  })
  it('errorMessage restituisce il testo per l\'utente', () => {
    expect(errorMessage(firebaseError('unavailable'), 'prova')).toMatch(/connessione/)
  })
  it('registra anche gli errori non gestiti', () => {
    const handlers: Record<string, (e: unknown) => void> = {}
    installGlobalErrorLog({ addEventListener: (type: string, fn: (e: unknown) => void) => { handlers[type] = fn } } as unknown as Window)
    expect(Object.keys(handlers).sort()).toEqual(['error', 'unhandledrejection'])
    expect(() => handlers.unhandledrejection({ reason: new Error('x') })).not.toThrow()
  })
})
