import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

// Finestra che sale dal basso (bottom sheet): sfondo scuro, maniglia, chiusura con Esc o toccando fuori.
export function BottomSheet({ title, onClose, children }: Props) {
  const sheet = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sheet.current?.focus() // chi usa la tastiera o uno screen reader parte dentro la finestra
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="sheet-layer">
      <button type="button" className="sheet-backdrop" aria-label="Chiudi" tabIndex={-1} onClick={onClose} />
      <div ref={sheet} className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <span className="sheet-handle" aria-hidden="true" />
        <h2 className="sheet-title">{title}</h2>
        {children}
      </div>
    </div>
  )
}
