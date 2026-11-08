// Contratto per l'autenticazione: l'app non sa se dietro c'è Firebase o una finta in memoria.
export interface AuthService {
  /** Crea l'account e restituisce l'uid. Errore se l'email è già usata o la password è debole. */
  register(email: string, password: string): Promise<string>
  /** Entra con email e password; restituisce l'uid. */
  login(email: string, password: string): Promise<string>
  logout(): Promise<void>
  /** Chiede di nuovo la password dell'utente collegato (serve prima di operazioni delicate). Errore 'auth/invalid-credential' se è sbagliata. */
  reauthenticate(password: string): Promise<void>
  /** Elimina per sempre l'account di accesso dell'utente collegato, che resta scollegato. */
  deleteAccount(): Promise<void>
  /**
   * Invia l'email con il link per scegliere una nuova password. Errore 'auth/invalid-email' se l'indirizzo non è valido.
   * Se l'indirizzo non ha un account NON dà errore (non si deve poter scoprire chi è iscritto).
   */
  sendPasswordReset(email: string): Promise<void>
  /** Invia (di nuovo) all'utente collegato l'email di verifica. Errore 'auth/too-many-requests' se si insiste troppo. */
  sendVerificationEmail(): Promise<void>
  /** L'utente collegato ha confermato l'email? Rilegge lo stato aggiornato (l'utente può aver cliccato il link da un altro telefono). */
  isEmailVerified(): Promise<boolean>
  /** Uid dell'utente collegato, oppure null. */
  currentUid(): string | null
  /** Avvisa quando l'utente entra o esce; restituisce la funzione per smettere di ascoltare. */
  onChange(listener: (uid: string | null) => void): () => void
}
