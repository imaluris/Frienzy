import type { ReminderService } from './reminderService'
import type { Reminder, ReminderPermission } from './types'

// Finto per i test e per la demo: tiene l'elenco in memoria. Di partenza "non supportato", come nel browser.
export class MemoryReminderService implements ReminderService {
  scheduled: Reminder[] = []
  cancelCalls = 0

  constructor(private supported = false, private current: ReminderPermission = 'granted') {}

  isSupported() { return this.supported }
  async permission() { return this.current }
  async requestPermission() { return this.current === 'prompt' ? (this.current = 'granted') : this.current }

  async replaceAll(reminders: Reminder[]) {
    this.scheduled = reminders.map((r) => ({ ...r }))
  }

  async cancelAll() {
    this.cancelCalls += 1
    this.scheduled = []
  }
}
