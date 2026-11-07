import { checkReport, type NewReport } from './report'
import type { ReportRepository } from './reportRepository'

/** Punto d'ingresso della schermata: valida e invia. Il motivo dell'errore arriva come Error. */
export async function submitReport(reports: ReportRepository, input: NewReport): Promise<void> {
  const check = checkReport(input)
  if (!check.ok) throw new Error(check.error)
  await reports.submit(check.report)
}
