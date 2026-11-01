import { useState, type FormEvent } from 'react'
import { useServices } from '../app/ServicesContext'
import type { UserProfile } from '../domain/user'
import { saveProfile, toProfileInput } from '../profile/profileService'
import { BIO_MAX, type ProfileInput } from '../profile/validation'
import { InterestPicker } from './InterestPicker'
import { Avatar } from '../ui/Avatar'

interface Props {
  uid: string
  /** Profilo da modificare. */
  current: UserProfile
  onSaved: (profile: UserProfile) => void
}

// Form per modificare il profilo (la creazione è nei passi della registrazione).
export function ProfileScreen({ uid, current, onSaved }: Props) {
  const { users } = useServices()
  const [input, setInput] = useState<ProfileInput>(toProfileInput(current))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (patch: Partial<ProfileInput>) => setInput((old) => ({ ...old, ...patch }))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      setError(null)
      onSaved(await saveProfile(users, uid, input))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Qualcosa è andato storto.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <div className="avatar-edit"><Avatar name={input.nome} size="lg" /></div>
      <label>
        Nome
        <input value={input.nome} onChange={(e) => set({ nome: e.target.value })} />
      </label>
      <label>
        Data di nascita
        <input type="date" value={input.dataNascita} onChange={(e) => set({ dataNascita: e.target.value })} />
      </label>
      <label>
        Bio ({input.bio.length}/{BIO_MAX})
        <textarea value={input.bio} onChange={(e) => set({ bio: e.target.value })} />
      </label>
      <InterestPicker selected={input.interessi} onChange={(interessi) => set({ interessi })} />
      {error && <p role="alert" className="error">{error}</p>}
      <button type="submit" disabled={busy}>Salva</button>
    </form>
  )
}
