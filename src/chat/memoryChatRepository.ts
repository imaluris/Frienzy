import { canDeleteMessage, canUseChat, checkMessageText } from './chatRules'
import type { ChatRepository } from './chatRepository'
import type { ChatMessage, ChatRole } from './message'

type Listener = { uid: string; onMessages: (m: ChatMessage[]) => void; onError: (e: Error) => void }

// Versione in memoria. Il ruolo arriva da una funzione (come per il luogo esatto degli eventi),
// così ogni chiamata guarda lo stato ATTUALE: chi lascia l'evento perde subito l'accesso.
export class MemoryChatRepository implements ChatRepository {
  private messages = new Map<string, ChatMessage[]>()
  private listeners = new Map<string, Set<Listener>>()
  private counter = 0

  constructor(private roleOf: (eventId: string, uid: string) => Promise<ChatRole>, private now: () => Date = () => new Date()) {}

  subscribe(eventId: string, uid: string, onMessages: (m: ChatMessage[]) => void, onError: (e: Error) => void): () => void {
    const listener: Listener = { uid, onMessages, onError }
    let active = true
    void this.roleOf(eventId, uid).then((role) => {
      if (!active) return
      if (!canUseChat(role)) return onError(new Error('La chat è riservata a organizzatore e confermati.'))
      const set = this.listeners.get(eventId) ?? new Set<Listener>()
      set.add(listener)
      this.listeners.set(eventId, set)
      onMessages(this.list(eventId))
    })
    return () => {
      active = false
      this.listeners.get(eventId)?.delete(listener)
    }
  }

  async send(eventId: string, uid: string, testo: string): Promise<void> {
    if (!canUseChat(await this.roleOf(eventId, uid))) throw new Error('Solo organizzatore e confermati possono scrivere.')
    const check = checkMessageText(testo)
    if (!check.ok) throw new Error(check.error)
    const message: ChatMessage = { id: `m${++this.counter}`, eventId, authorUid: uid, testo: check.testo, creatoIl: this.now() }
    this.messages.set(eventId, [...this.list(eventId), message])
    await this.notify(eventId)
  }

  async remove(eventId: string, uid: string, messageId: string): Promise<void> {
    if (!canDeleteMessage(await this.roleOf(eventId, uid))) throw new Error("Solo chi organizza può cancellare i messaggi.")
    this.messages.set(eventId, this.list(eventId).filter((m) => m.id !== messageId))
    await this.notify(eventId)
  }

  async removeOwn(eventId: string, uid: string): Promise<void> {
    this.messages.set(eventId, this.list(eventId).filter((m) => m.authorUid !== uid))
    await this.notify(eventId)
  }

  private list(eventId: string): ChatMessage[] {
    return this.messages.get(eventId) ?? []
  }

  // Avvisa chi ascolta, ricontrollando il ruolo: chi non è più confermato riceve un errore e viene tolto.
  private async notify(eventId: string): Promise<void> {
    for (const l of [...(this.listeners.get(eventId) ?? [])]) {
      if (canUseChat(await this.roleOf(eventId, l.uid))) l.onMessages(this.list(eventId))
      else {
        this.listeners.get(eventId)?.delete(l)
        l.onError(new Error('Non hai più accesso alla chat.'))
      }
    }
  }
}
