import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import type { NewReport } from '../safety/report'
import type { ReportRepository } from '../safety/reportRepository'
import { db } from './app'
import { stampLimit } from './limitStamp'

// segnalazioni/{id}: le regole permettono di crearle ma non di rileggerle (le vede solo chi gestisce l'app).
// Come per messaggi ed eventi, la segnalazione parte insieme al timbro dei limiti (una ogni 30 secondi).
export class FirestoreReportRepository implements ReportRepository {
  async submit(report: NewReport): Promise<void> {
    const batch = writeBatch(db())
    batch.set(doc(collection(db(), 'segnalazioni')), { ...report, creatoIl: serverTimestamp() })
    stampLimit(batch, report.reporterUid, 'ultimaSegnalazione')
    await batch.commit()
  }
}
