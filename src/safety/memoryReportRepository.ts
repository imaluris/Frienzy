import type { NewReport } from './report'
import type { ReportRepository } from './reportRepository'

// Versione in memoria. `all` esiste solo qui, per i test: il contratto vero non permette di rileggere.
export class MemoryReportRepository implements ReportRepository {
  private items: NewReport[] = []

  async submit(report: NewReport): Promise<void> {
    this.items.push({ ...report })
  }

  all(): NewReport[] {
    return this.items.map((r) => ({ ...r }))
  }
}
