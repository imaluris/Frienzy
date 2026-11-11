import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import type { NotificationRepository } from '../notifications/notificationRepository'
import { normalizePrefs, type DeviceInfo, type NotificationPrefs } from '../notifications/prefs'
import { db } from './app'

// Preferenze: users/{uid}/notifiche/preferenze. Dispositivo (token + zona di ~5 km): dispositivi/{uid}, raccolta di primo livello.
// Sono privati, solo il proprietario li legge. Il dispositivo lo legge anche il notificatore (GitHub Actions, con credenziali
// di amministrazione): sta a primo livello così lo legge con UNA lettura della raccolta, senza indici di collection group.
const prefsRef = (uid: string) => doc(db(), 'users', uid, 'notifiche', 'preferenze')
const deviceRef = (uid: string) => doc(db(), 'dispositivi', uid)

export class FirestoreNotificationRepository implements NotificationRepository {
  async getPrefs(uid: string): Promise<NotificationPrefs> {
    const snap = await getDoc(prefsRef(uid))
    return normalizePrefs(snap.exists() ? snap.data() : null)
  }

  async savePrefs(uid: string, prefs: NotificationPrefs): Promise<void> {
    await setDoc(prefsRef(uid), prefs)
  }

  async saveDevice(uid: string, device: DeviceInfo): Promise<void> {
    await setDoc(deviceRef(uid), { token: device.token, zona: device.zona, aggiornatoIl: serverTimestamp() })
  }

  async clear(uid: string): Promise<void> {
    await Promise.all([deleteDoc(prefsRef(uid)), deleteDoc(deviceRef(uid))])
  }
}
