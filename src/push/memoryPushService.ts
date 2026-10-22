import type { PushNotificationInfo, PushPermission, PushService } from './pushService'

// Servizio finto per i test: decidiamo noi permesso e token, e possiamo "far arrivare" una notifica.
export class MemoryPushService implements PushService {
  private tokenListeners: ((t: string) => void)[] = []
  private errorListeners: ((m: string) => void)[] = []
  private notificationListeners: ((n: PushNotificationInfo) => void)[] = []

  constructor(
    private readonly supported = true,
    private readonly permission: PushPermission = 'granted',
    private readonly token = 'token-finto-123',
  ) {}

  isSupported() {
    return this.supported
  }

  async requestPermission() {
    return this.permission
  }

  async register() {
    this.tokenListeners.forEach((l) => l(this.token))
  }

  onToken(listener: (t: string) => void) {
    return this.add(this.tokenListeners, listener)
  }

  onError(listener: (m: string) => void) {
    return this.add(this.errorListeners, listener)
  }

  onNotification(listener: (n: PushNotificationInfo) => void) {
    return this.add(this.notificationListeners, listener)
  }

  /** Solo per i test: simula l'arrivo di una notifica. */
  emitNotification(info: PushNotificationInfo) {
    this.notificationListeners.forEach((l) => l(info))
  }

  private add<T>(list: T[], item: T) {
    list.push(item)
    return () => {
      const i = list.indexOf(item)
      if (i >= 0) list.splice(i, 1)
    }
  }
}
