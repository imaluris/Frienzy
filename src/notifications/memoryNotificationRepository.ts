import type { NotificationRepository } from './notificationRepository'
import { DEFAULT_PREFS, type DeviceInfo, type NotificationPrefs } from './prefs'

export class MemoryNotificationRepository implements NotificationRepository {
  private prefs = new Map<string, NotificationPrefs>()
  private devices = new Map<string, DeviceInfo>()

  async getPrefs(uid: string) {
    return { ...(this.prefs.get(uid) ?? DEFAULT_PREFS) }
  }

  async savePrefs(uid: string, prefs: NotificationPrefs) {
    this.prefs.set(uid, { ...prefs })
  }

  async saveDevice(uid: string, device: DeviceInfo) {
    this.devices.set(uid, { ...device })
  }

  async clear(uid: string) {
    this.prefs.delete(uid)
    this.devices.delete(uid)
  }

  /** Solo per i test: cosa risulta salvato per il dispositivo. */
  deviceOf(uid: string): DeviceInfo | undefined {
    return this.devices.get(uid)
  }
}
