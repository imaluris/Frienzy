import { useState, type ChangeEvent } from 'react'
import { useServices } from '../app/ServicesContext'
import { validatePhotoFile } from '../profile/validation'

interface Props {
  uid: string
  fotoUrl: string
  onChange: (url: string) => void
}

// Scelta della foto: controlla il file, lo carica e restituisce l'indirizzo.
export function PhotoField({ uid, fotoUrl, onChange }: Props) {
  const { photos } = useServices()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const problem = validatePhotoFile(file)
    setError(problem)
    if (problem) return
    setBusy(true)
    try {
      onChange(await photos.upload(uid, file))
    } catch {
      setError('Non sono riuscito a caricare la foto. Riprova.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {fotoUrl && <img className="avatar" src={fotoUrl} alt="La tua foto" />}
      <label>
        Foto
        <input type="file" accept="image/*" onChange={(e) => void handleFile(e)} disabled={busy} />
      </label>
      {error && <p role="alert" className="error">{error}</p>}
    </div>
  )
}
