import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { haptic } from './haptics'
import { Toast } from './Toast'
import { TOAST_MS, type ToastMessage, type ToastTone } from './toastModel'

interface ToastApi {
  /** Mostra un messaggio breve in basso; con tono 'success' o 'warning' fa anche vibrare leggermente il telefono. */
  show: (text: string, tone?: ToastTone) => void
}

// Senza provider (nei test dei singoli schermi) show non fa nulla: nessuna schermata dipende dal toast per funzionare.
const ToastContext = createContext<ToastApi>({ show: () => {} })

export const useToast = () => useContext(ToastContext)

// Un solo messaggio alla volta: uno nuovo sostituisce il precedente e il tempo riparte.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null)

  const show = useCallback((text: string, tone: ToastTone = 'info') => {
    setMessage((m) => ({ id: (m?.id ?? 0) + 1, text, tone }))
    if (tone === 'success') void haptic('success')
    if (tone === 'warning') void haptic('warning')
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), TOAST_MS)
    return () => clearTimeout(timer)
  }, [message])

  const api = useMemo(() => ({ show }), [show])
  return (
    <ToastContext.Provider value={api}>
      {children}
      {message && <Toast key={message.id} message={message} />}
    </ToastContext.Provider>
  )
}
