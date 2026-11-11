import { SEEN_MAX, type SeenRepository } from './seenRepository'

export class MemorySeenRepository implements SeenRepository {
  private byUser = new Map<string, string[]>()

  async get(uid: string) {
    return [...(this.byUser.get(uid) ?? [])]
  }

  async save(uid: string, keys: string[]) {
    this.byUser.set(uid, keys.slice(-SEEN_MAX))
  }

  async clear(uid: string) {
    this.byUser.delete(uid)
  }
}
