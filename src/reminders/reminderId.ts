import type { ReminderKind } from './types'

/**
 * Id stabile per evento + tipo di promemoria: lo stesso evento dà sempre lo stesso numero,
 * così riprogrammare non crea doppioni. Hash FNV-1a ridotto a 31 bit (Android vuole un intero positivo).
 */
export function reminderId(eventId: string, kind: ReminderKind): number {
  let hash = 0x811c9dc5
  for (const char of `${eventId}:${kind}`) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) & 0x7fffffff || 1 // mai 0
}
