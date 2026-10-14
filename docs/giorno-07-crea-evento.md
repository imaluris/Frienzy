# Giorno 7 – Crea evento

## Lettura scelta
Il task dice "form con luogo" ma la mappa arriva solo al task 9. Ho scelto la lettura più semplice: per ora latitudine e longitudine si scrivono a mano nel form. Il punto verrà scelto sulla mappa più avanti, senza cambiare la logica scritta oggi.

## Perché queste scelte
- **Cartella `src/events/`**: tutta la logica degli eventi sta qui, separata dalle schermate. Così si testa senza aprire nessuna pagina.
- **Una funzione per ogni controllo** (`validateTitle`, `validateDateTime`, …) più `validateEvent` che le prova in fila e restituisce il primo errore. I limiti (titolo 3–100 caratteri, massimo 1–200 persone, ecc.) sono gli stessi di `firestore.rules`: se il form li accetta, le regole non devono rifiutare.
- **Il form passa testo, non numeri**: un `<input>` restituisce sempre stringhe. `EventInput` è quindi tutto testo; la conversione (`parseNumber`, `parseDateTime`) avviene dopo la convalida, in `buildEvent`.
- **Due luoghi**: l'evento pubblico ha la posizione *approssimata* (arrotondata a 2 decimali, circa 1 km); l'indirizzo e le coordinate esatte vanno in `ExactPlace`, che il repository salva a parte (riservato dalle regole).
- **Geohash dal punto approssimato**: se lo calcolassimo dal punto esatto, chiunque potrebbe decodificarlo e ritrovare il posto preciso.

## Il codice, pezzo per pezzo
### `geohash.ts`
Il geohash divide il mondo a metà più volte. Ad ogni passo si sceglie la metà dove sta il punto e si scrive un bit (1 = metà alta/est, 0 = bassa/ovest); si alternano longitudine e latitudine. Ogni 5 bit si ottiene un carattere dell'alfabeto `BASE32`. Il ciclo `while` si ferma quando ci sono abbastanza caratteri. `useLng` inverte a ogni giro. Punti vicini danno stringhe con lo stesso inizio.

### `approximate.ts`
`Math.round(valore * 100) / 100`: sposta la virgola, arrotonda, la rimette.

### `validation.ts`
`parseDateTime` accetta solo il formato `AAAA-MM-GGTHH:MM` e controlla che `Date` non dia `NaN`. `parseNumber` accetta anche la virgola decimale (`9,17`). `validateEvent` usa l'operatore `??`: se una funzione restituisce `null` (nessun errore) passa alla successiva, altrimenti si ferma e restituisce quel messaggio.

### `eventService.ts`
`buildEvent` costruisce `NewEvent` + `ExactPlace`. `createEvent` convalida, poi chiama `events.create(...)`: se i dati sono sbagliati lancia un `Error` col messaggio da mostrare, e il repository non viene toccato (c'è un test).

### `CreateEventScreen.tsx`
Un solo stato `input` per tutto il form; `set({campo: valore})` aggiorna un campo senza toccare gli altri. In `handleSubmit` si prova a creare l'evento e il `catch` mostra l'errore. `ProfileGate` decide quale schermata mostrare con il nuovo stato `creating`, e `HomeScreen` ha il bottone "Crea evento".

## Errori incontrati
- ESLint (`prefer-const`) ha segnalato `latRange` e `lngRange` in `geohash.ts`: gli array non vengono riassegnati (se ne cambiano gli elementi, ma la variabile resta la stessa), quindi vanno dichiarati con `const`.
- Avviso del build "chunk più grande di 500 kB": è solo un avviso (pesa soprattutto Firebase), non un errore.

## Esercizio
Il geohash a 6 caratteri copre circa 1 km. Aggiungi un test che confronta `encodeGeohash(45.4523, 9.1731, 5)` con lo stesso punto spostato di 0,01° di latitudine: i primi 4 caratteri sono uguali? E con precisione 7? Spiega a parole perché più caratteri significano più precisione.
