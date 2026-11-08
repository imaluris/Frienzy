import type { AuthService } from './authService'
import { validateEmail, validatePassword } from './validation'

// Errore con un "code", come quelli di Firebase.
function authError(code: string): Error & { code: string } {
  return Object.assign(new Error(code), { code })
}

interface Account {
  uid: string
  password: string
  verified: boolean
  verificationsSent: number
}

/** Email "spedite" dalla finta: i test (e la demo) possono controllare cosa sarebbe partito. */
export interface SentEmail {
  kind: 'reset' | 'verify'
  to: string
}

// Come Firebase, dopo troppi invii di verifica si viene fermati.
const MAX_VERIFICATIONS = 5

// Autenticazione finta per i test: gli account vivono solo in memoria.
export class MemoryAuthService implements AuthService {
  private accounts = new Map<string, Account>()
  private uid: string | null = null
  private listeners = new Set<(uid: string | null) => void>()
  private counter = 0
  readonly sentEmails: SentEmail[] = []

  // `newUid` permette alla modalità demo di scegliere l'uid dell'utente d'esempio.
  constructor(private newUid: (n: number) => string = (n) => `utente-${n}`) {}

  async register(email: string, password: string): Promise<string> {
    const key = email.trim().toLowerCase()
    if (validateEmail(key)) throw authError('auth/invalid-email')
    if (validatePassword(password)) throw authError('auth/weak-password')
    if (this.accounts.has(key)) throw authError('auth/email-already-in-use')
    const uid = this.newUid(++this.counter)
    this.accounts.set(key, { uid, password, verified: false, verificationsSent: 0 })
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

  async reauthenticate(password: string): Promise<void> {
    const account = this.current()
    if (!account || account.password !== password) throw authError('auth/invalid-credential')
  }

  async deleteAccount(): Promise<void> {
    const entry = [...this.accounts.entries()].find(([, a]) => a.uid === this.uid)
    if (!entry) throw authError('auth/requires-recent-login')
    this.accounts.delete(entry[0])
    this.setUid(null)
  }

  async sendPasswordReset(email: string): Promise<void> {
    const key = email.trim().toLowerCase()
    if (validateEmail(key)) throw authError('auth/invalid-email')
    // Indirizzo senza account: nessun errore e nessuna email, così non si scopre chi è iscritto.
    if (this.accounts.has(key)) this.sentEmails.push({ kind: 'reset', to: key })
  }

  async sendVerificationEmail(): Promise<void> {
    const entry = [...this.accounts.entries()].find(([, a]) => a.uid === this.uid)
    if (!entry) throw authError('auth/user-not-found')
    const [email, account] = entry
    if (account.verificationsSent >= MAX_VERIFICATIONS) throw authError('auth/too-many-requests')
    account.verificationsSent += 1
    this.sentEmails.push({ kind: 'verify', to: email })
  }

  async isEmailVerified(): Promise<boolean> {
    return this.current()?.verified ?? false
  }

  /** Solo per test e demo: come se l'utente avesse cliccato il link ricevuto per email. */
  confirmEmail(email: string): void {
    const account = this.accounts.get(email.trim().toLowerCase())
    if (account) account.verified = true
  }

  private current(): Account | undefined {
    return [...this.accounts.values()].find((a) => a.uid === this.uid)
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
