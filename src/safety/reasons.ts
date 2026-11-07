// Motivi fissi per segnalare. L'ordine è quello mostrato nella finestra di segnalazione.
export const REPORT_REASONS = ['spam', 'inappropriato', 'molestie', 'truffa', 'falso', 'altro'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

export const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam o pubblicità',
  inappropriato: 'Contenuto inappropriato',
  molestie: 'Molestie o comportamento aggressivo',
  truffa: 'Truffa o richiesta di soldi',
  falso: 'Evento o profilo falso',
  altro: 'Altro',
}

/** Si può segnalare un evento o una persona. */
export type ReportTarget = 'evento' | 'utente'

export const MAX_DETAILS_LENGTH = 300
