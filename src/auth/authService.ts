// Contratto per l'autenticazione: l'app non sa se dietro c'è Firebase o una finta in memoria.
export interface AuthService {
  /** Crea l'account e restituisce l'uid. Errore se l'email è già usata o la password è debole. */
  register(email: string, password: string): Promise<string>
  /** Entra con email e password; restituisce l'uid. */
  login(email: string, password: string): Promise<string>
  logout(): Promise<void>
  /** Uid dell'utente collegato, oppure null. */
  currentUid(): string | null
  /** Avvisa quando l'utente entra o esce; restituisce la funzione per smettere di ascoltare. */
  onChange(listener: (uid: string | null) => void): () => void
}
