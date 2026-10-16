# Giorno 9 – Mappa con marker

## Lettura scelta
"Il build include la mappa" l'ho letto così: Leaflet è una dipendenza vera del progetto, viene importata dal codice dell'app e finisce nel pacchetto prodotto da `npm run build` (verificato cercando le classi `leaflet-container` in `dist`). La mappa mostra gli eventi futuri (stessa logica dell'elenco) usando **solo** la zona approssimata, mai il luogo esatto. Le tile (le immagini della mappa) non si possono provare qui: il codice è scritto ma non verificato visivamente.

## Perché queste scelte
- **Funzione pura `eventsToMarkers`** (`src/map/markers.ts`): prende eventi e restituisce oggetti semplici `{ eventId, lat, lng, emoji, title }`. Non conosce Leaflet, quindi si testa senza mappa né browser.
- **`centerOf`** (`viewport.ts`): calcola il centro come media dei marker; se non ce ne sono, usa un centro predefinito. Anche questa è pura e testata.
- **Leaflet usato "a mano"** dentro `useEffect`, senza librerie wrapper: meno dipendenze e si vede esattamente cosa succede.
- **La schermata riusa `useUpcomingEvents`**: stesso filtro "solo futuri" dell'elenco, nessun codice duplicato.

## Il codice, pezzo per pezzo
### `markers.ts`
`events.map(...)` trasforma ogni evento in un marker. L'emoji viene dalla tabella `EVENT_TYPE_EMOJI` già esistente (aperitivo 🍹, cena 🍽️, …). Si usano `latApprossimata` e `lngApprossimata`.

### `EventMap.tsx`
- `useRef` ci dà il `<div>` reale in cui Leaflet disegna.
- `useEffect` crea la mappa (`L.map`), aggiunge il livello di tile OpenStreetMap e un marker per ciascun elemento. `L.divIcon` permette di usare HTML (la nostra emoji) al posto dell'immagine predefinita, che con i bundler spesso non si carica.
- La funzione restituita da `useEffect` chiama `map.remove()`: pulisce la mappa quando i marker cambiano o la schermata sparisce, così non se ne accumulano due sullo stesso `<div>`.
- Il click su un marker chiama `onSelect(eventId)`.

### `MapScreen.tsx`
Carica gli eventi, calcola i marker con `useMemo` (così l'array non cambia a ogni disegno e la mappa non viene ricreata di continuo) e apre il dettaglio al tocco.

### `ProfileGate.tsx` / `HomeScreen.tsx`
Nuovo stato `mapping` e bottone "Mappa" nella home. Dal marker si arriva allo stesso dettaglio dell'elenco.

## Errori incontrati
- Nessun errore bloccante. La mappa non ha un test di disegno perché jsdom (il finto browser dei test) non sa misurare le dimensioni: per questo la logica è nelle funzioni pure.
- Il build segnala un pacchetto JS sopra i 500 kB: è solo un avviso, Leaflet pesa. Si potrà spezzare con un caricamento "a richiesta" più avanti.

## Esercizio per Andrea
In `viewport.ts` aggiungi `zoomFor(markers)` che restituisce 12 se c'è un solo marker o nessuno, altrimenti 11. Scrivi due test in `markers.test.ts`.
