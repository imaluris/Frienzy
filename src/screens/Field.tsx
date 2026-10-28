import type { ReactNode } from 'react'

interface Props {
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

// Etichetta + campo + messaggio d'errore subito sotto il campo.
export function Field({ label, error, hint, children }: Props) {
  return (
    <label className="field">
      {label}
      {hint && <span className="hint">{hint}</span>}
      {children}
      {error && <span role="alert" className="field-error">{error}</span>}
    </label>
  )
}
