import type { Contact, PrefName } from './types'

// Come l'app: promemoria, richieste e risposte sono accesi di partenza, gli inviti no.
const DEFAULT_ON: Record<PrefName, boolean> = { promemoria: true, richieste: true, risposte: true, inviti: false }

export function wants(contact: Contact, pref: PrefName): boolean {
  return contact.prefs[pref] ?? DEFAULT_ON[pref]
}

/** Token dei contatti che hanno la preferenza accesa e un telefono registrato. Senza doppioni. */
export function tokensFor(contacts: Contact[], pref: PrefName): string[] {
  const tokens = contacts.filter((c) => wants(c, pref) && c.device.token).map((c) => c.device.token as string)
  return [...new Set(tokens)]
}

/** Destinatari di un promemoria: organizzatore + confermati (mai richieste, rifiutati o lista d'attesa). */
export function reminderUids(organizerId: string, participants: { uid: string; stato: string }[]): string[] {
  const confirmed = participants.filter((p) => p.stato === 'confermato').map((p) => p.uid)
  return [...new Set([organizerId, ...confirmed])]
}
