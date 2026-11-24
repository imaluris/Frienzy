import { useState, type FormEvent } from 'react'
import { searchPlaces } from '../geo/geocode'
import type { Place } from '../geo/place'
import { Icon } from '../ui/Icon'

interface Props {
  onChoose: (place: Place) => void
}

// Cerca l'indirizzo scritto (solo quando si preme "Cerca", mai a ogni tasto) e mostra i risultati da toccare.
export function AddressSearch({ onChoose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [note, setNote] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function search(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setNote(null)
    try {
      const found = await searchPlaces(query)
      setResults(found)
      if (found.length === 0) setNote('Non trovo questo indirizzo: prova con via, numero e città.')
    } catch {
      setResults([])
      setNote('Non riesco a cercare l\'indirizzo: controlla la connessione e riprova.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="address-search">
      <form className="address-form" onSubmit={(e) => void search(e)}>
        <input
          type="search"
          aria-label="Indirizzo dell'evento"
          placeholder="Via, numero e città"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={busy || query.trim().length < 3}>{busy ? 'Cerco…' : 'Cerca'}</button>
      </form>
      {note && <p role="status" className="hint">{note}</p>}
      {results.length > 0 && (
        <ul className="address-results" aria-label="Indirizzi trovati">
          {results.map((place) => (
            <li key={`${place.lat},${place.lng}`}>
              <button type="button" className="secondary" onClick={() => { onChoose(place); setResults([]); setQuery(place.address) }}>
                <Icon name="pin" size={18} /> {place.address}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
