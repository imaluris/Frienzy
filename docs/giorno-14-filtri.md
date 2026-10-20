# Giorno 14 – Filtri per tipo, data e distanza

## Lettura scelta
"Funzioni pure sul geohash" l'ho letto così: la distanza si calcola dal **centro della cella del geohash** dell'evento (il dato approssimato, mai il luogo esatto) fino a un punto di riferimento. Il punto di riferimento è la posizione del dispositivo, chiesta solo quando si preme "Filtra per distanza" e mai salvata. I filtri sono applicati sull'elenco già caricato (nessuna query nuova): per un elenco piccolo è la scelta più semplice.

## Perché queste scelte
- **Un file per responsabilità** in `src/filters`: `distance.ts` (geografia), `eventFilters.ts` (i tre criteri e la loro combinazione), `useMyPosition.ts` (il browser). `decodeGeohash` sta accanto a `encodeGeohash`, in `src/events`.
- **`NO_FILTERS`**: uno stato iniziale unico; "nessun filtro" significa liste vuote e `null`, non valori speciali.
- **Criteri indipendenti, uniti da E**: `filterEvents` chiede a tre funzioni piccole (`matchesType`, `matchesDates`, `matchesDistance`) e tiene l'evento solo se tutte dicono sì. Sono anche esportate, quindi testabili una per una.
- **Date "incluse"**: `a` vale fino alla fine di quel giorno. Il limite è l'inizio del giorno dopo, escluso (`time >= a + 24h` → fuori). Date in UTC, come per la data di nascita.
- **Distanza spenta se manca centro o raggio**: un raggio senza centro non ha senso; meglio non filtrare che nascondere tutto.
- **Geohash illeggibile → escluso** dal filtro distanza: non possiamo dire che sia vicino.

## Il codice, pezzo per pezzo
- `decodeGeohash`: ripete al contrario la codifica. Ogni carattere vale 5 bit; ogni bit, a turno longitudine e latitudine (si parte dalla longitudine), dice se tenere la metà alta o bassa dell'intervallo. Alla fine il centro dell'intervallo è il punto. Un carattere fuori dall'alfabeto (`indexOf` = -1) o un testo vuoto danno `null`.
- `distanceKm` (haversine): distanza sulla sfera terrestre da due coppie lat/lng; gli angoli vanno prima in radianti.
- `useMyPosition`: stati `idle | asking | denied | unsupported | ok`. `navigator.geolocation` viene chiamato solo da `ask()`.
- `FiltersBar`: bottoni tipo con `aria-pressed` (si può selezionare più di un tipo), due campi data, e il menu raggio (5/10/25/50 km) che compare solo quando la posizione è nota. Scegliere "ovunque" rimette `centro` e `raggioKm` a `null`.
- `EventListScreen`: tiene `filters` in uno `useState` e calcola l'elenco mostrato con `useMemo`; se i filtri escludono tutto dice "Nessun evento con questi filtri.".
- Non ho applicato i filtri alla mappa: il task parlava dell'elenco.

## Errori incontrati
Nessuno. Nei test sulla distanza la posizione è finta: `vi.stubGlobal('navigator', ...)`, ripulita a ogni test con `vi.unstubAllGlobals()`.

## Esercizio
Aggiungi un filtro "solo con posti liberi" come quarta funzione `matches...` (servono i confermati, quindi pensa a cosa deve ricevere la funzione oltre all'evento). Poi scrivi il test: perché non puoi calcolarlo dal solo `FrienzyEvent`?
