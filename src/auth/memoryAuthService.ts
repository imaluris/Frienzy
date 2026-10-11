import type { AuthService } from './authService'
import { validateEmail, validatePassword } from './validation'

// Errore con un "code", come quelli di Firebase.
function authError(code: string): Error & { code: string } {
  return Object.assign(new Error(code), { code })
}

interface Account {
  uid: string
  password: string
}

// Autenticazione finta per i test: gli account vivono solo in memoria.
export class MemoryAuthService implements AuthService {
  private accounts = new Map<string, Account>()
  private uid: string | null = null
  private listeners = new Set<(uid: string | null) => void>()
  private counter = 0

  async register(email: string, password: string): Promise<string> {
    const key = email.trim().toLowerCase()
    if (validateEmail(key)) throw authError('auth/invalid-email')
    if (validatePassword(password)) throw authError('auth/weak-password')
    if (this.accounts.has(key)) throw authError('auth/email-already-in-use')
    const uid = `utente-${++this.counter}`
    this.accounts.set(key, { uid, password })
    this.setUid(uid) // come Firebase: dopo la registrazione si è già dentro
    return uid
  }

  async login(email: string, password: string): Promise<string> {
    const account = this.accounts.get(email.trim().toLowerCase())
    if (!account || account.password !== password) throw authError('auth/invalid-credential')
    this.setUid(account.uid)
    return account.uid
  }

  async logout(): Promise<void> {
    this.setUid(null)
  }

  currentUid(): string | null {
    return this.uid
  }

  onChange(listener: (uid: string | null) => void): () => void {
    this.listeners.add(listener)
    listener(this.uid) // come Firebase: il primo avviso arriva subito
    return () => this.listeners.delete(listener)
  }

  private setUid(uid: string | null): void {
    this.uid = uid
    this.listeners.forEach((l) => l(uid))
  }
}
