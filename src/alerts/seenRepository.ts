// Le chiavi degli avvisi già visti. Contratto: chi lo usa non sa se dietro c'è Firebase o la memoria.
export const SEEN_MAX = 200

export interface SeenRepository {
  /** Le chiavi viste da `uid` (dalla più vecchia alla più recente). */
  get(uid: string): Promise<string[]>
  /** Sostituisce l'elenco; ne tiene al massimo SEEN_MAX. */
  save(uid: string, keys: string[]): Promise<void>
  /** Cancella l'elenco (eliminazione account). */
  clear(uid: string): Promise<void>
}
