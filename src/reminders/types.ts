// Un promemoria da programmare sul telefono: id numerico (lo vuole Android), quando, e il testo.
export interface Reminder {
  id: number
  at: Date
  title: string
  body: string
}

export type ReminderKind = '24h' | '2h'

export type ReminderPermission = 'granted' | 'denied' | 'prompt'
