# Giorno 11 – Iscrizione con approvazione

## Lettura scelta
Il task chiede "richiesta, accetta, rifiuta, con i controlli di chi può farlo". L'ho letto così: (1) una regola pura che decide chi può accettare/rifiutare e con quale esito; (2) un metodo `respond` **atomico** nel repository (memoria e Firestore); (3) le regole di sicurezza aggiornate, perché accettare occupa un posto. La richiesta nasce già nel task 10 (`join` con `richiedeApprovazione`). Non ho aggiunto bottoni nelle schermate: il task parla di logica e test.

## Perché queste scelte
- **`decideResponse` pura** (`src/participation/responseDecision.ts`): come `decideJoin`, la usano memoria e Firestore, così non possono divergere. Catena di `if` in ordine: evento inesistente → chi agisce non è l'organizzatore → richiesta inesistente → già decisa → rifiuto (sempre possibile) → evento non aperto → posti finiti → conferma.
- **Il posto si occupa solo all'accettazione**: la richiesta non conta come posto (task 10), quindi il controllo del massimo va rifatto qui. Rifiutare non ha mai bisogno di posti.
- **Atomico**: stesso ragionamento del task 10. In memoria, dopo l'unico `await` controllo e scrittura stanno nello stesso passo. In Firestore con `runTransaction`, che legge anche il contatore `events/{id}/contatori/posti` e lo incrementa.
- **Non si cambia idea**: una richiesta già `confermato` o `rifiutato` non si decide di nuovo (coerente con le regole del task 6).

## Il codice, pezzo per pezzo
- `respondToRequest(participations, eventId, uid, organizerUid, azione)`: sottile, chiama `participations.respond(...)`. È il punto d'ingresso per le future schermate.
- `MemoryParticipationRepository.respond`: legge l'evento, conta i confermati, chiama `decideResponse`, e se `ok` usa `setStatus`.
- `FirestoreParticipationRepository.respond`: `tx.get` di evento, contatore e partecipazione; `decideResponse`; poi `tx.update` dello stato e, se confermato, `tx.set` del contatore +1. Scritto e compilato, non eseguito qui.
- `firestore.rules`:
  - l'`update` della partecipazione, se porta a `confermato`, richiede evento aperto e contatore dopo = contatore prima + 1, non oltre il massimo (`seatsAfter` / `seatsNow`);
  - il contatore può salire di 1 in due casi, scritti come funzioni: `joinsConfirmed` (iscrizione libera, task 10) e `organizerAccepts` (scrive l'organizzatore).
  - Limite noto: le regole non sanno *chi* viene accettato, quindi l'organizzatore potrebbe alzare il contatore senza accettare nessuno. Danneggerebbe solo il proprio evento, ed è comunque limitato al massimo.

## Errori incontrati
- Il primo `npm ci` era partito prima dell'aggiornamento del ramo `main`, quindi mancava Leaflet e il build falliva con "Cannot find module 'leaflet'". Rieseguito `npm ci` dopo l'aggiornamento: risolto. Lezione: aggiorna il codice *prima* di installare.
- Il repository era su "detached HEAD": risolto con `git checkout main`.
- Test delle regole aggiornati ma **non eseguiti** (serve l'emulatore): `npm run test:rules` tocca ad Andrea.

## Esercizio
In `respond.test.ts` c'è il test delle accettazioni simultanee con un posto. Aggiungi un test con `maxPartecipanti: 2` e tre richieste accettate insieme: i confermati devono essere 2. Poi sposta in `decideResponse` il controllo "rifiuto" dopo quello dei posti e guarda quale test si rompe: perché rifiutare con posti finiti deve restare possibile?
