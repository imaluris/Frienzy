# Giorno 6 – Regole di sicurezza

**Lettura scelta:** il task chiede regole Firestore + test per l'emulatore "scritti ma non eseguibili qui". Ho letto che: `firestore.rules` e `storage.rules` (la foto del giorno 5 le richiede) sono il prodotto, i test delle regole stanno in `rules-tests/` e **non** fanno parte di `npm test` (servono Java e l'emulatore); in `npm test` ho aggiunto solo un controllo statico leggero. Dove il task non diceva un dettaglio ho scelto: chi è confermato è visibile a tutti gli utenti collegati; richieste e rifiutati solo a diretto interessato e organizzatore.

## Perché le regole
Il codice dell'app gira sul telefono di chiunque: una persona esperta può saltare le schermate e parlare direttamente con Firestore. Quindi i controlli veri devono stare **sul server**, nelle regole. La validazione dell'app (giorno 5) serve a dare messaggi gentili; le regole sono la porta blindata.

## Codice pezzo per pezzo (`firestore.rules`)

### Funzioni di aiuto
- `signedIn()` / `isOwner(uid)`: l'utente è collegato / è proprio quella persona.
- `eventNow(id)` legge l'evento com'è ora con `get()`; `eventAfter(id)` lo legge **dopo** la scrittura con `getAfter()`. Serve perché `FirestoreEventRepository.create` scrive evento e luogo nello stesso batch: mentre si controlla il luogo, l'evento ancora non esiste.
- `isOrganizer(id)`, `isConfirmed(id)`: confrontano `organizzatoreId` con chi chiede, o cercano la partecipazione con stato `confermato`.
- `hasOnly(dati, chiavi)`: i campi devono essere **esattamente** quelli attesi (niente campi extra infilati).

### `users/{uid}`
Si legge se collegati; si scrive solo il proprio documento. `validProfile` ripete i limiti del giorno 5 (nome 2–50, bio 300, interessi dalla lista) e blocca i minorenni: `dataNascita <= request.time - 6575 giorni`. 18 anni sono 6574 o 6575 giorni a seconda dei bisestili: scelgo 6575, quindi chi compie 18 anni può registrarsi al massimo con un giorno di ritardo. `creatoIl` non si può cambiare in modifica.

### `events/{id}`
Creazione: `organizzatoreId` deve essere chi scrive, `stato` deve essere `aperto`, `creatoIl == request.time` (il repository usa `serverTimestamp()`, quindi la data è quella del server e non si può falsificare). Modifica: solo l'organizzatore, senza cambiare `organizzatoreId` e `creatoIl`. Cancellare è vietato: si annulla con `stato = 'annullato'`.

### `events/{id}/privato/luogo`
Lettura: `isOrganizer || isConfirmed`. Chi è in `richiesta` o `rifiutato` non lo vede mai.

### `events/{id}/partecipanti/{uid}`
- **Creare**: solo la propria, con campi esatti, evento `aperto`, e stato iniziale `richiesta` se l'evento richiede approvazione, altrimenti `confermato`. L'operatore `? :` fa la scelta.
- **Aggiornare**: solo l'organizzatore, solo se oggi è `richiesta`, solo verso `confermato`/`rifiutato`, e `diff().affectedKeys().hasOnly(['stato'])` garantisce che cambi solo lo stato.
- **Cancellare** (ritiro): la propria, oppure l'organizzatore.
- **Leggere**: la propria, o l'organizzatore, o quelle già `confermato`.
- La regola `match /{path=**}/partecipanti/{uid}` serve alla ricerca "le mie iscrizioni" (collectionGroup): ognuno trova solo i documenti con `uid` uguale al proprio.

### `storage.rules`
Foto in `users/{uid}/...`: scrive solo il proprietario, solo `image/*`, meno di 5 MB.

## Limiti noti (da riprendere nei task successivi)
- Il **limite dei posti** non è nelle regole (non possono contare i documenti): lo farà la transazione del task 10.
- Chi organizza potrebbe iscriversi al proprio evento: le regole lo permettono; lo vieterà l'app se serve.
- Una ricerca `listByEvent` fatta da un estraneo senza filtro verrebbe rifiutata (le regole valutano ogni documento); nei task 11–12 la query dovrà filtrare per `stato == 'confermato'` per i non organizzatori.

## Checklist (riletta una per una contro le regole)
1. Ognuno scrive solo il proprio profilo – sì (`isOwner`), test "nessuno scrive il profilo di un altro".
2. Solo maggiorenni – sì (`6575 d`), test "minorenni rifiutati".
3. Solo l'organizzatore modifica/annulla – sì, test dedicato; cancellazione vietata.
4. Stato iniziale corretto della partecipazione – sì, due test (libero / con approvazione).
5. Solo l'organizzatore passa richiesta → confermato/rifiutato – sì, test "non si torna indietro" e "non cambia altri campi".
6. Luogo esatto solo organizzatore e confermati – sì, tre test sui ruoli.
7. Nessuna scrittura aperta a tutti – sì, controllato anche da `src/rules.test.ts`.

## Errori incontrati
- `npm i @firebase/rules-unit-testing` falliva (ERESOLVE): l'ultima 5.x vuole `firebase@12`, il progetto usa la 13. Soluzione: la versione `6.0.0`, che accetta la 13.
- I file dei test delle regole finiscono in `*.rules-test.ts`, non `*.test.ts`, così `npm test` non li raccoglie per sbaglio; hanno una configurazione propria (`vitest.rules.config.ts`).

## Come si eseguono (spetta ad Andrea, serve Java)
`npm run test:rules` accende l'emulatore, lancia i test e lo spegne.

## Esercizio
Aggiungi in `participation.rules-test.ts` un test che verifica che un utente **non** possa iscriversi due volte con stato diverso (suggerimento: guarda cosa succede con `setDoc` su un documento già esistente: è una `create` o una `update`?). Poi spiega a parole quale regola lo ferma.
