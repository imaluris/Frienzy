# Task 29: elenco eventi da app vera

**Lettura scelta:** le copertine sono provvisorie (gradiente + emoji del tipo, come chiede il task); le vere illustrazioni arrivano in 33a e sostituiranno solo il componente `EventCover`. Il cuore "Salva" ricorda lo stato solo finché la scheda è sullo schermo (stato locale, come da task). Le schede evento sono usate anche in "I miei eventi", quindi sono cambiate anche lì.

## Perché queste scelte
- **Logica fuori dai componenti.** Raggruppamento, ricerca, posti e badge data sono funzioni pure in `src/events/` (`periods.ts`, `search.ts`, `seats.ts`, `dayBadge.ts`): si provano senza disegnare nulla (`listView.test.ts`).
- **Giorni di calendario, non 24 ore.** Un evento alle 00:05 di domani è "Domani" anche se mancano solo 14 ore: `daysFromToday` confronta le mezzanotti locali.
- **"Ultimi posti" non è solo "pochi posti".** Un evento da 2 posti vuoto non è "agli ultimi posti": serve che restino ≤2 posti E che l'evento sia almeno mezzo pieno.
- **Avatar caricati dopo.** Le schede appaiono subito; `useAttendance` carica chi c'è in parallelo e riempie la riga sociale quando arriva. Se un profilo manca o una chiamata fallisce, la scheda resta usabile.
- **Testata propria per la schermata Eventi** (`HomeHeader`): con logo, nome e saluto la barra del titolo sarebbe un doppione, quindi `showsAppHeader` (pura, testata) la nasconde solo lì.

## Il codice, pezzo per pezzo
- `groupByPeriod(events, now)`: mette ogni evento in un "secchio" (oggi/domani/settimana/dopo) e restituisce solo i secchi pieni, in ordine fisso. Gli eventi arrivano già ordinati per data, quindi dentro ogni sezione l'ordine resta giusto.
- `searchEvents`: toglie accenti (`normalize('NFD')` + rimozione dei segni `\p{M}`) e maiuscole, poi chiede che **tutte** le parole siano in titolo o zona.
- `EventCard`: un pulsante grande (la copertina e il corpo) e, **accanto** (non dentro), il cuore con posizione assoluta. Un pulsante dentro un pulsante non è HTML valido e farebbe aprire l'evento a ogni tocco sul cuore.
- `EventCover`: tre strati (gradiente per tipo, due cerchi trasparenti, emoji grande) più il badge a calendario. È `aria-hidden`: è decorazione, le informazioni stanno nel testo.
- `SeatsMeter`: barra con larghezza = quota occupata; il colore cambia con il livello (verde, ocra, rosso).
- `skeleton.css`: gradiente che scorre (`shimmer`), spento con "riduci animazioni".

## Errori incontrati
1. **11 test rotti dopo il primo giro.** Il cuore aveva `aria-label="Salva: <titolo>"`, quindi i test che cercano il pulsante per nome (`/Cena Milano/`) ne trovavano due. Soluzione: etichetta fissa "Salva evento": il titolo non serve, il cuore sta dentro la scheda giusta.
2. **Errore di tipo su `Avatar`**: la taglia `xs` non esisteva; l'ho aggiunta al tipo e al CSS.
3. Un test mio sbagliato: "àperitivo" (con accento) deve **trovare** "aperitivo", non il contrario, perché gli accenti vengono ignorati.

## Cosa ho visto negli screenshot (390x844)
Testata con logo e saluto, ricerca arrotondata, chip dei tipi, sezioni "Domani / Questa settimana / Più avanti" con schede grandi: gerarchia chiara (data > titolo > dettagli), avatar sovrapposti e barra posti leggibili, tocco del cuore a 44px. In "I miei eventi" le stesse schede con "Annulla evento" sotto: coerente. Difetti rimasti: la riga dei chip è ancora tagliata a destra (è lo scorrimento orizzontale, voluto); l'ultimo avatar non mostra "+N" nei dati demo perché i partecipanti sono pochi; copertine ancora provvisorie (33a); stato di caricamento e stato vuoto verificati solo con i test, non con uno screenshot.

## Esercizio per Andrea
In `seats.ts` cambia la soglia di `low` da `left <= 2` a `left <= 3` e lancia `npx vitest run src/events/listView.test.ts`: quale test si rompe e perché? Poi aggiungi tu un test per `seatsInfo(10, 7)`.
