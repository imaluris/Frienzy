import type { ParticipationView } from './participationView'

export type BarAction = 'join' | 'waitlist' | 'withdraw' | 'manage'

export interface BarModel {
  label: string
  /** Cosa succede al tocco; null = pulsante spento (nessuna azione possibile). */
  action: BarAction | null
  tone: 'primary' | 'secondary'
  /** Serve una conferma (finestra dal basso) prima di eseguire. */
  confirm: boolean
}

const MODELS: Record<ParticipationView, BarModel> = {
  partecipa: { label: 'Partecipa', action: 'join', tone: 'primary', confirm: false },
  chiedi: { label: 'Chiedi di partecipare', action: 'join', tone: 'primary', confirm: false },
  confermato: { label: 'Ritirati', action: 'withdraw', tone: 'secondary', confirm: true },
  richiesta: { label: 'Ritira la richiesta', action: 'withdraw', tone: 'secondary', confirm: true },
  organizzatore: { label: 'Gestisci evento', action: 'manage', tone: 'primary', confirm: false },
  pieno: { label: "Mettiti in lista d'attesa", action: 'waitlist', tone: 'primary', confirm: false },
  attesa: { label: 'Esci dalla lista', action: 'withdraw', tone: 'secondary', confirm: true },
  annullato: { label: 'Annullato', action: null, tone: 'secondary', confirm: false },
  chiuso: { label: 'Iscrizioni chiuse', action: null, tone: 'secondary', confirm: false },
  rifiutato: { label: 'Richiesta rifiutata', action: null, tone: 'secondary', confirm: false },
}

/** Il pulsante grande della barra fissa in basso, per ogni situazione di chi guarda. */
export const barModel = (view: ParticipationView): BarModel => MODELS[view]

const NOTES: Partial<Record<ParticipationView, { text: string; tone: 'ok' | 'wait' | 'stop' }>> = {
  annullato: { text: 'Questo evento è stato annullato.', tone: 'stop' },
  chiuso: { text: 'Le iscrizioni a questo evento sono chiuse.', tone: 'stop' },
  confermato: { text: 'Sei dei nostri: la tua partecipazione è confermata.', tone: 'ok' },
  richiesta: { text: "Richiesta inviata: aspetta la risposta dell'organizzatore.", tone: 'wait' },
  rifiutato: { text: "L'organizzatore non ha accettato la tua richiesta.", tone: 'stop' },
  pieno: { text: "Posti esauriti: se qualcuno si ritira, la lista d'attesa ti dà la precedenza.", tone: 'wait' },
}

/** La frase di stato mostrata nella pagina (assente quando non serve). */
export function statusNote(view: ParticipationView, position?: number | null) {
  if (view === 'attesa') {
    const where = position ? `Sei ${position}° in lista d'attesa` : "Sei in lista d'attesa"
    return { text: `${where}: se si libera un posto, tocca a te.`, tone: 'wait' as const }
  }
  return NOTES[view] ?? null
}

/** Domande della finestra di conferma, per ritiro e annullamento. */
export const WITHDRAW_COPY: Record<'confermato' | 'richiesta' | 'attesa', { title: string; text: string; yes: string }> = {
  confermato: { title: 'Vuoi ritirarti?', text: 'Libererai il tuo posto e gli altri potranno prenderlo.', yes: 'Sì, ritirati' },
  attesa: { title: "Uscire dalla lista d'attesa?", text: 'Perdi il tuo turno: potrai rimetterti in coda, ma in fondo.', yes: 'Sì, esci' },
  richiesta: { title: 'Ritirare la richiesta?', text: "L'organizzatore non la vedrà più. Potrai rifarla finché ci sono posti.", yes: 'Sì, ritira' },
}

/** Un evento annullato è annullato per tutti, anche per chi aveva già un posto o l'ha organizzato: niente "Ritirati" né "Gestisci". */
export function effectiveView(eventStato: string, view: ParticipationView): ParticipationView {
  return eventStato === 'annullato' ? 'annullato' : view
}
