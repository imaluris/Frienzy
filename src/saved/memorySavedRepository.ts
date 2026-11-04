import type { SavedRepository } from './savedRepository'

// Versione in memoria: una mappa uid -> (id evento -> ordine di salvataggio).
export class MemorySavedRepository implements SavedRepository {
  private byUser = new Map<string, Map<string, number>>()
  private counter = 0

  async listIds(uid: string): Promise<string[]> {
    const saved = this.byUser.get(uid)
    if (!saved) return []
    return [...saved.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
  }

  async add(uid: string, eventId: string): Promise<void> {
    const saved = this.byUser.get(uid) ?? new Map<string, number>()
    if (!saved.has(eventId)) saved.set(eventId, ++this.counter)
    this.byUser.set(uid, saved)
  }

  async remove(uid: string, eventId: string): Promise<void> {
    this.byUser.get(uid)?.delete(eventId)
  }
}
