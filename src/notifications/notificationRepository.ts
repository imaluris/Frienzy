import type { DeviceInfo, NotificationPrefs } from './prefs'

// Contratto per preferenze e dispositivo di notifica. Dietro c'è Firestore o la memoria.
export interface NotificationRepository {
  /** Le preferenze salvate, oppure quelle di partenza se non ce ne sono. */
  getPrefs(uid: string): Promise<NotificationPrefs>
  savePrefs(uid: string, prefs: NotificationPrefs): Promise<void>
  /** Registra il token del telefono e la zona approssimata (usata solo per gli inviti). */
  saveDevice(uid: string, device: DeviceInfo): Promise<void>
  /** Cancella preferenze e dispositivo (eliminazione account). */
  clear(uid: string): Promise<void>
}
