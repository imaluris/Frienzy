import { useState } from 'react'
import { useServices } from '../app/ServicesContext'
import { useToast } from '../feedback/ToastContext'
import { MAX_DETAILS_LENGTH, REASON_LABELS, REPORT_REASONS, type ReportReason } from '../safety/reasons'
import { submitReport } from '../safety/submitReport'
import type { SafetyOption } from '../safety/options'
import { BottomSheet } from '../ui/BottomSheet'

type ReportOption = Extract<SafetyOption, { kind: 'report-event' | 'report-user' }>

// Finestra di segnalazione: motivo da una lista fissa, dettagli facoltativi (obbligatori con "Altro").
export function ReportSheet({ option, onClose }: { option: ReportOption; onClose: () => void }) {
  const { reports, auth } = useServices()
  const { show } = useToast()
  const [motivo, setMotivo] = useState<ReportReason | null>(null)
  const [dettagli, setDettagli] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEvent = option.kind === 'report-event'

  async function send() {
    const reporterUid = auth.currentUid()
    if (!reporterUid || !motivo) return setError('Scegli un motivo.')
    setBusy(true)
    setError(null)
    try {
      await submitReport(reports, {
        reporterUid, motivo, dettagli,
        tipo: isEvent ? 'evento' : 'utente',
        targetId: isEvent ? option.eventId : option.uid,
      })
      show('Grazie: abbiamo ricevuto la segnalazione', 'success')
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Non sono riuscito a inviare la segnalazione. Riprova.')
      setBusy(false)
    }
  }

  return (
    <BottomSheet title={isEvent ? 'Segnala questo evento' : `Segnala ${option.nome}`} onClose={onClose}>
      <p className="sheet-text report-intro">La segnalazione è riservata: nessuno saprà che sei stato tu.</p>
      <fieldset className="report-reasons">
        <legend className="sr-only">Motivo della segnalazione</legend>
        {REPORT_REASONS.map((r) => (
          <label key={r} className={`reason${motivo === r ? ' selected' : ''}`}>
            <input type="radio" name="motivo" value={r} checked={motivo === r} onChange={() => setMotivo(r)} />
            <span>{REASON_LABELS[r]}</span>
          </label>
        ))}
      </fieldset>
      <label className="report-details">
        {motivo === 'altro' ? 'Racconta cosa è successo' : 'Dettagli (facoltativo)'}
        <textarea value={dettagli} maxLength={MAX_DETAILS_LENGTH} rows={2} onChange={(e) => setDettagli(e.target.value)} />
        <span className="chat-count">{dettagli.length}/{MAX_DETAILS_LENGTH}</span>
      </label>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="sheet-actions">
        <button type="button" disabled={busy || !motivo} aria-busy={busy} onClick={() => void send()}>Invia segnalazione</button>
        <button type="button" className="secondary" disabled={busy} onClick={onClose}>Annulla</button>
      </div>
    </BottomSheet>
  )
}
