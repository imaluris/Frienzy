import type { Reminder, ReminderPermission } from './types'

// Promemoria sul telefono. L'app non sa se dietro c'è Capacitor o un finto per i test.
export interface ReminderService {
  /** true solo dentro l'app nativa (nel browser non c'è nulla da programmare). */
  isSupported(): boolean
  permission(): Promise<ReminderPermission>
  requestPermission(): Promise<ReminderPermission>
  /** Toglie tutti i promemoria programmati e programma quelli indicati. */
  replaceAll(reminders: Reminder[]): Promise<void>
  cancelAll(): Promise<void>
}
