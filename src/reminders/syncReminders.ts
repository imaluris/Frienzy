import { loadMine } from '../mine/loadMine'
import type { Services } from '../firebase/createServices'
import { planReminders } from './planReminders'
import { reminderEvents } from './reminderEvents'

export type SyncResult = 'unsupported' | 'off' | 'no-permission' | 'ok'

type Ports = Pick<Services, 'events' | 'participations' | 'notifications' | 'reminders'>

/**
 * Ricalcola e riprogramma tutti i promemoria. Si chiama all'avvio, al ritorno in primo piano
 * e dopo iscrizione, ritiro, annullamento o cambio di stato. Interruttore spento = annulla tutto.
 */
export async function syncReminders(ports: Ports, uid: string, now: Date = new Date()): Promise<SyncResult> {
  const { reminders } = ports
  if (!reminders.isSupported()) return 'unsupported'
  const prefs = await ports.notifications.getPrefs(uid)
  if (!prefs.promemoria) {
    await reminders.cancelAll()
    return 'off'
  }
  if ((await reminders.permission()) !== 'granted') return 'no-permission'
  const mine = await loadMine(ports.events, ports.participations, uid)
  await reminders.replaceAll(planReminders(reminderEvents(mine), now))
  return 'ok'
}
