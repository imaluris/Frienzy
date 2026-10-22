import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import type { PushNotificationInfo, PushPermission, PushService } from './pushService'

// Collega l'interfaccia al plugin Capacitor. Si esegue solo dentro l'app Android.
export class CapacitorPushService implements PushService {
  isSupported(): boolean {
    return Capacitor.isNativePlatform()
  }

  async requestPermission(): Promise<PushPermission> {
    const current = await PushNotifications.checkPermissions()
    const result = current.receive === 'prompt' ? await PushNotifications.requestPermissions() : current
    if (result.receive === 'granted') return 'granted'
    return result.receive === 'denied' ? 'denied' : 'prompt'
  }

  register(): Promise<void> {
    return PushNotifications.register()
  }

  // Ogni `on...` restituisce una funzione che toglie l'ascolto (serve a React per pulire).
  onToken(listener: (token: string) => void): () => void {
    return this.listen('registration', (t: { value: string }) => listener(t.value))
  }

  onError(listener: (message: string) => void): () => void {
    return this.listen('registrationError', (e: { error: string }) => listener(e.error))
  }

  onNotification(listener: (info: PushNotificationInfo) => void): () => void {
    return this.listen('pushNotificationReceived', (n: { title?: string; body?: string }) =>
      listener({ title: n.title ?? '', body: n.body ?? '' }),
    )
  }

  private listen<T>(name: 'registration' | 'registrationError' | 'pushNotificationReceived', handler: (payload: T) => void) {
    const handle = PushNotifications.addListener(name as never, handler as never)
    return () => void handle.then((h) => h.remove())
  }
}
