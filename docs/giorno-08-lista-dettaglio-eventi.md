# Giorno 8 – Lista e dettaglio eventi

## Lettura scelta
"Solo futuri" l'ho letto così: l'evento deve avere la data **dopo** l'istante attuale (un evento che inizia proprio adesso non conta) e **non** essere annullato. Gli eventi con stato `chiuso` restano visibili: sono futuri, semplicemente non hanno più posti. Il dettaglio mostra solo dati pubblici: la zona, mai l'indirizzo esatto.

## Perché queste scelte
- **Filtro e ordinamento sono funzioni pure** (`listing.ts`): ricevono un elenco e una data "adesso" e restituiscono un nuovo elenco. Niente schermate, niente database: si testano in pochi millisecondi passando una data finta.
- **`now` come parametro** (con valore predefinito `new Date()`): è il trucco per testare codice che dipende dall'orologio.
- **Il repository non filtra**: `list()` restituisce tutto, come deciso al giorno 2. I filtri stanno in funzioni a parte (arriveranno anche tipo e distanza, task 14).
- **Hook `useUpcomingEvents`**: tiene fuori dalla schermata il "carica e aspetta". La schermata si limita a disegnare.

## Il codice, pezzo per pezzo
### `listing.ts`
`isUpcoming` confronta `getTime()` (millisecondi) e controlla che lo stato non sia `annullato`. `upcomingEvents` fa `filter` e poi `sort`. `filter` crea già un array nuovo, quindi `sort` (che modifica l'array su cui lavora) non tocca quello originale: c'è un test che lo verifica. Il comparatore `a - b` ordina dal più piccolo (più vicino) al più grande.

### `format.ts`
`Intl.DateTimeFormat('it-IT', …)` è lo strumento del browser per scrivere date in italiano ("martedì 20 ottobre, 19:30"). Il parametro `timeZone` serve ai test: con `'UTC'` il risultato non cambia da un computer all'altro.

### `useUpcomingEvents.ts`
Dentro `useEffect` chiamo `events.list()`. La variabile `active` evita di aggiornare lo stato se la schermata è già sparita (la funzione di pulizia la mette a `false`). Lo stato è un solo oggetto `{ loading, list, failed }`, così non possono esistere combinazioni incoerenti.

### `EventListScreen.tsx` e `EventDetailScreen.tsx`
L'elenco disegna una scheda-bottone per evento con emoji, titolo, data e zona. Il dettaglio carica un evento con `getById`; se non esiste mostra "Evento non trovato".

### `ProfileGate.tsx` / `HomeScreen.tsx`
Due nuovi stati: `browsing` (sto guardando gli eventi) e `openId` (quale evento è aperto). L'ordine dei controlli conta: prima il dettaglio, poi l'elenco, poi la home.

## Errori incontrati
- All'avvio `build`, `lint` e `test` non trovavano i pacchetti: la cartella `node_modules` non c'era in questa sessione. Risolto con `npm ci`, che installa esattamente le versioni di `package-lock.json`.

## Esercizio per Andrea
In `listing.ts` aggiungi la funzione `eventsOfDay(events, day)` che restituisce solo gli eventi di un certo giorno (suggerimento: confronta `toISOString().slice(0, 10)`), e scrivi due test in `listing.test.ts`: uno col giorno giusto, uno con un giorno senza eventi.
