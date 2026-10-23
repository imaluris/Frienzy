# Giorno 19 – Anteprima visiva (modalità demo e screenshot)

## Lettura scelta
Il task chiede una modalità demo e uno script di screenshot. Ho scelto: `VITE_DEMO=1` fa partire l'app con i servizi **in memoria** (gli stessi dei test) riempiti di dati d'esempio, senza Firebase e senza file `.env`. Lo script di screenshot usa `playwright-core` (solo il "telecomando" del browser, senza scaricare browser) con il Chromium già presente nell'ambiente.

## Perché queste scelte
- **Servizi in memoria**: l'app parla solo con interfacce (`AuthService`, `EventRepository`...). Basta consegnarle implementazioni diverse e funziona uguale. Per questo la demo costa poco codice.
- **Import dinamici in `main.tsx`**: con `await import(...)` il codice Firebase viene caricato solo se serve. Prima, senza `.env`, la config Firebase lanciava un errore all'avvio e la pagina restava bianca; in demo quel codice non viene mai eseguito.
- **`playwright-core` come devDependency**: build, lint e test non ne hanno bisogno; serve solo a `npm run shots`.

## Il codice, pezzo per pezzo
- `src/demo/demoPeople.ts`: cinque profili inventati. `DEMO_UID` è l'uid dell'utente "Andrea" che risulta già collegato. L'età si ricava dalla data di nascita (funzione `birth`).
- `src/demo/demoEvents.ts`: ogni evento è una piccola "scheda" (`DemoEventSpec`) con giorni da oggi, zona, posti, chi è confermato o in richiesta. `toNewEvent` la trasforma in un vero `NewEvent` (date relative a oggi, coordinate approssimate, geohash). Ci sono tutti e 7 i tipi, eventi con e senza approvazione, uno pieno (Calcetto: 2 posti, 2 confermati) e uno annullato (organizzato da Andrea, così si apre da "I miei eventi").
- `src/demo/createDemoServices.ts`: crea i servizi in memoria, salva i profili, crea gli eventi e le iscrizioni, annulla quello annullato, poi "registra" l'email demo (la registrazione fa entrare subito).
- `MemoryAuthService` ora accetta una funzione `newUid` (di default `utente-N`): la demo la usa per dare all'utente l'uid `demo-io`, così coincide con il suo profilo d'esempio. `createMemoryServices` accetta l'auth da fuori.
- `scripts/shots/server.ts`: avvia Vite in demo e aspetta che risponda. Lancia `node vite.js` direttamente (non `npx`) altrimenti, al termine, il processo figlio restava vivo e lo script non finiva: errore trovato al primo tentativo.
- `scripts/shots/steps.ts`: elenco dei passi. Ogni passo ricarica la pagina (così riparte dalla home con i dati ricreati) e clicca i bottoni per arrivare alla schermata: i passi sono indipendenti, se uno fallisce gli altri vanno avanti.
- `scripts/shots/run.ts`: apre Chromium (`--no-sandbox`, necessario nel container) in formato 390x844 a doppia densità e salva i PNG in `docs/screenshots/`.

## Errori incontrati
1. Lo script non terminava: causa `npx` (vedi sopra).
2. Il pulsante "Indietro" nel dettaglio si chiama "Torna all'elenco": i passi cercavano il testo sbagliato. Ho reso i passi indipendenti ricaricando la pagina.
3. L'evento annullato non compare nell'elenco pubblico (giusto): l'ho assegnato ad Andrea per raggiungerlo da "I miei eventi".

## Cosa ho visto negli screenshot (difetti, dal più grave)
1. **Dettaglio evento senza azioni**: non c'è nessun pulsante per partecipare, ritirarsi, accettare o annullare (task 20).
2. **Mappa**: senza tile lo sfondo è grigio e i marker finiscono ammassati in basso, alcuni tagliati dal bordo; l'inquadratura non si adatta (task 26).
3. **Navigazione**: la home è una nuvola di bottoni terracotta a capo; non c'è barra a schede, ogni schermata ha solo un link "Indietro" in fondo (task 22).
4. **Elenco eventi**: i filtri occupano più di mezzo schermo; i filtri-tipo sembrano pulsanti d'azione identici alle schede degli eventi; le schede sono tutte terracotta piene senza gerarchia, senza posti rimasti né badge (task 21, 24).
5. **Crea evento**: latitudine e longitudine a mano, menu a tendina semplice per il tipo, date nel formato americano del browser (task 25).
6. **Font**: il testo appare in un carattere di sistema, non in Nunito (task 21).
7. **Dettaglio**: persone senza avatar, righe distanziate in modo uniforme e poco leggibile; schermate in una card bianca che lascia metà pagina vuota (task 21, 24).
8. Home: testo "L'app è in costruzione" da togliere.

## Esercizio per Andrea
In `demoEvents.ts` aggiungi un ottavo evento (per esempio una passeggiata domani mattina con 3 posti) e rilancia `npm run shots`: guarda come compare in `02-eventi.png`. Poi prova a cambiare `max` dell'evento a 1 con una persona confermata e vedi cosa cambia nel dettaglio.

## Come provarla
`VITE_DEMO=1 npm run dev` e apri la pagina in formato telefono; oppure `npm run shots` per rigenerare le immagini.
