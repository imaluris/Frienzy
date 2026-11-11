import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { ReminderService } from './reminderService'
import type { Reminder, ReminderPermission } from './types'

const toPermission = (value: string): ReminderPermission => (value === 'granted' ? 'granted' : value === 'denied' ? 'denied' : 'prompt')

// Collega l'interfaccia al plugin Capacitor. Si esegue solo dentro l'app Android; nel browser ogni metodo non fa nulla.
export class CapacitorReminderService implements ReminderService {
  isSupported(): boolean {
    return Capacitor.isNativePlatform()
  }

  async permission(): Promise<ReminderPermission> {
    return toPermission((await LocalNotifications.checkPermissions()).display)
  }

  async requestPermission(): Promise<ReminderPermission> {
    const current = await LocalNotifications.checkPermissions()
    return toPermission((current.display === 'prompt' || current.display === 'prompt-with-rationale' ? await LocalNotifications.requestPermissions() : current).display)
  }

  async replaceAll(reminders: Reminder[]): Promise<void> {
    if (!this.isSupported()) return
    await this.cancelAll()
    if (reminders.length === 0) return
    await LocalNotifications.schedule({
      notifications: reminders.map((r) => ({ id: r.id, title: r.title, body: r.body, schedule: { at: r.at, allowWhileIdle: true } })),
    })
  }

  async cancelAll(): Promise<void> {
    if (!this.isSupported()) return
    const pending = await LocalNotifications.getPending()
    if (pending.notifications.length > 0) await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) })
  }
}
