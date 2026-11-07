import type { NewReport } from './report'

// Le segnalazioni si possono solo inviare: nessun utente le rilegge (le guarda chi gestisce l'app dalla console).
export interface ReportRepository {
  submit(report: NewReport): Promise<void>
}
