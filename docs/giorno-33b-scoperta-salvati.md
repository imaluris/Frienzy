# Giorno 33b – Scoperta e salvati

## Lettura scelta
Il task chiede tre file a scorrimento nella schermata Eventi ("Per te", "Vicino a te", "Questo weekend"), il salvataggio con il cuore che si ricorda davvero, una scheda "Salvati" dentro "I miei eventi" e il "tira per aggiornare". Ho scelto così:
- Ogni evento ha **un solo tipo**, quindi "interessi in comune" vuol dire "il tipo dell'evento è tra i miei interessi". Con più interessi, l'ordine in cui li ho scelti conta (il primo vale di più), poi la data.
- "Vicino a te" usa un raggio fisso di 25 km e compare **solo** se la posizione è già concessa: se il permesso è già stato dato la leggo da sola, altrimenti la fila resta nascosta (nessuna richiesta a sorpresa; si può sempre usare "Filtra per distanza").
- "Questo weekend" = sabato e domenica del weekend in corso o in arrivo (di sabato/domenica quello di oggi, già passati esclusi).
- Le file si vedono solo quando **non** c'è una ricerca o un filtro attivo: chi cerca vuole la lista, non le vetrine.
- Un evento può comparire sia in una fila sia nella lista sotto: è normale in queste app, ma i test che cercano un titolo ora usano "la prima scheda trovata".
- Gli eventi salvati che sono passati o annullati non compaiono in "Salvati" (restano salvati nel database, semplicemente non sono più in programma).

## Il codice, pezzo per pezzo
- `src/discover/forYou.ts`: `rankForYou` filtra (non miei, tipo tra i miei interessi) e ordina (posizione dell'interesse, poi data). Funzione pura: non tocca l'array ricevuto.
- `src/discover/weekend.ts`: `weekendRange` calcola l'intervallo `[sabato 00:00, lunedì 00:00)` da `getDay()` (0 = domenica); `weekendEvents` filtra e ordina.
- `src/discover/nearby.ts`: `nearbyEvents` usa `distanceToGeohashKm` (già esistente) e ordina per distanza; `formatDistance` scrive "600 m" / "3,4 km" / "13 km".
- `src/discover/sections.ts`: `buildDiscover` mette insieme le tre file (massimo 8 eventi ciascuna).
- `src/saved/`: `SavedRepository` (interfaccia: `listIds`, `add`, `remove`), `MemorySavedRepository` (mappa utente → id con un contatore per sapere chi è stato salvato per ultimo), `SavedContext.tsx` (un solo elenco condiviso: cambia il cuore subito e, se la scrittura fallisce, lo rimette com'era), `savedState.ts` (`toggleId`) e `savedEvents.ts` (dagli id agli eventi).
- `src/firebase/firestoreSavedRepository.ts`: scrive `users/{uid}/salvati/{eventId}` con `{ eventId, creatoIl: serverTimestamp() }` (scritto e compilato, non eseguito).
- `firestore.rules`: sotto `users/{uid}` la sotto-raccolta `salvati` si legge e si scrive solo se sei il proprietario; il documento ha solo `eventId` (uguale all'id del documento) e `creatoIl` uguale a `request.time`; niente update. Test dell'emulatore in `rules-tests/saved.rules-test.ts` (scritti, non eseguiti: serve l'emulatore).
- `src/ui/RailCard.tsx`, `EventRail.tsx`, `screens/DiscoverRails.tsx`, `styles/rails.css`: scheda stretta (232 px) e fila con `scroll-snap-type: x mandatory`, così la scorrimento si ferma su una scheda.
- `src/ui/pullState.ts`, `usePullToRefresh.ts`, `PullToRefresh.tsx`, `styles/pull.css`: tiro il dito, la tirata è la **metà** del movimento (effetto "elastico") fino a un massimo; al rilascio, se ha superato 64 px, parte l'aggiornamento e il cerchio con la freccia gira. Attivo solo se la pagina è in cima (`window.scrollY`).
- `MyEventsScreen` ora ha tre schede (`MineTabs`: Organizzo / Iscrizioni / Salvati, ognuna con il numero) e ogni scheda è un piccolo componente (`MineOrganized`, `MineJoined`, `MineSaved`).
- `useUpcomingEvents` e `useMine` ora restituiscono anche `refresh`, che rilegge i dati **senza** tornare allo scheletro.
- `useMyPosition`: un `useEffect` chiede a `navigator.permissions` se la posizione è già concessa e, solo in quel caso, la legge.

## Errori incontrati e come li ho risolti
1. **Nove test rotti**: "trovati più elementi con quel nome" (l'evento ora è in una fila e nella lista) e "SavedProvider mancante" (l'anteprima di Crea evento mostrava il cuore). Ho aggiunto `saveable={false}` all'anteprima e usato `findAllByRole(...)[0]` dove serve.
2. **Test che dipendevano dal giorno della settimana**: la fila "Questo weekend" fa comparire gli eventi in più a seconda del giorno in cui il test gira. Ho creato `src/test/fixedMonday.ts` che fissa la data a un lunedì (solo `Date`, non i timer).
3. **Le file si fermavano a 16 px dal bordo destro** negli screenshot: la schermata ha 16 px di margine e il corpo della home altri 16, quindi il margine negativo doveva essere 32. Ora `--inset` vale 32 e la fila esce davvero a tutta larghezza, con la prima scheda allineata al resto.
4. **Spazio vuoto sotto i titoli corti** nelle schede strette (avevo messo un'altezza minima per due righe): l'ho tolta.

## Cosa ho visto negli screenshot (390x844)
Scoperta: "Per te" e "Vicino a te" con copertine illustrate, badge data, cuore e il tondo verde "600 m" sulla riga del luogo; la scheda successiva si intravede a destra, segno che si scorre di lato. Salvati: selettore a segmenti con i numeri, schede con cuore pieno, toast "Salvato". Salvati vuoto: illustrazione e invito a toccare il cuore. Tira per aggiornare: cerchio con freccia sopra l'intestazione mentre il contenuto scende. Giudizio: presentabile. Difetti rimasti: lo stesso evento può comparire in due file (Per te e Vicino a te); lo stato vuoto di Salvati riusa l'illustrazione del calendario (un'illustrazione col cuore sarebbe più giusta); il tira-per-aggiornare è provato solo con eventi di tocco simulati, da verificare sul telefono.

## Test
`discover.test.ts` (Per te, weekend per ogni giorno della settimana, vicino, formattazione, sezioni), `saved.test.ts` (repository in memoria, `toggleId`, `savedEvents`), `pullToRefresh.test.tsx` (frenata, soglia, gesto con tocchi simulati, pagina non in cima), `discoverSaved.test.tsx` (file nella schermata, ricerca che le nasconde, salvataggio fino alla scheda Salvati, ripristino del cuore se la scrittura fallisce, "Vicino a te" con posizione già concessa).

## Esercizio per Andrea
In `src/discover/nearby.ts` cambia `NEARBY_RADIUS_KM` da 25 a 5 e guarda cosa succede alla fila "Vicino a te" nella demo. Domanda: perché `weekendRange` usa `new Date(anno, mese, giorno + n)` invece di aggiungere `n * 24 * 3600 * 1000` millisecondi?
