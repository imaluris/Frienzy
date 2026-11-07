// Gli eventi che ho salvato col cuore. Contratto: chi lo usa non sa se dietro c'è Firebase o la memoria.
export interface SavedRepository {
  /** Gli id degli eventi salvati da `uid`, dal salvato più di recente. */
  listIds(uid: string): Promise<string[]>
  /** Salva; se era già salvato non cambia nulla. */
  add(uid: string, eventId: string): Promise<void>
  /** Toglie dai salvati; se non c'era non è un errore. */
  remove(uid: string, eventId: string): Promise<void>
  /** Toglie tutti i salvati di `uid` (eliminazione account). */
  clear(uid: string): Promise<void>
}
