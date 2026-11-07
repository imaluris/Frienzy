import { MAX_DETAILS_LENGTH, REPORT_REASONS, type ReportReason, type ReportTarget } from './reasons'

// Una segnalazione come viene salvata: chi la fa, cosa segnala, perché.
export interface NewReport {
  reporterUid: string
  tipo: ReportTarget
  targetId: string
  motivo: ReportReason
  dettagli: string
}

export type ReportCheck = { ok: true; report: NewReport } | { ok: false; error: string }

/**
 * Controlla una segnalazione e la ripulisce (spazi ai bordi nei dettagli).
 * Le stesse regole le applicano le regole Firestore, tranne "non puoi segnalare te stesso" e "Altro vuole una spiegazione".
 */
export function checkReport(input: NewReport): ReportCheck {
  if (!REPORT_REASONS.includes(input.motivo)) return { ok: false, error: 'Scegli un motivo.' }
  if (input.tipo === 'utente' && input.targetId === input.reporterUid) return { ok: false, error: 'Non puoi segnalare te stesso.' }
  const dettagli = input.dettagli.trim()
  if (dettagli.length > MAX_DETAILS_LENGTH) return { ok: false, error: `Puoi scrivere al massimo ${MAX_DETAILS_LENGTH} caratteri.` }
  if (input.motivo === 'altro' && dettagli.length < 3) return { ok: false, error: 'Con "Altro" racconta in due parole cosa è successo.' }
  return { ok: true, report: { ...input, dettagli } }
}
