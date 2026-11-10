// Le preferenze di notifica di una persona: quattro interruttori, salvati in users/{uid}/notifiche/preferenze.
export interface NotificationPrefs {
  /** Promemoria 24 ore e 2 ore prima degli eventi a cui sono iscritto. */
  promemoria: boolean
  /** (Organizzatore) qualcuno chiede di partecipare. */
  richieste: boolean
  /** La mia richiesta è stata accettata o rifiutata, o sono salito dalla lista d'attesa. */
  risposte: boolean
  /** Inviti a eventi vicini che corrispondono ai miei interessi. */
  inviti: boolean
}

export type PrefKey = keyof NotificationPrefs

// Gli inviti partono spenti: per funzionare hanno bisogno della zona, quindi li accende la persona.
export const DEFAULT_PREFS: NotificationPrefs = { promemoria: true, richieste: true, risposte: true, inviti: false }

export const PREF_LABELS: Record<PrefKey, { title: string; hint: string }> = {
  promemoria: { title: 'Promemoria', hint: '24 ore e 2 ore prima di un evento a cui partecipi' },
  richieste: { title: 'Richieste di partecipazione', hint: 'Quando qualcuno chiede di venire ai tuoi eventi' },
  risposte: { title: 'Risposte alle tue richieste', hint: 'Accettata, rifiutata o posto liberato in lista d\'attesa' },
  inviti: { title: 'Inviti vicino a te', hint: 'Eventi nuovi in zona che corrispondono ai tuoi interessi' },
}

export const PREF_KEYS = Object.keys(PREF_LABELS) as PrefKey[]

/** Unisce ciò che è salvato ai valori di partenza: chiavi mancanti o non booleane tornano al default. */
export function normalizePrefs(raw: Partial<Record<string, unknown>> | null | undefined): NotificationPrefs {
  const out = { ...DEFAULT_PREFS }
  for (const key of PREF_KEYS) if (typeof raw?.[key] === 'boolean') out[key] = raw[key] as boolean
  return out
}

/** Zona approssimata (geohash di 5 caratteri ≈ 5 km) per gli inviti: mai la posizione esatta. */
export const DEVICE_ZONE_PRECISION = 5

export interface DeviceInfo {
  token: string
  /** Geohash a 5 caratteri, oppure '' se la persona non ha condiviso la zona. */
  zona: string
}
