// Chi ha bloccato chi. Contratto: chi lo usa non sa se dietro c'è Firebase o la memoria.
export interface BlockRepository {
  /** `uid` blocca `otherUid`; se era già bloccato non cambia nulla. Errore se sono la stessa persona. */
  block(uid: string, otherUid: string): Promise<void>
  /** Toglie il blocco; se non c'era non è un errore. */
  unblock(uid: string, otherUid: string): Promise<void>
  /** Le persone che `uid` ha bloccato. */
  listBlockedBy(uid: string): Promise<string[]>
  /** Le persone che hanno bloccato `uid`. */
  listBlockers(uid: string): Promise<string[]>
  /** C'è un blocco tra le due persone, in una direzione qualunque? */
  isBlockedBetween(a: string, b: string): Promise<boolean>
}
