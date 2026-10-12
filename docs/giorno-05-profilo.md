# Giorno 5 – Profilo

**Lettura scelta:** il task dice "foto (solo logica e campo, caricamento reale in Firebase scritto ma non eseguito)". Ho letto che: il campo `fotoUrl` del profilo resta un indirizzo https; esiste un'interfaccia `PhotoStorage` con `upload()`; la versione Firebase (Storage) è scritta e compila ma non è mai eseguita; i test usano una versione finta. Dopo la registrazione chi non ha il profilo deve completarlo prima di vedere la home.

## Perché queste scelte

- **La data si salva, l'età si calcola** (`profile/age.ts`): se salvassi "30 anni" diventerebbe falso al compleanno. La schermata mostra solo l'età, mai la data.
- **Tutto in UTC**: `<input type="date">` dà `"2000-05-31"`. Se la leggessi nel fuso locale, un telefono in un altro fuso potrebbe spostare il compleanno di un giorno vicino alla mezzanotte.
- **Validazione in funzioni pure** (`profile/validation.ts`), come per il login: ogni funzione restituisce un messaggio o `null`. Il parametro `today` si può passare dai test, così non dipendono dalla data vera.
- **Il servizio ricontrolla** (`saveProfile`): la schermata non è l'unica porta d'ingresso; chi salva un profilo passa sempre da `validateProfile`.
- **Foto dietro un'interfaccia** (`PhotoStorage`): stessa idea dei repository.

## Codice pezzo per pezzo

### `age.ts`
`parseBirthDate` controlla la forma con un'espressione regolare e poi rilegge la data: `new Date("2001-02-31")` non dà errore ma diventa il 3 marzo; confrontando `toISOString().slice(0,10)` con il testo originale scopro i giorni inesistenti. `calculateAge` sottrae gli anni e toglie 1 se il compleanno di quest'anno non è ancora arrivato (mese precedente, oppure stesso mese ma giorno precedente). `isAdult` confronta con `MIN_AGE = 18`.

### `validation.ts`
`validateProfile` concatena i controlli con `??` (primo errore vince). `validateBirthDate` rifiuta date non valide, future (età negativa), oltre 120 anni, e sotto i 18 anni con messaggio dedicato. `validatePhotoFile` guarda solo `type` e `size`, quindi si testa senza file veri.

### `profileService.ts`
`saveProfile` valida, poi legge l'eventuale profilo esistente per **conservare `creatoIl`** quando si modifica. I due `as` sono sicuri perché `validateProfile` ha già controllato. `toProfileInput` fa il percorso inverso per precompilare il form.

### `useProfile.ts`
Hook che carica il profilo con `useEffect`. La variabile `cancelled` evita di aggiornare lo stato se il componente è sparito prima della risposta.

### Schermate
`ProfileGate` decide: caricamento → form (se manca il profilo o si sta modificando) → home. `ProfileScreen` tiene i campi in un solo oggetto `input` e un helper `set(patch)` che aggiorna un campo alla volta. `InterestPicker` usa gli stessi id dei tipi evento. `PhotoField` valida il file, chiama `photos.upload` e passa l'indirizzo al form.

### Firebase
`firebasePhotoStorage.ts` carica in `users/{uid}/profile` e restituisce `getDownloadURL`. Compila ma non è eseguito qui. `storage()` si aggiunge in `firebase/app.ts` accanto a `db()` e `auth()`.

## Errori incontrati
Nessuno bloccante: build, lint e 47 test sono passati al primo giro. Il mio checkout locale era in "detached HEAD" e indietro: ho riallineato `main` a `origin/main` prima di scrivere. Nota: per usare davvero le foto servono le regole di Storage (non fanno parte di questo task).

## Esercizio
Aggiungi la regola "il nome non può contenere cifre" in `validateName` con un test in `profile.test.ts`. Poi chiediti: perché il controllo sta in `validation.ts` e non dentro `ProfileScreen`?
