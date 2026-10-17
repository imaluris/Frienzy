# Giorno 10 – Iscrizione libera con limite posti

## Lettura scelta
Il task chiede "controllo dei posti nel repository e transazione Firebase scritta". L'ho letto così: (1) una regola unica e pura che decide se ci si può iscrivere; (2) un metodo `join` nel repository, **atomico**, con due implementazioni (memoria e Firestore); (3) il limite posti imposto anche dalle regole di sicurezza, perché un client modificato potrebbe saltare il codice dell'app. Non ho aggiunto il bottone "Partecipa" nelle schermate: il task parla di logica e test.

## Perché queste scelte
- **`decideJoin` pura** (`src/participation/joinDecision.ts`): riceve evento, utente, partecipazione esistente e numero di confermati, e risponde `{ ok, stato }` oppure `{ ok: false, motivo }`. Memoria e Firebase la usano entrambe: le regole non possono divergere.
- **Cos'è "atomico"**: controllare i posti e scrivere l'iscrizione devono essere un'unica operazione indivisibile. Se fossero due passi, due persone potrebbero leggere "1 posto libero" e prenderlo entrambe.
- **In memoria**: JavaScript esegue un pezzo di codice senza interruzioni finché non incontra un `await`. Dopo l'unico `await` (la lettura dell'evento) contiamo i confermati e scriviamo nello stesso passo: nessun'altra iscrizione può infilarsi.
- **In Firestore**: `runTransaction` rilegge e ripete tutto se qualcun altro modifica i dati letti nel frattempo. Le transazioni del web SDK non permettono query, quindi non si può "contare i confermati": per questo c'è un contatore in `events/{id}/contatori/posti` (campo `confermati`) che la transazione legge e incrementa.
- **Con approvazione** (`richiedeApprovazione`): nasce `richiesta` e non occupa posti; il controllo dei posti per chi viene accettato arriva nel task 11.

## Il codice, pezzo per pezzo
### `decideJoin`
Una catena di `if` in ordine: evento inesistente → non aperto → sei l'organizzatore → già iscritto → (se serve approvazione: `richiesta`) → posti finiti → `confermato`. Il primo che scatta decide.

### `MemoryParticipationRepository.join`
Legge l'evento, conta i confermati, chiama `decideJoin`; se `ok` chiama `add` con lo stato deciso. Il costruttore ora riceve il repository degli eventi (`createMemoryServices` lo collega).

### `FirestoreParticipationRepository.join`
`tx.get` per evento, contatore e partecipazione; `decideJoin`; poi `tx.set` della partecipazione e, solo se `confermato`, del contatore +1. Scritto e compilato, non eseguito qui.

### `firestore.rules`
- `seatsNow` / `seatsAfter`: valore del contatore prima e dopo la scrittura (`existsAfter`/`getAfter` guardano il batch in corso).
- Creare una partecipazione `confermato` richiede contatore = vecchio + 1 e ≤ `maxPartecipanti`.
- Il contatore si può scrivere solo salendo di 1, insieme alla propria iscrizione confermata.
- Ritiro (decremento) e conferma dell'organizzatore (incremento) arriveranno nei task 15 e 11.

## Errori incontrati
- Un `git reset --hard` è stato negato dal sistema (giustamente: distruttivo). Bastava `git checkout main` e un fast-forward.
- Nessun altro errore. Test delle regole aggiornati ma **non eseguiti** (serve l'emulatore): `npm run test:rules` tocca ad Andrea.

## Esercizio
Aggiungi a `join.test.ts` un test: evento con `maxPartecipanti: 2` e tre iscrizioni simultanee; verifica che i confermati siano esattamente 2. Poi prova a cambiare `>=` in `>` dentro `decideJoin` e guarda quale test si rompe: perché?
