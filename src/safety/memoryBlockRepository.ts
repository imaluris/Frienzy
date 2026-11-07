import type { BlockRepository } from './blockRepository'

// Versione in memoria: coppie "chi blocca → chi è bloccato".
export class MemoryBlockRepository implements BlockRepository {
  private blocks = new Map<string, Set<string>>()

  async block(uid: string, otherUid: string): Promise<void> {
    if (uid === otherUid) throw new Error('Non puoi bloccare te stesso.')
    const set = this.blocks.get(uid) ?? new Set<string>()
    set.add(otherUid)
    this.blocks.set(uid, set)
  }

  async unblock(uid: string, otherUid: string): Promise<void> {
    this.blocks.get(uid)?.delete(otherUid)
  }

  async unblockAll(uid: string): Promise<void> {
    this.blocks.delete(uid)
  }

  async listBlockedBy(uid: string): Promise<string[]> {
    return [...(this.blocks.get(uid) ?? [])]
  }

  async listBlockers(uid: string): Promise<string[]> {
    return [...this.blocks.entries()].filter(([, set]) => set.has(uid)).map(([blocker]) => blocker)
  }

  async isBlockedBetween(a: string, b: string): Promise<boolean> {
    return !!(this.blocks.get(a)?.has(b) || this.blocks.get(b)?.has(a))
  }
}
